/* إعدادات Tailwind المشتركة بين صفحات الموقع */
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      fontFamily: { cairo: ['Cairo', 'Tajawal', 'sans-serif'] },
      colors: {
        cream: { 50: '#F9F8F3', 100: '#F4F1E8', 200: '#EBE5D6' },
        olive: { 400: '#5C7260', 500: '#4A5D4E', 600: '#3B4E3F', 700: '#2E3E31', 800: '#24312A' },
        gold: { 300: '#E3C996', 400: '#D4B67A', 500: '#C5A059', 600: '#B08A3F' },
      },
      boxShadow: {
        soft: '0 4px 24px rgba(43, 62, 48, 0.08)',
        card: '0 8px 30px rgba(43, 62, 48, 0.10)',
        cinematic: '0 30px 80px rgba(36, 49, 42, 0.45)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.5)' },
          '50%': { transform: 'scale(1.06)', boxShadow: '0 0 0 16px rgba(37, 211, 102, 0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
        fadeUp: 'fadeUp 0.7s ease-out both',
      },
    },
  },
};
