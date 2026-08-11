/* ════════════════════════════════════════════
   Kitchèra — دوال تتعامل مع عناصر DOM تُمرَّر لها كوسائط
   يعمل في المتصفح (window.KitcheraDom) وفي Node (module.exports)
   ════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function core() {
    if (root && root.KitcheraCore) return root.KitcheraCore;
    throw new Error('KitcheraCore غير مُحمّل: تأكد من تحميل src/kitchera-core.js قبل src/kitchera-dom.js');
  }

  var STAR_ON = '#f59e0b';
  var STAR_OFF = '#ffffff';

  function paintStars(stars, rating) {
    Array.prototype.forEach.call(stars || [], function (star) {
      if (Number(star.dataset.val) <= Number(rating)) {
        star.style.color = STAR_ON;
        star.style.textShadow = '0 2px 4px rgba(0,0,0,0.2)';
      } else {
        star.style.color = STAR_OFF;
        star.style.textShadow = 'none';
      }
    });
  }

  function setAddressVisibility(homeInput, container) {
    if (!homeInput || !container) return;
    container.style.display = homeInput.checked ? 'block' : 'none';
  }

  function reviewCardHTML(review) {
    var r = review || {};
    var name = r.name || 'م';
    return '<div class="bg-cream-50 rounded-2xl p-6 shadow-soft border border-cream-200">' +
      '<div class="flex items-center gap-3 mb-3"><div class="w-11 h-11 rounded-full bg-olive-600 text-white flex items-center justify-center font-black">' +
      core().escapeHTML(name[0]) + '</div>' +
      '<div><p class="font-bold text-olive-800">' + core().escapeHTML(r.name) +
      '</p><div class="flex text-sm gap-0.5">' + core().starsHTML(r.rating) + '</div></div></div>' +
      '<p class="text-gray-600 text-sm leading-relaxed">' + core().escapeHTML(r.text) + '</p></div>';
  }

  function contractRowHTML(contract, index) {
    var c = contract || {};
    return '<div class="flex items-center justify-between bg-cream-50 rounded-xl p-4 border border-cream-200">' +
      '<div><p class="font-bold text-olive-800">تعاقد رقم ' + (index + 1) +
      '</p><p class="text-sm text-gray-500">التاريخ: ' + (core().escapeHTML(c.date) || 'غير محدد') + '</p></div>' +
      '<span class="text-gold-500 text-xl"><i class="fas fa-file-invoice"></i></span></div>';
  }

  function nextVideoIndex(current, direction, total) {
    if (!total) return 0;
    return ((current + direction) % total + total) % total;
  }

  var api = {
    paintStars: paintStars,
    setAddressVisibility: setAddressVisibility,
    reviewCardHTML: reviewCardHTML,
    contractRowHTML: contractRowHTML,
    nextVideoIndex: nextVideoIndex
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.KitcheraDom = api;
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : null);
