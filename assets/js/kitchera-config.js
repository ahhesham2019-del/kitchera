/* الإعدادات المشتركة للموقع (واتساب الشركة، برنامج الولاء، Firebase) */
window.KITCHERA_CONFIG = {
  // رقم واتساب الشركة (بصيغة دولية بدون + وبدون أصفار البداية)
  companyWhatsApp: '201066321915',
  contactPhone: '+201122601548',
  contactEmail: 'egyptkitchera@gmail.com',

  // عتبات برنامج الولاء
  requiredContracts: 5,
  requiredAmount: 100000,

  // مفاتيح مشروع Firebase. اتركها فارغة ليعمل الموقع بوضع التخزين المحلي.
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
};

window.KITCHERA_CONFIG.firebaseEnabled = !!window.KITCHERA_CONFIG.firebase.apiKey;

// أسماء متوافقة مع الإصدارات السابقة من الصفحات
window.FIREBASE_CONFIG = window.KITCHERA_CONFIG.firebase;
window.COMPANY_WHATSAPP = window.KITCHERA_CONFIG.companyWhatsApp;
window.REQUIRED_CONTRACTS = window.KITCHERA_CONFIG.requiredContracts;
window.REQUIRED_AMOUNT = window.KITCHERA_CONFIG.requiredAmount;
window.FB_ENABLED = window.KITCHERA_CONFIG.firebaseEnabled;
