/* أدوات مشتركة بين صفحات موقع Kitchèra */
window.Kitchera = (function () {
  'use strict';

  var config = window.KITCHERA_CONFIG || {};

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* بناء رسالة نصية من أسطر، مع تجاهل الأسطر الفارغة */
  function buildMessage(lines) {
    return lines.filter(Boolean).join('\n');
  }

  function whatsAppURL(message, number) {
    return 'https://wa.me/' + (number || config.companyWhatsApp) + '?text=' + encodeURIComponent(message);
  }

  function openWhatsApp(message, number) {
    window.open(whatsAppURL(message, number), '_blank');
  }

  function todayLabel() {
    return new Date().toLocaleDateString('ar-EG');
  }

  function toggleHidden(el, hidden) {
    if (typeof el === 'string') el = byId(el);
    if (el) el.classList.toggle('hidden', hidden);
  }

  /* زر قائمة الجوال: فتح/إغلاق وإغلاق تلقائي بعد اختيار رابط */
  function initMobileMenu(buttonId, menuId, linkSelector) {
    var button = byId(buttonId);
    var menu = byId(menuId);
    if (!button || !menu) return;
    button.addEventListener('click', function () { menu.classList.toggle('hidden'); });
    document.querySelectorAll(linkSelector || '.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () { menu.classList.add('hidden'); });
    });
  }

  /* التمرير السلس لروابط الأقسام */
  function initSmoothAnchors(selector, offset) {
    document.querySelectorAll(selector || 'a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        window.scrollTo({ top: target.offsetTop - (offset == null ? 80 : offset), behavior: 'smooth' });
      });
    });
  }

  /* إغلاق النوافذ عند الضغط على الخلفية */
  function initBackdropDismiss(selector, onDismiss) {
    document.querySelectorAll(selector).forEach(function (overlay) {
      overlay.addEventListener('click', function (event) {
        if (event.target !== overlay) return;
        if (onDismiss) onDismiss(overlay);
        else overlay.classList.add('hidden');
      });
    });
  }

  /* تعبئة قوائم التاريخ (أيام / سنوات) */
  function fillSelect(select, values) {
    if (typeof select === 'string') select = byId(select);
    if (!select) return;
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function range(from, to) {
    var out = [];
    for (var i = from; i <= to; i++) out.push(i);
    return out;
  }

  function fillDayOptions(select) {
    fillSelect(select, range(1, 31));
  }

  function fillYearOptions(select, extraYears) {
    var year = new Date().getFullYear();
    fillSelect(select, range(year, year + (extraYears == null ? 2 : extraYears)));
  }

  /* نجوم التقييم كـ HTML */
  function starsHTML(rating, options) {
    var opts = options || {};
    var emptyClass = opts.emptyClass || 'text-cream-200';
    var out = '';
    for (var i = 1; i <= 5; i++) {
      var filled = i <= rating;
      var style = filled || !opts.outlineEmpty ? 's' : 'r';
      out += '<i class="fa' + style + ' fa-star ' + (filled ? 'text-gold-500' : emptyClass) + '"></i>';
    }
    return out;
  }

  /* بطاقة تقييم عميل واحدة */
  function reviewCardHTML(review, starOptions) {
    var name = review.name || 'مستخدم';
    return '<div class="bg-cream-50 rounded-2xl p-6 border border-cream-200 shadow-soft">' +
      '<div class="flex items-center gap-3 mb-3">' +
      '<span class="w-11 h-11 rounded-full bg-olive-600 text-white flex items-center justify-center font-bold">' +
      escapeHTML(name.charAt(0)) + '</span>' +
      '<div><p class="font-bold text-olive-800">' + escapeHTML(name) + '</p>' +
      '<div class="flex text-sm gap-0.5">' + starsHTML(review.rating, starOptions) + '</div></div></div>' +
      '<p class="text-gray-600 text-sm leading-relaxed">' + escapeHTML(review.text) + '</p></div>';
  }

  function reviewsHTML(reviews, starOptions) {
    return reviews.map(function (review) { return reviewCardHTML(review, starOptions); }).join('');
  }

  /* عنصر واحد في سجل التعاقدات */
  function contractItemHTML(contract, index, options) {
    var opts = options || {};
    var element = opts.tag || 'li';
    return '<' + element + ' class="flex items-center justify-between bg-cream-50 rounded-xl px-4 py-3 border border-cream-200">' +
      '<span class="font-bold text-olive-800">تعاقد رقم ' + (index + 1) + '</span>' +
      '<span class="text-gray-500 text-xs">' + escapeHTML(contract.date || 'غير محدد') + '</span>' +
      (opts.iconClass ? '<span class="text-gold-500 text-xl"><i class="' + opts.iconClass + '"></i></span>' : '') +
      '</' + element + '>';
  }

  function contractsHTML(contracts, options) {
    return contracts.map(function (contract, index) {
      return contractItemHTML(contract, index, options);
    }).join('');
  }

  /* رفع فاتورة إلى Firebase Storage وإرجاع رابط التنزيل */
  function uploadInvoiceFile(file, uid) {
    var ref = firebase.storage().ref('invoices/' + uid + '/' + Date.now() + '_' + file.name);
    return ref.put(file).then(function () { return ref.getDownloadURL(); });
  }

  /* رسالة واتساب الجائزة بعد إكمال التعاقدات */
  function rewardMessage(customerName, contracts) {
    var dates = contracts.map(function (contract) { return contract.date; }).filter(Boolean).join('، ');
    return buildMessage([
      'تم إكمال التعاقدات المطلوبة!',
      'اسم العميل: ' + customerName,
      'عدد التعاقدات: ' + contracts.length,
      'تواريخ التعاقدات: ' + (dates || 'غير محددة'),
      'العميل يستحق الجائزة المقدمة من Kitchèra.',
    ]);
  }

  return {
    config: config,
    byId: byId,
    escapeHTML: escapeHTML,
    buildMessage: buildMessage,
    whatsAppURL: whatsAppURL,
    openWhatsApp: openWhatsApp,
    todayLabel: todayLabel,
    toggleHidden: toggleHidden,
    initMobileMenu: initMobileMenu,
    initSmoothAnchors: initSmoothAnchors,
    initBackdropDismiss: initBackdropDismiss,
    fillSelect: fillSelect,
    fillDayOptions: fillDayOptions,
    fillYearOptions: fillYearOptions,
    starsHTML: starsHTML,
    reviewCardHTML: reviewCardHTML,
    reviewsHTML: reviewsHTML,
    contractItemHTML: contractItemHTML,
    contractsHTML: contractsHTML,
    uploadInvoiceFile: uploadInvoiceFile,
    rewardMessage: rewardMessage,
  };
})();
