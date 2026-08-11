import { describe, it, expect } from 'vitest';
import core from '../src/kitchera-core.js';

describe('escapeHTML', () => {
  it('escapes every HTML-significant character', () => {
    expect(core.escapeHTML('<script>alert("x")</script>'))
      .toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  });

  it("escapes ampersands first so entities are not double-broken", () => {
    expect(core.escapeHTML('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });

  it("escapes single quotes", () => {
    expect(core.escapeHTML("it's")).toBe('it&#039;s');
  });

  it('turns null and undefined into an empty string', () => {
    expect(core.escapeHTML(null)).toBe('');
    expect(core.escapeHTML(undefined)).toBe('');
  });

  it('stringifies non-string values', () => {
    expect(core.escapeHTML(42)).toBe('42');
    expect(core.escapeHTML(0)).toBe('0');
  });

  it('leaves Arabic text untouched', () => {
    expect(core.escapeHTML('مطبخ عصري')).toBe('مطبخ عصري');
  });
});

describe('formatVisitDate', () => {
  it('pads month and day to two digits', () => {
    expect(core.formatVisitDate('2026', '3', '7')).toBe('2026-03-07');
  });

  it('keeps already padded values', () => {
    expect(core.formatVisitDate(2026, 12, 25)).toBe('2026-12-25');
  });

  it('returns an empty string when any part is missing', () => {
    expect(core.formatVisitDate('', '3', '7')).toBe('');
    expect(core.formatVisitDate('2026', '', '7')).toBe('');
    expect(core.formatVisitDate('2026', '3', '')).toBe('');
  });
});

describe('visitTypeLabel', () => {
  it('maps the known visit types', () => {
    expect(core.visitTypeLabel('home')).toBe('منزلية 🏠');
    expect(core.visitTypeLabel('showroom')).toBe('في المقر 🏢');
    expect(core.visitTypeLabel('office')).toBe('في المقر 🏢');
  });

  it('returns an empty label for unknown values', () => {
    expect(core.visitTypeLabel('')).toBe('');
    expect(core.visitTypeLabel(undefined)).toBe('');
  });
});

describe('buildContactMessage', () => {
  const full = {
    name: 'أحمد',
    phone: '01000000000',
    email: 'a@example.com',
    service: 'مطبخ',
    visitType: 'منزلية 🏠',
    address: 'القاهرة',
    date: '2026-03-07',
    time: '18:00',
    details: 'تفاصيل'
  };

  it('includes every provided field', () => {
    const msg = core.buildContactMessage(full);
    expect(msg).toContain('الاسم: أحمد');
    expect(msg).toContain('رقم التليفون: 01000000000');
    expect(msg).toContain('الإيميل: a@example.com');
    expect(msg).toContain('نوع الخدمة: مطبخ');
    expect(msg).toContain('نوع الزيارة: منزلية 🏠');
    expect(msg).toContain('العنوان: القاهرة');
    expect(msg).toContain('الموعد: 2026-03-07 18:00');
    expect(msg).toContain('التفاصيل: تفاصيل');
  });

  it('omits optional lines that are empty', () => {
    const msg = core.buildContactMessage({ name: 'أحمد', phone: '0100' });
    expect(msg).not.toContain('الإيميل');
    expect(msg).not.toContain('العنوان');
    expect(msg).not.toContain('الموعد');
    expect(msg).not.toContain('التفاصيل');
  });

  it('falls back to "غير محدد" when no service is chosen', () => {
    expect(core.buildContactMessage({ name: 'أحمد' })).toContain('نوع الخدمة: غير محدد');
  });

  it('prints the date without a trailing time when time is missing', () => {
    expect(core.buildContactMessage({ date: '2026-03-07' })).toContain('الموعد: 2026-03-07 \n');
  });

  it('tolerates being called with no arguments', () => {
    expect(core.buildContactMessage()).toContain('طلب جديد من موقع Kitchèra');
  });
});

describe('whatsappUrl', () => {
  it('encodes the message into the wa.me link', () => {
    expect(core.whatsappUrl('201066321915', 'a b&c'))
      .toBe('https://wa.me/201066321915?text=a%20b%26c');
  });

  it('encodes newlines and Arabic text', () => {
    const url = core.whatsappUrl('123', 'سطر\nآخر');
    expect(url).toContain('%0A');
    expect(url).not.toContain('\n');
  });

  it('handles an empty message', () => {
    expect(core.whatsappUrl('123')).toBe('https://wa.me/123?text=');
  });
});

describe('loyalty program rules', () => {
  const make = (n) => Array.from({ length: n }, (_, i) => ({ date: `2026-01-0${i + 1}` }));

  it('counts contracts defensively', () => {
    expect(core.contractCount(make(3))).toBe(3);
    expect(core.contractCount(undefined)).toBe(0);
    expect(core.contractCount(null)).toBe(0);
    expect(core.contractCount('nope')).toBe(0);
  });

  it('awards the prize only at or above the required number of contracts', () => {
    expect(core.hasEarnedPrize(make(4))).toBe(false);
    expect(core.hasEarnedPrize(make(5))).toBe(true);
    expect(core.hasEarnedPrize(make(6))).toBe(true);
  });

  it('honours a custom threshold', () => {
    expect(core.hasEarnedPrize(make(2), 2)).toBe(true);
    expect(core.hasEarnedPrize(make(2), 3)).toBe(false);
  });

  it('never reports a negative remaining count', () => {
    expect(core.remainingContracts(make(0))).toBe(5);
    expect(core.remainingContracts(make(2))).toBe(3);
    expect(core.remainingContracts(make(9))).toBe(0);
  });

  it('formats the progress label', () => {
    expect(core.contractProgressLabel(make(2))).toBe('2/5');
    expect(core.contractProgressLabel(make(1), 3)).toBe('1/3');
  });

  it('requires five contracts by default', () => {
    expect(core.REQUIRED_CONTRACTS).toBe(5);
  });
});

describe('userLabel', () => {
  it('prefers the display name, then the email', () => {
    expect(core.userLabel({ displayName: 'أحمد', email: 'a@b.c' })).toBe('أحمد');
    expect(core.userLabel({ email: 'a@b.c' })).toBe('a@b.c');
  });

  it('returns an empty string for a missing user', () => {
    expect(core.userLabel(null)).toBe('');
    expect(core.userLabel({})).toBe('');
  });
});

describe('buildInvoiceMessage', () => {
  it('reports client, date and contract count', () => {
    const msg = core.buildInvoiceMessage({
      user: { email: 'a@b.c' },
      date: '١٠/٨/٢٠٢٦',
      count: 3
    });
    expect(msg).toContain('اسم العميل: a@b.c');
    expect(msg).toContain('تاريخ الرفع: ١٠/٨/٢٠٢٦');
    expect(msg).toContain('عدد التعاقدات: 3');
  });

  it('defaults the count to zero', () => {
    expect(core.buildInvoiceMessage({})).toContain('عدد التعاقدات: 0');
  });
});

describe('buildCongratsMessage', () => {
  it('lists all contract dates separated by an Arabic comma', () => {
    const msg = core.buildCongratsMessage({
      user: { displayName: 'أحمد' },
      contracts: [{ date: '1/1' }, { date: '2/2' }]
    });
    expect(msg).toContain('عدد التعاقدات: 2');
    expect(msg).toContain('تواريخ التعاقدات: 1/1، 2/2');
  });

  it('handles missing dates and missing contracts', () => {
    expect(core.buildCongratsMessage({ contracts: [{}] })).toContain('تواريخ التعاقدات: ');
    expect(core.buildCongratsMessage({})).toContain('عدد التعاقدات: 0');
  });
});

describe('invoiceStoragePath', () => {
  it('namespaces uploads per user and timestamp', () => {
    expect(core.invoiceStoragePath('uid1', 1700000000000, 'bill.pdf'))
      .toBe('invoices/uid1/1700000000000_bill.pdf');
  });
});

describe('isValidReview', () => {
  it('accepts a non-empty text with a rating from one to five', () => {
    expect(core.isValidReview('رائع', 5)).toBe(true);
    expect(core.isValidReview('رائع', '1')).toBe(true);
  });

  it('rejects blank text or a zero rating', () => {
    expect(core.isValidReview('', 5)).toBe(false);
    expect(core.isValidReview('   ', 5)).toBe(false);
    expect(core.isValidReview('رائع', 0)).toBe(false);
    expect(core.isValidReview('رائع', undefined)).toBe(false);
  });

  it('rejects out-of-range and non-integer ratings', () => {
    expect(core.isValidReview('رائع', 6)).toBe(false);
    expect(core.isValidReview('رائع', -1)).toBe(false);
    expect(core.isValidReview('رائع', 3.5)).toBe(false);
    expect(core.isValidReview('رائع', 'abc')).toBe(false);
  });
});

describe('trimReviewText', () => {
  it('trims surrounding whitespace', () => {
    expect(core.trimReviewText('  رائع  ')).toBe('رائع');
  });

  it('caps the text at the maximum review length', () => {
    expect(core.trimReviewText('x'.repeat(1500))).toHaveLength(core.REVIEW_MAX_LENGTH);
  });

  it('turns missing input into an empty string', () => {
    expect(core.trimReviewText(null)).toBe('');
    expect(core.trimReviewText(undefined)).toBe('');
  });
});

describe('validateInvoiceFile', () => {
  var ok = { type: 'application/pdf', size: 1024 };

  it('accepts the allowed types within the size limit', () => {
    expect(core.validateInvoiceFile(ok)).toBeNull();
    expect(core.validateInvoiceFile({ type: 'image/jpeg', size: 1 })).toBeNull();
    expect(core.validateInvoiceFile({ type: 'image/png', size: core.INVOICE_MAX_BYTES })).toBeNull();
    expect(core.validateInvoiceFile({ type: 'image/webp', size: 1 })).toBeNull();
  });

  it('rejects a disallowed type', () => {
    expect(core.validateInvoiceFile({ type: 'application/x-msdownload', size: 1 }))
      .toContain('صيغة الملف غير مسموحة');
    expect(core.validateInvoiceFile({ type: '', size: 1 })).not.toBeNull();
  });

  it('rejects a file over five megabytes', () => {
    expect(core.validateInvoiceFile({ type: 'application/pdf', size: core.INVOICE_MAX_BYTES + 1 }))
      .toContain('حجم الملف كبير');
  });

  it('rejects a missing file', () => {
    expect(core.validateInvoiceFile(null)).not.toBeNull();
  });
});

describe('safeFileName', () => {
  it('replaces path separators and other unsafe characters', () => {
    expect(core.safeFileName('../../etc/passwd')).toBe('.._.._etc_passwd');
    expect(core.safeFileName('my bill (1).pdf')).toBe('my_bill__1_.pdf');
  });

  it('keeps word characters, dots and dashes', () => {
    expect(core.safeFileName('invoice-2026_01.pdf')).toBe('invoice-2026_01.pdf');
  });

  it('keeps only the last 80 characters so the extension survives', () => {
    const name = 'a'.repeat(200) + '.pdf';
    const safe = core.safeFileName(name);
    expect(safe).toHaveLength(80);
    expect(safe.endsWith('.pdf')).toBe(true);
  });
});

describe('starsHTML', () => {
  it('always renders five stars', () => {
    expect(core.starsHTML(3).match(/fa-star/g)).toHaveLength(5);
  });

  it('fills exactly the rated stars', () => {
    const html = core.starsHTML(3);
    expect(html.match(/fas fa-star/g)).toHaveLength(3);
    expect(html.match(/far fa-star/g)).toHaveLength(2);
  });

  it('renders no filled star for a zero or missing rating', () => {
    expect(core.starsHTML(0)).not.toContain('fas fa-star');
    expect(core.starsHTML(undefined)).not.toContain('fas fa-star');
  });

  it('caps at five filled stars', () => {
    expect(core.starsHTML(9).match(/fas fa-star/g)).toHaveLength(5);
  });
});

describe('galleryImagesHTML', () => {
  it('renders one lazy-loaded figure per image with a numbered alt text', () => {
    const html = core.galleryImagesHTML('kitchen', ['a.jpg', 'b.jpg']);
    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html).toContain('alt="مطبخ عصري 1"');
    expect(html).toContain('alt="مطبخ عصري 2"');
    expect(html).toContain('loading="lazy"');
  });

  it('escapes image paths so a crafted name cannot break out of the attribute', () => {
    const html = core.galleryImagesHTML('kitchen', ['a".jpg']);
    expect(html).toContain('a&quot;.jpg');
    expect(html).not.toContain('a".jpg');
  });

  it('returns an empty string for an unknown category or no images', () => {
    expect(core.galleryImagesHTML('kitchen', [])).toBe('');
    expect(core.galleryImagesHTML('nope')).toBe('');
  });
});
