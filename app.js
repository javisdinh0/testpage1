/* ==========================================
   iViDLab Premium JS Interactions
   ========================================== */

// ===== SAFE STORAGE WORKAROUND FOR local file:// protocol =====
if (!window.safeStorage) {
  window.safeStorage = {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn("localStorage is blocked or unavailable, using memory fallback.", e);
        return window.safeStorage._data[key] || null;
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn("localStorage is blocked or unavailable, using memory fallback.", e);
        window.safeStorage._data[key] = String(value);
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn("localStorage is blocked or unavailable, using memory fallback.", e);
        delete window.safeStorage._data[key];
      }
    },
    _data: {}
  };
}

/* ===== LANGUAGE SWITCHER ===== */
(function() {
  const langBtns = document.querySelectorAll('.header-lang-btn, .lang-btn');
  const currentLang = window.safeStorage.getItem('ividlab_lang') || 'vi';

  function setLanguage(lang) {
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.classList.remove('active-lang');
      if (el.getAttribute('data-lang') === lang) {
        el.classList.add('active-lang');
      }
    });
    
    document.querySelectorAll('.header-lang-btn, .lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-select-lang') === lang) {
        btn.classList.add('active');
      }
    });

    document.documentElement.lang = lang;
    window.safeStorage.setItem('ividlab_lang', lang);
  }

  // Initialize Language
  setLanguage(currentLang);

  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-select-lang');
      setLanguage(lang);
    });
  });
})();

/* ===== HERO SLIDER BANNER ===== */
(function() {
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.querySelector('.slider-dots');
  let currentSlideIdx = 0;
  let slideTimer;
  const slideIntervalTime = 6000; // 6 seconds

  if (slides.length === 0) return;

  // Dynamically generate dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.classList.add('slider-dot');
    if (idx === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(idx);
      resetTimer();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.slider-dot');

  function goToSlide(idx) {
    slides[currentSlideIdx].classList.remove('active');
    dots[currentSlideIdx].classList.remove('active');
    
    currentSlideIdx = idx;
    
    slides[currentSlideIdx].classList.add('active');
    dots[currentSlideIdx].classList.add('active');
  }

  function nextSlide() {
    let nextIdx = (currentSlideIdx + 1) % slides.length;
    goToSlide(nextIdx);
  }

  function startTimer() {
    slideTimer = setInterval(nextSlide, slideIntervalTime);
  }

  function resetTimer() {
    clearInterval(slideTimer);
    startTimer();
  }

  // Start Slider
  startTimer();
})();

/* ===== MAIN HEADER STICKY & SCROLLSPY ===== */
(function() {
  const header = document.querySelector('.main-header');
  const sections = document.querySelectorAll('section, main');
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    // Sticky Class
    if (window.scrollY > 40) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }

    // ScrollSpy active link
    let currentId = '';
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop;
      const sectionHeight = sec.clientHeight;
      if (window.scrollY >= (sectionTop - 120)) {
        currentId = sec.getAttribute('id') || '';
      }
    });

    if (currentId) {
      navItems.forEach(item => {
        item.classList.remove('active');
        const link = item.querySelector('.nav-menu-link');
        if (link && link.getAttribute('href') === `#${currentId}`) {
          item.classList.add('active');
        }
      });
    }
  });
})();

/* ===== SEARCH DRAWER OVERLAY ===== */
(function() {
  const searchOpenBtn = document.querySelector('.search-toggle-btn');
  const searchCloseBtn = document.querySelector('.search-close-btn');
  const searchDrawer = document.querySelector('.search-drawer');

  if (searchOpenBtn && searchDrawer) {
    searchOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      searchDrawer.classList.toggle('open');
    });
  }

  if (searchCloseBtn && searchDrawer) {
    searchCloseBtn.addEventListener('click', () => {
      searchDrawer.classList.remove('open');
    });
  }
})();

/* ===== MOBILE SIDE DRAWER MENU ===== */
(function() {
  const hamburger = document.querySelector('.hamburger');
  const mobileDrawer = document.querySelector('.mobile-side-drawer');
  const mobileClose = document.querySelector('.mobile-drawer-close');
  const mobileOverlay = document.querySelector('.mobile-drawer-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
})();

/* ===== DYNAMIC TABS PORTFOLIO FILTER ===== */
(function() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const cards = document.querySelectorAll('.project-lux-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active classes
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        const matches = filterValue === 'all' || categories.includes(filterValue);

        // Tactile organic transition
        if (matches) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 350);
        }
      });
    });
  });
})();

/* ===== INTERACTIVE CONSULTATION FORM ACTION ===== */
(function() {
  const form = document.querySelector('.consultation-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('.btn-form-submit');
    const originalText = submitBtn.textContent;
    
    const lang = window.safeStorage.getItem('ividlab_lang') || 'vi';
    const sendingText = lang === 'vi' ? 'ĐANG GỬI...' : 'SENDING...';
    const successMsg = lang === 'vi' 
      ? 'Cảm ơn bạn! Yêu cầu tư vấn của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất!'
      : 'Thank you! Your quote request has been sent successfully. We will get back to you shortly!';

    // Simulation Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = sendingText;
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      alert(successMsg);
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.style.opacity = '1';
    }, 1500);
  });
})();

/* ===== DETAIL OVERLAY MODAL LOGIC ===== */
(function() {
  const modal = document.getElementById('article-modal');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCategory = document.getElementById('modal-category');

  if (!modal) return;

  function openModal(card) {
    const title = card.querySelector('.project-card-title').textContent;
    const category = card.querySelector('.project-card-badge').textContent;
    const fullContent = card.querySelector('.full-article-content');
    
    modalTitle.textContent = title;
    modalCategory.textContent = category;
    
    if (fullContent) {
      modalBody.innerHTML = fullContent.innerHTML;
    } else {
      const lang = window.safeStorage.getItem('ividlab_lang') || 'vi';
      modalBody.innerHTML = `
        <div data-lang="vi" class="${lang === 'vi' ? 'active-lang' : ''}">
          <p>Nội dung chi tiết cho dự án hoặc giải pháp <strong>"${title}"</strong> đang được số hóa và bổ sung tài liệu.</p>
          <p>Vui lòng nhấp vào các nút liên kết trực tiếp bên dưới hoặc quay lại sau để xem hướng dẫn sử dụng đầy đủ.</p>
          <h4 style="margin-top: 1.5rem; color: #c89d55;">Đặc tính kỹ thuật chính:</h4>
          <ul style="padding-left: 1.2rem; margin-top: 0.5rem;">
            <li>Phân loại: ${category}</li>
            <li>Trạng thái triển khai: Sẵn sàng thử nghiệm và chuyển giao công nghệ</li>
            <li>Hỗ trợ tích hợp hệ thống: AutoCAD, Tekla Structures, Rhino Grasshopper</li>
          </ul>
        </div>
        <div data-lang="en" class="${lang === 'en' ? 'active-lang' : ''}">
          <p>Detailed documentation for <strong>"${title}"</strong> is currently being optimized and updated.</p>
          <p>Please click on the direct download options or visit later to see the complete guide.</p>
          <h4 style="margin-top: 1.5rem; color: #c89d55;">Core Technical Specs:</h4>
          <ul style="padding-left: 1.2rem; margin-top: 0.5rem;">
            <li>Type: ${category}</li>
            <li>Deployment Status: Stable release ready for production pipelines</li>
            <li>Native Integrations: AutoCAD, Tekla Structures, Rhino Grasshopper</li>
          </ul>
        </div>
      `;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Bind click actions to portfolio cards
  document.querySelectorAll('.project-lux-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger modal if clicking on secondary buttons (HDSD, Download, etc.)
      if (e.target.closest('.project-card-btn-sec')) return;

      const detailLink = card.querySelector('.project-card-link');
      const href = detailLink ? detailLink.getAttribute('href') : null;

      // If the link has a valid subpage target (not "#" or empty), navigate to it directly
      if (href && href !== '#' && href !== 'javascript:void(0)') {
        // If they click directly on the link, allow native navigation
        if (e.target.closest('a') === detailLink) return;
        
        e.preventDefault();
        window.location.href = href;
        return;
      }

      e.preventDefault();
      openModal(card);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
})();

/* ===== SMOOTH SCROLL ANCHORS ===== */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const targetHref = this.getAttribute('href');
      if (targetHref === '#') return;
      
      const targetElement = document.querySelector(targetHref);
      if (targetElement) {
        e.preventDefault();
        
        const offset = 90; // Header size offset
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetElement.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
})();
