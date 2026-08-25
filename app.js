// ================================================================
// KITCHÈRA - المحرك التفاعلي للموقع (فيديوهات، معارض، تقييمات، تفاعل)
// ================================================================

// الحالة العامة للتطبيق
let currentVideoIndex = 0;
let currentGalleryCategory = "مطبخ عصري";
let currentModalIndex = 0;
let currentModalCategory = "مطبخ عصري";
let currentReviews = [];

// عند اكتمال تحميل المستند
document.addEventListener('DOMContentLoaded', () => {
  initVideoPlayer();
  initGallerySection();
  initReviewsSystem();
  initParallaxAndUI();
});

/* ================================================================
 * 1. مشغل الفيديوهات الموثقة (20 فيديو مع قائمة تشغيل ذكية)
 * ================================================================ */
function initVideoPlayer() {
  const mainVideo = document.getElementById('mainVideo');
  const playlistContainer = document.getElementById('playlist');
  const videoCountEl = document.getElementById('videoCount');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const videoLoader = document.getElementById('videoLoader');

  if (!videosData || videosData.length === 0) return;

  // تحديث عداد الفيديوهات
  if (videoCountEl) {
    videoCountEl.textContent = videosData.length;
  }

  // بناء قائمة التشغيل الأفقية الأنيقة
  if (playlistContainer) {
    playlistContainer.innerHTML = videosData.map((video, index) => `
      <div class="playlist-card shrink-0 w-64 sm:w-72 bg-white rounded-2xl p-3 border-2 ${index === 0 ? 'border-gold-500 bg-gold-50/20' : 'border-cream-200'} cursor-pointer transition-all duration-300 hover:shadow-card hover:-translate-y-1 group"
           data-index="${index}" onclick="selectVideo(${index})">
        <div class="relative w-full h-32 rounded-xl overflow-hidden bg-black/90 mb-2.5">
          <img src="${video.poster}" alt="${video.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

          <!-- شارة رقم الفيديو والمدة -->
          <span class="absolute top-2 right-2 bg-black/75 text-gold-400 text-xs font-black px-2.5 py-1 rounded-lg border border-gold-400/30 backdrop-blur-sm">
            #${video.id}
          </span>
          <span class="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
            <i class="far fa-clock text-gold-400 text-[10px] ml-1"></i>${video.duration}
          </span>

          <!-- زر تشغيل مصغر في المنتصف -->
          <div class="video-play-badge absolute inset-0 flex items-center justify-center">
            <span class="w-10 h-10 rounded-full ${index === 0 ? 'bg-gold-500 text-olive-950' : 'bg-black/60 text-white group-hover:bg-gold-500 group-hover:text-olive-950'} flex items-center justify-center text-sm shadow-md transition-all">
              <i class="fas ${index === 0 ? 'fa-volume-high' : 'fa-play'}"></i>
            </span>
          </div>
        </div>

        <div class="text-right">
          <span class="inline-block text-[11px] font-black text-gold-600 mb-1">${video.tag || video.category}</span>
          <h5 class="text-sm font-black text-olive-950 line-clamp-1 group-hover:text-gold-600 transition-colors">${video.title}</h5>
          <p class="text-xs text-stone-600 line-clamp-1 mt-0.5 font-medium">${video.subtitle || ''}</p>
        </div>
      </div>
    `).join('');
  }

  // مستمعي أحداث الفيديو
  if (mainVideo) {
    mainVideo.addEventListener('play', () => {
      updatePlayPauseUI(true);
    });

    mainVideo.addEventListener('pause', () => {
      updatePlayPauseUI(false);
    });

    mainVideo.addEventListener('ended', () => {
      // الانتقال التلقائي للفيديو التالي عند انتهاء الحالي
      nextVideo(1, true);
    });

    mainVideo.addEventListener('waiting', () => {
      if (videoLoader) videoLoader.classList.remove('hidden');
    });

    mainVideo.addEventListener('canplay', () => {
      if (videoLoader) videoLoader.classList.add('hidden');
    });

    mainVideo.addEventListener('playing', () => {
      if (videoLoader) videoLoader.classList.add('hidden');
    });

    // تحميل الفيديو الأول افتراضياً
    loadVideo(0, false);
  }
}

// دالة اختيار فيديو من القائمة
window.selectVideo = function (index) {
  loadVideo(index, true);
};

// دالة تحميل الفيديو
function loadVideo(index, autoPlay = false) {
  const mainVideo = document.getElementById('mainVideo');
  const videoTitle = document.getElementById('videoTitle');
  const videoSubtitle = document.getElementById('videoSubtitle');
  const playlistCards = document.querySelectorAll('.playlist-card');

  if (!videosData || !videosData[index] || !mainVideo) return;

  currentVideoIndex = index;
  const video = videosData[index];

  // تحديث مسار الفيديو والبوستر
  if (mainVideo.getAttribute('src') !== video.src) {
    mainVideo.src = video.src;
  }
  mainVideo.poster = video.poster;

  // تحديث النصوص
  if (videoTitle) videoTitle.textContent = video.title;
  if (videoSubtitle) videoSubtitle.textContent = video.subtitle || video.desc;

  // تحديث الكارت النشط في القائمة
  playlistCards.forEach((card, i) => {
    const isCurrent = i === index;
    card.classList.toggle('border-gold-500', isCurrent);
    card.classList.toggle('bg-gold-50/20', isCurrent);
    card.classList.toggle('border-cream-200', !isCurrent);

    const badgeIcon = card.querySelector('.video-play-badge i');
    const badgeBg = card.querySelector('.video-play-badge span');
    if (badgeIcon && badgeBg) {
      if (isCurrent) {
        badgeBg.className = 'w-10 h-10 rounded-full bg-gold-500 text-olive-950 flex items-center justify-center text-sm shadow-md transition-all scale-110';
        badgeIcon.className = 'fas fa-volume-high';
      } else {
        badgeBg.className = 'w-10 h-10 rounded-full bg-black/60 text-white group-hover:bg-gold-500 group-hover:text-olive-950 flex items-center justify-center text-sm shadow-md transition-all';
        badgeIcon.className = 'fas fa-play';
      }
    }

    if (isCurrent) {
      // تمرير القائمة ليظهر الكارت النشط في المنتصف
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });

  if (autoPlay) {
    mainVideo.play().catch(e => {
      console.log('Autoplay prevented:', e);
    });
  }
}

// تشغيل / إيقاف مؤقت
window.togglePlay = function () {
  const mainVideo = document.getElementById('mainVideo');
  if (!mainVideo) return;

  if (mainVideo.paused) {
    mainVideo.play();
  } else {
    mainVideo.pause();
  }
};

// تحديث واجهة زر التشغيل/الإيقاف
function updatePlayPauseUI(isPlaying) {
  const playPauseIcon = document.getElementById('playPauseIcon');
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (playPauseIcon) {
    playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  }
  if (playPauseBtn) {
    if (isPlaying) {
      playPauseBtn.classList.add('ring-4', 'ring-gold-300/60');
    } else {
      playPauseBtn.classList.remove('ring-4', 'ring-gold-300/60');
    }
  }
}

// التالي / السابق
window.nextVideo = function (step, autoPlay = true) {
  if (!videosData || videosData.length === 0) return;
  const newIndex = (currentVideoIndex + step + videosData.length) % videosData.length;
  loadVideo(newIndex, autoPlay);
};

// تقديم الفيديو 10 ثواني
window.forwardVideo = function (seconds = 10) {
  const mainVideo = document.getElementById('mainVideo');
  if (mainVideo) {
    mainVideo.currentTime = Math.min(mainVideo.duration || Infinity, mainVideo.currentTime + seconds);
  }
};

// تأخير الفيديو 10 ثواني
window.rewindVideo = function (seconds = 10) {
  const mainVideo = document.getElementById('mainVideo');
  if (mainVideo) {
    mainVideo.currentTime = Math.max(0, mainVideo.currentTime - seconds);
  }
};


/* ================================================================
 * 2. معرض الصور التفاعلي (9:16 Vertical Cards & Modal Lightbox)
 * ================================================================ */
function initGallerySection() {
  filterGallery('مطابخ عصرية');
}

// تبديل وتصفية معرض الأعمال
window.filterGallery = function (categoryName) {
  currentGalleryCategory = categoryName;
  const track = document.getElementById('galleryTrack');
  const filterButtons = document.querySelectorAll('.gallery-filter-btn');

  // تحديث أزرار الفلترة
  filterButtons.forEach(btn => {
    const btnText = btn.textContent.trim();
    const isSelected = btnText.includes(categoryName) ||
      (categoryName.includes('مطبخ') && btnText.includes('مطبخ')) ||
      (categoryName.includes('غرف') && btnText.includes('غرف')) ||
      (categoryName.includes('دريسنج') && btnText.includes('دريسنج')) ||
      (categoryName.includes('أثاث') && btnText.includes('أثاث')) ||
      (categoryName.includes('اثاث') && btnText.includes('أثاث'));

    if (isSelected) {
      btn.className = 'gallery-filter-btn px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gold-500 text-olive-950 shadow-md transition-all scale-105';
    } else {
      btn.className = 'gallery-filter-btn px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cream-100 hover:bg-gold-500/20 text-olive-900 border border-cream-200 transition-all';
    }
  });

  if (!track) return;

  const items = getMediaByCategory(categoryName);
  if (!items || items.length === 0) return;

  // بناء كروت الصور العمودية (9:16)
  track.innerHTML = items.map((item, index) => `
    <div class="shorts-item shrink-0 w-[260px] sm:w-[300px] md:w-[320px] aspect-[9/16] rounded-3xl overflow-hidden shadow-card border-2 border-cream-200 bg-olive-950 relative group cursor-pointer transition-all duration-500 hover:shadow-cinematic hover:-translate-y-2 hover:border-gold-400"
         onclick="openGalleryModal(${index}, '${categoryName}')">

      <!-- الصورة الرئيسية بنسبة 9:16 وLazy Loading -->
      <img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async"
           class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

      <!-- التدرج اللوني السينمائي -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 group-hover:from-black/95 transition-all"></div>

      <!-- شارة القسم في الرأس -->
      <div class="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
        <span class="bg-black/75 backdrop-blur-md text-gold-400 text-[11px] font-black px-3.5 py-1.5 rounded-full border border-gold-400/40 shadow-sm">
          <i class="fas fa-gem ml-1 text-[10px]"></i> ${item.category}
        </span>
        <span class="bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
          Kitchèra Quality
        </span>
      </div>

      <!-- زر المعاينة في المنتصف يظهر عند التمرير -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div class="w-16 h-16 rounded-full bg-gold-500/90 text-olive-950 flex items-center justify-center text-2xl shadow-xl backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform">
          <i class="fas fa-expand"></i>
        </div>
      </div>

      <!-- محتوى وبيانات الكارت أسفل الصورة -->
      <div class="absolute bottom-0 inset-x-0 p-5 z-10 text-right">
        <span class="text-xs font-bold text-gold-400 uppercase tracking-wider block mb-1">
          Kitchèra Custom Design
        </span>
        <h4 class="text-lg font-black text-white leading-snug group-hover:text-gold-300 transition-colors drop-shadow-md">
          ${item.title}
        </h4>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/20 text-xs text-cream-100/80">
          <span class="flex items-center gap-1.5">
            <i class="fas fa-circle-check text-gold-400"></i> خامات أوروبية معتمدة
          </span>
          <span class="text-gold-400 font-bold group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
            تفاصيل <i class="fas fa-arrow-left text-[10px]"></i>
          </span>
        </div>
      </div>
    </div>
  `).join('');

  // إعادة التمرير للبداية
  track.scrollTo({ left: 0, behavior: 'smooth' });
};

// التمرير السريع لمعرض الصور
window.scrollGallery = function (direction) {
  const track = document.getElementById('galleryTrack');
  if (!track) return;
  // في اللغة العربية (RTL) الاتجاه معكوس في بعض المتصفحات
  const scrollAmount = 340 * direction;
  track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
};


/* ================================================================
 * 3. النافذة المنبثقة التفصيلية للصور (Lightbox Modal)
 * ================================================================ */
window.openGalleryModal = function (index, categoryName) {
  currentModalCategory = categoryName || currentGalleryCategory;
  const items = getMediaByCategory(currentModalCategory);
  if (!items || !items[index]) return;

  currentModalIndex = index;
  renderModalContent();

  const modal = document.getElementById('galleryModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
};

window.closeGalleryModal = function () {
  const modal = document.getElementById('galleryModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

window.navGalleryModal = function (step) {
  const items = getMediaByCategory(currentModalCategory);
  if (!items || items.length === 0) return;

  currentModalIndex = (currentModalIndex + step + items.length) % items.length;
  renderModalContent();
};

function renderModalContent() {
  const items = getMediaByCategory(currentModalCategory);
  if (!items || !items[currentModalIndex]) return;

  const item = items[currentModalIndex];
  const img = document.getElementById('gModalImg');
  const cat = document.getElementById('gModalCategory');
  const title = document.getElementById('gModalTitle');
  const desc = document.getElementById('gModalDesc');
  const loc = document.getElementById('gModalLocation');
  const counter = document.getElementById('gModalCounter');
  const specs = document.getElementById('gModalSpecs');
  const waBtn = document.getElementById('gModalWhatsAppBtn');

  if (img) {
    img.src = item.src;
    img.alt = item.title;
  }
  if (cat) cat.textContent = item.category;
  if (title) title.textContent = item.title;
  if (desc) desc.textContent = item.desc;
  if (loc) loc.textContent = item.location || 'مصر';
  if (counter) counter.textContent = `${currentModalIndex + 1} / ${items.length}`;

  if (specs && item.specs) {
    specs.innerHTML = item.specs.map(spec => `
      <div class="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
        <i class="fas fa-check text-gold-400"></i>
        <span>${spec}</span>
      </div>
    `).join('');
  }

  if (waBtn) {
    const waMsg = `مرحباً Kitchèra، أود الاستفسار وطلب تصميم وتصنيع مماثل لموديل: "${item.title}" (قسم ${item.category}).`;
    waBtn.href = `https://wa.me/201066321915?text=${encodeURIComponent(waMsg)}`;
  }
}

// إغلاق النافذة بالنقر على الخلفية أو الضغط على Esc
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('galleryModal');
  if (modal && !modal.classList.contains('hidden')) {
    if (e.key === 'Escape') closeGalleryModal();
    if (e.key === 'ArrowRight') navGalleryModal(-1);
    if (e.key === 'ArrowLeft') navGalleryModal(1);
  }
});

const galleryModalEl = document.getElementById('galleryModal');
if (galleryModalEl) {
  galleryModalEl.addEventListener('click', (e) => {
    if (e.target === galleryModalEl) {
      closeGalleryModal();
    }
  });
}


/* ================================================================
 * 4. نظام التقييمات التفاعلي ونموذج المشاركة المباشر
 * ================================================================ */
function initReviewsSystem() {
  // جلب التقييمات من localStorage أو الافتراضية
  try {
    const saved = localStorage.getItem('kitchera_reviews');
    if (saved) {
      currentReviews = JSON.parse(saved);
    } else {
      currentReviews = [...defaultReviewsData];
      localStorage.setItem('kitchera_reviews', JSON.stringify(currentReviews));
    }
  } catch (e) {
    currentReviews = [...defaultReviewsData];
  }

  initStarRating();
  renderReviews();
}

// تهيئة اختيار النجوم
function initStarRating() {
  const starRow = document.getElementById('starRow');
  const ratingInput = document.getElementById('ratingVal');
  if (!starRow || !ratingInput) return;

  const stars = starRow.querySelectorAll('.star');

  function highlightStars(val) {
    stars.forEach(s => {
      const starVal = parseInt(s.getAttribute('data-val'));
      if (starVal <= val) {
        s.classList.add('text-amber-400');
        s.classList.remove('text-gray-300');
      } else {
        s.classList.remove('text-amber-400');
        s.classList.add('text-gray-300');
      }
    });
  }

  stars.forEach(s => {
    s.addEventListener('mouseenter', function () {
      const val = parseInt(this.getAttribute('data-val'));
      highlightStars(val);
    });

    s.addEventListener('click', function () {
      const val = parseInt(this.getAttribute('data-val'));
      ratingInput.value = val;
      highlightStars(val);
    });
  });

  starRow.addEventListener('mouseleave', function () {
    const currentVal = parseInt(ratingInput.value) || 5;
    highlightStars(currentVal);
  });

  // افتراضياً 5 نجوم
  highlightStars(5);
}

// معالجة إرسال التقييم المباشر
window.handleDirectReviewSubmit = function (e) {
  e.preventDefault();
  const authorInput = document.getElementById('revAuthor');
  const serviceInput = document.getElementById('revService');
  const commentInput = document.getElementById('revComment');
  const ratingInput = document.getElementById('ratingVal');
  const successMsg = document.getElementById('reviewSuccessMsg');

  const author = authorInput?.value.trim();
  const service = serviceInput?.value.trim() || 'مشروع وتصميم متكامل';
  const comment = commentInput?.value.trim();
  const rating = parseInt(ratingInput?.value) || 5;

  if (!author || !comment) return;

  const newReview = {
    id: Date.now(),
    author: author,
    service: service,
    rating: rating,
    date: 'الآن (عميل معتمد)',
    comment: comment
  };

  currentReviews.unshift(newReview);

  try {
    localStorage.setItem('kitchera_reviews', JSON.stringify(currentReviews));
  } catch (err) {
    console.log('Storage err:', err);
  }

  renderReviews();

  if (successMsg) {
    successMsg.classList.remove('hidden');
    setTimeout(() => {
      successMsg.classList.add('hidden');
    }, 5000);
  }

  // تصفير الحقول
  if (authorInput) authorInput.value = '';
  if (serviceInput) serviceInput.value = '';
  if (commentInput) commentInput.value = '';
  if (ratingInput) ratingInput.value = 5;
  const stars = document.querySelectorAll('#starRow .star');
  stars.forEach(s => {
    s.classList.add('text-amber-400');
    s.classList.remove('text-gray-300');
  });
};

// عرض التقييمات في الشبكة
function renderReviews() {
  const container = document.getElementById('reviewsList');
  if (!container) return;

  container.innerHTML = currentReviews.map(rev => {
    const starsHtml = Array.from({ length: 5 }, (_, i) => `
      <span class="${i < rev.rating ? 'text-amber-400' : 'text-gray-300'}">★</span>
    `).join('');

    const initial = rev.author ? rev.author.replace(/^(م\.|د\.|أ\.)\s*/, '').charAt(0) : 'K';

    return `
      <div class="bg-cream-50 rounded-2xl p-6 sm:p-7 border-2 border-cream-200 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
        <div>
          <!-- رأس التقييم -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gold-500 text-olive-950 flex items-center justify-center font-black text-lg shadow-sm">
                ${initial}
              </div>
              <div>
                <h4 class="font-black text-olive-950 text-base leading-tight">${rev.author}</h4>
                <p class="text-xs text-stone-600 font-semibold mt-0.5">${rev.service}</p>
              </div>
            </div>
            <div class="flex items-center gap-0.5 text-lg">
              ${starsHtml}
            </div>
          </div>

          <!-- نص التقييم -->
          <p class="text-stone-800 text-sm leading-relaxed font-medium">
            "${rev.comment}"
          </p>
        </div>

        <!-- أسفل التقييم: التاريخ وشارة التحقق -->
        <div class="flex items-center justify-between pt-4 mt-4 border-t border-cream-200/80 text-xs text-stone-500 font-semibold">
          <span class="flex items-center gap-1.5 text-olive-700 font-bold">
            <i class="fas fa-badge-check text-gold-500 text-sm"></i> عميل موثّق
          </span>
          <span>${rev.date}</span>
        </div>
      </div>
    `;
  }).join('');
}


/* ================================================================
 * 5. تأثير Parallax وسلاسة التنقل
 * ================================================================ */
function initParallaxAndUI() {
  const parallaxBg = document.getElementById('statsParallaxBg');
  if (parallaxBg) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      const statsEl = document.getElementById('stats');
      if (statsEl) {
        const rect = statsEl.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const offset = (window.innerHeight - rect.top) * 0.08;
          parallaxBg.style.transform = `scale(1.25) translateY(${offset - 20}px)`;
        }
      }
    }, { passive: true });
  }
}
