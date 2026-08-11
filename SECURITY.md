# Security review — Kitchèra

Scope: `index.html`, `kitchera-tailwind.html`, `robotics-bot/style.css`, static assets.
The site is a static front-end (GitHub Pages) whose only backend is Firebase (Auth / Firestore / Storage),
plus outbound links to WhatsApp and a FormSubmit.co endpoint. There is no server code and no SQL database,
so SQL injection, CORS configuration and debug endpoints are not applicable here — the equivalent risks live
in the Firebase security rules and in the DOM rendering code.

## Fixed in this change

| Severity | Issue | Where | Fix |
| --- | --- | --- | --- |
| Critical | `escapeHTML()` was a no-op: it replaced `<` with `<`, `>` with `>` and `"` with `"`, so every "escaped" review name, review text and contract date was injected into `innerHTML` unchanged (stored XSS through the reviews collection). | `index.html` | Escape to `&lt;` / `&gt;` / `&quot;` / `&#039;`. |
| Critical | Reviews, contract dates and user names rendered into `innerHTML` with no escaping at all (stored XSS). | `kitchera-tailwind.html` (`renderReviews`, `loadReviews`, `renderDashboard`, `loadFirebaseContracts`) | Added `escapeHTML()` and applied it to every interpolated value; ratings coerced with `Number()`. |
| High | Firestore / Storage had no security rules in the repo. Any client could read every user document, write `approved: true` reviews (self-published content straight into the XSS sinks above), read other users' invoices and tamper with contract records. | new `firestore.rules`, `storage.rules` | Owner-only access to `users/{uid}` and `contracts`, public read restricted to approved reviews, review creation forced to `approved: false` with `userId == auth.uid` and bounded `rating`/`text`, invoices readable/writable only by their owner. |
| High | Passwords stored in `localStorage` in cleartext in demo mode (`users[email] = { ..., password }`) and compared with `!==`. | `kitchera-tailwind.html` | Store a per-user random salt plus SHA-256 hash via WebCrypto; existing cleartext records are migrated on next successful login. |
| Medium | Invoice upload accepted any file of any size and used the raw client-supplied filename in the Storage path. | both files | Allow-list `image/jpeg|png|webp` and `application/pdf`, 5 MB cap, filename sanitised to `[\w.-]` (also enforced in `storage.rules`). |
| Medium | Unvalidated review input: rating taken from a DOM value with no range check, unbounded comment length. | both files | Integer 1–5 rating check, 1000-char cap, name capped at 100 chars; mirrored in `firestore.rules`. |
| Medium | No CSP or `Permissions-Policy` on `kitchera-tailwind.html`. | `kitchera-tailwind.html` | Added a CSP allow-listing only the CDNs actually used (Tailwind, cdnjs, gstatic/Firebase, Instagram, FormSubmit), `object-src 'none'`, `base-uri 'self'`, plus `Permissions-Policy`. |
| Low | `target="_blank"` links without `rel="noopener noreferrer"` (reverse tabnabbing). | `kitchera-tailwind.html` | Added `rel="noopener noreferrer"`. |

### Deploying the rules

```bash
firebase deploy --only firestore:rules,storage
```

The rules must be deployed for the High-severity findings to actually be closed — the repo file alone changes nothing.

## Checked, not an issue

- **Hardcoded secrets:** none. Both files contain only placeholder Firebase config (`"YOUR_API_KEY"` / empty strings).
  A Firebase Web API key is a public project identifier, not a secret — but it must be paired with the security rules
  above and with an authorised-domains allow-list in the Firebase console.
  The Google site-verification token, company WhatsApp number and company e-mail are public by design.
- **SQL injection:** no SQL and no server-side query construction anywhere.
- **CORS:** no application server; the site sets no CORS headers. Firebase enforces access via rules, not origin.
- **Debug/admin endpoints:** none. No admin UI, no verbose logging of user data (only `console.warn` about missing config).
- **Dependencies:** no package manifest; all libraries load from CDNs at runtime.

## Recommended follow-ups (not done here — they change behaviour or need your decision)

1. **Loyalty rewards are client-trusted.** A signed-in user can append contract entries themselves (either to
   `users/{uid}.contracts` or the `contracts` collection) and trigger the "prize earned" flow without a real invoice.
   The rules limit this to append-only, one entry at a time, on the user's own document, but eligibility still has to be
   verified by staff. A proper fix is a Cloud Function (or manual approval flag) that validates the uploaded invoice and
   writes a `verified: true` field, with the counter only reading verified entries.
2. **Pin the CDN dependencies and add Subresource Integrity.** `https://cdn.tailwindcss.com` is unversioned, and
   `kitchera-tailwind.html` still loads Firebase 9.23.0 while `index.html` uses 10.12.2. A compromised CDN currently gets
   full script execution. Prefer vendored/versioned files with `integrity` hashes; the Tailwind CDN build also requires
   `'unsafe-eval'` in the CSP, which self-hosting a built CSS file would remove.
3. **FormSubmit endpoint has `_captcha: false`** and the company e-mail address in client-side code, so anyone can script
   mail to that inbox. Consider a captcha or moving the submission behind a small serverless function.
4. **Review moderation is manual.** Rules force `approved: false` on creation; approving must happen from the Firebase
   console or the Admin SDK. Do not add a client-side approval path.
5. **Serve real HTTP security headers.** `<meta http-equiv>` CSP works but cannot express `frame-ancestors` or HSTS;
   if the site moves off GitHub Pages, set the headers at the edge.
