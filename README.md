# Kitchèra

موقع صفحة واحدة لشركة Kitchèra للتشطيبات والتصميم الداخلي.

## المحتويات

- `index.html` — الموقع الأساسي (HTML + Tailwind + JavaScript في ملف واحد).
- `kitchera-tailwind.html` — نسخة بديلة من الموقع.
- `images/` — صور المشاريع وهوية العلامة.
- `videos/` — فيديوهات الموقع.
- `robotics-bot/` — أنماط CSS إضافية.
- `src/` — منطق الموقع المشترك القابل للاختبار (`kitchera-core.js` بدون DOM، `kitchera-dom.js` لدوال العرض).
- `tests/` — اختبارات الوحدة (Vitest).

## التشغيل محليًا

الموقع ملفات ثابتة، فيكفي تشغيل خادم بسيط من جذر المشروع:

```bash
python3 -m http.server 8000
```

ثم افتح http://localhost:8000/index.html

## الاختبارات

```bash
npm install
npm test          # تشغيل اختبارات الوحدة
npm run coverage  # تقرير التغطية
```

## النشر

الموقع منشور عبر GitHub Pages من الفرع الرئيسي.
