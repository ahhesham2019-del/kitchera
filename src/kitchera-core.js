/* ════════════════════════════════════════════
   Kitchèra — منطق مشترك خالٍ من الاعتماد على DOM
   يعمل في المتصفح (window.KitcheraCore) وفي Node (module.exports)
   ════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var REQUIRED_CONTRACTS = 5;
  var WHATSAPP_COMPANY = '201066321915';

  var INVOICE_MAX_BYTES = 5 * 1024 * 1024;
  var INVOICE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  var REVIEW_MAX_LENGTH = 1000;

  var CATEGORY_NAMES = {
    kitchen: 'مطبخ عصري',
    bedroom: 'جناح نوم فاخر',
    furniture: 'أثاث متكامل فاخر'
  };

  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatVisitDate(year, month, day) {
    if (!year || !month || !day) return '';
    return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  }

  function visitTypeLabel(value) {
    if (value === 'home') return 'منزلية 🏠';
    if (value === 'showroom' || value === 'office') return 'في المقر 🏢';
    return '';
  }

  function buildContactMessage(fields) {
    var f = fields || {};
    var message = '📩 طلب جديد من موقع Kitchèra\n\n' +
      'الاسم: ' + (f.name || '') + '\n' +
      'رقم التليفون: ' + (f.phone || '') + '\n';
    if (f.email) message += 'الإيميل: ' + f.email + '\n';
    message += 'نوع الخدمة: ' + (f.service || 'غير محدد') + '\n' +
      'نوع الزيارة: ' + (f.visitType || '') + '\n';
    if (f.address) message += 'العنوان: ' + f.address + '\n';
    if (f.date) message += 'الموعد: ' + f.date + ' ' + (f.time || '') + '\n';
    if (f.details) message += 'التفاصيل: ' + f.details + '\n';
    return message;
  }

  function whatsappUrl(phone, message) {
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message || '');
  }

  function contractCount(contracts) {
    return Array.isArray(contracts) ? contracts.length : 0;
  }

  function hasEarnedPrize(contracts, required) {
    var target = typeof required === 'number' ? required : REQUIRED_CONTRACTS;
    return contractCount(contracts) >= target;
  }

  function remainingContracts(contracts, required) {
    var target = typeof required === 'number' ? required : REQUIRED_CONTRACTS;
    return Math.max(0, target - contractCount(contracts));
  }

  function contractProgressLabel(contracts, required) {
    var target = typeof required === 'number' ? required : REQUIRED_CONTRACTS;
    return contractCount(contracts) + '/' + target;
  }

  function userLabel(user) {
    if (!user) return '';
    return user.displayName || user.email || '';
  }

  function buildInvoiceMessage(info) {
    var i = info || {};
    return '📄 تم رفع فاتورة تعاقد جديدة!\n' +
      'اسم العميل: ' + userLabel(i.user) + '\n' +
      'تاريخ الرفع: ' + (i.date || '') + '\n' +
      'عدد التعاقدات: ' + (i.count || 0);
  }

  function buildCongratsMessage(info) {
    var i = info || {};
    var contracts = Array.isArray(i.contracts) ? i.contracts : [];
    var dates = contracts.map(function (c) { return (c && c.date) || ''; }).join('، ');
    return 'تم إكمال التعاقدات المطلوبة!\n' +
      'اسم العميل: ' + userLabel(i.user) + '\n' +
      'عدد التعاقدات: ' + contracts.length + '\n' +
      'تواريخ التعاقدات: ' + dates + '\n' +
      'العميل يستحق الجائزة المقدمة من Kitchèra.';
  }

  function invoiceStoragePath(uid, timestamp, fileName) {
    return 'invoices/' + uid + '/' + timestamp + '_' + fileName;
  }

  function isValidReview(text, rating) {
    var n = Number(rating);
    return Boolean(String(text || '').trim()) && Number.isInteger(n) && n >= 1 && n <= 5;
  }

  function trimReviewText(text) {
    return String(text == null ? '' : text).trim().slice(0, REVIEW_MAX_LENGTH);
  }

  function validateInvoiceFile(file) {
    if (!file || INVOICE_ALLOWED_TYPES.indexOf(file.type) === -1) {
      return 'صيغة الملف غير مسموحة. أرفق صورة (JPG / PNG / WEBP) أو ملف PDF.';
    }
    if (file.size > INVOICE_MAX_BYTES) {
      return 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.';
    }
    return null;
  }

  function safeFileName(name) {
    return String(name).replace(/[^\w.\-]/g, '_').slice(-80);
  }

  function starsHTML(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      var filled = i <= Number(rating);
      html += '<i class="fa' + (filled ? 's' : 'r') + ' fa-star ' +
        (filled ? 'text-gold-500' : 'text-gray-300') + '"></i>';
    }
    return html;
  }

  function galleryImagesHTML(category, images) {
    var name = CATEGORY_NAMES[category] || '';
    return (images || []).map(function (src, i) {
      return '<div class="group rounded-2xl overflow-hidden shadow-md border border-cream-200">' +
        '<img src="' + escapeHTML(src) + '" alt="' + escapeHTML(name + ' ' + (i + 1)) +
        '" class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async">' +
        '</div>';
    }).join('');
  }

  var api = {
    REQUIRED_CONTRACTS: REQUIRED_CONTRACTS,
    WHATSAPP_COMPANY: WHATSAPP_COMPANY,
    INVOICE_MAX_BYTES: INVOICE_MAX_BYTES,
    INVOICE_ALLOWED_TYPES: INVOICE_ALLOWED_TYPES,
    REVIEW_MAX_LENGTH: REVIEW_MAX_LENGTH,
    CATEGORY_NAMES: CATEGORY_NAMES,
    escapeHTML: escapeHTML,
    formatVisitDate: formatVisitDate,
    visitTypeLabel: visitTypeLabel,
    buildContactMessage: buildContactMessage,
    whatsappUrl: whatsappUrl,
    contractCount: contractCount,
    hasEarnedPrize: hasEarnedPrize,
    remainingContracts: remainingContracts,
    contractProgressLabel: contractProgressLabel,
    userLabel: userLabel,
    buildInvoiceMessage: buildInvoiceMessage,
    buildCongratsMessage: buildCongratsMessage,
    invoiceStoragePath: invoiceStoragePath,
    isValidReview: isValidReview,
    trimReviewText: trimReviewText,
    validateInvoiceFile: validateInvoiceFile,
    safeFileName: safeFileName,
    starsHTML: starsHTML,
    galleryImagesHTML: galleryImagesHTML
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.KitcheraCore = api;
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : null);
