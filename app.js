/* ===== LANGUAGE SWITCHER ===== */
(function() {
  const langBtns = document.querySelectorAll('.lang-btn');
  const currentLang = localStorage.getItem('vidlab_lang') || 'vi';

  function setLanguage(lang) {
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.classList.remove('active-lang');
      if (el.getAttribute('data-lang') === lang) {
        el.classList.add('active-lang');
      }
    });
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-select-lang') === lang) {
        btn.classList.add('active');
      }
    });

    document.documentElement.lang = lang;
    localStorage.setItem('vidlab_lang', lang);
  }

  // Init Language
  setLanguage(currentLang);

  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-select-lang');
      setLanguage(lang);
    });
  });
})();

/* ===== PARTICLE CANVAS ===== */
(function() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      r: randomBetween(0.5, 1.8),
      vx: randomBetween(-0.15, 0.15),
      vy: randomBetween(-0.15, 0.15),
      alpha: randomBetween(0.2, 0.7),
      color: ['#63b3ed', '#b794f4', '#4fd1c5', '#667eea'][Math.floor(Math.random() * 4)]
    };
  }

  for (let i = 0; i < 120; i++) particles.push(createParticle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#63b3ed';
          ctx.globalAlpha = (1 - dist / 100) * 0.1;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  // Update active nav link
  const sections = ['home', 'apps', 'about', 'contact'];
  let current = 'home';
  sections.forEach(id => {
    const sec = document.getElementById(id);
    if (sec && window.scrollY >= sec.offsetTop - 100) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== STAT COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(ease * target);
    el.textContent = value >= 1000 ? (value / 1000).toFixed(1) + 'k+' : value + (progress < 1 ? '' : '+');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ===== INTERSECTION OBSERVER (Disabled for reliability) =====
// const fadeEls = document.querySelectorAll('.app-card, .contact-card, .skill-item, .about-left, .about-right, .hero-content, .hero-visual');
// fadeEls.forEach(el => el.classList.add('fade-in'));
// const observer = new IntersectionObserver((entries) => { ... });

// Stat counter observer
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
const heroSection = document.getElementById('home');
if (heroSection) statObserver.observe(heroSection);

// ===== FILTER APPS =====
const filterBtns = document.querySelectorAll('.filter-btn');
const appCards = document.querySelectorAll('.app-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    appCards.forEach(card => {
      const categories = card.dataset.category.split(' ');
      const match = filter === 'all' || categories.includes(filter);
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      if (match) {
        card.style.display = '';
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => { card.style.display = 'none'; }, 300);
      }
    });
  });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== CARD HOVER GLOW FOLLOW MOUSE =====
document.querySelectorAll('.app-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.querySelector('.card-glow').style.background =
      `radial-gradient(circle at ${x}% ${y}%, rgba(99,179,237,0.12), transparent 60%)`;
  });
});

// ===== MODAL LOGIC =====
const modal = document.getElementById('article-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCategory = document.getElementById('modal-category');

function openModal(card) {
  const title = card.querySelector('.card-title').textContent;
  const category = card.querySelector('.badge').textContent;
  const fullContent = card.querySelector('.full-article-content');
  
  modalTitle.textContent = title;
  modalCategory.textContent = category;
  
  if (fullContent) {
    modalBody.innerHTML = fullContent.innerHTML;
  } else {
    const lang = localStorage.getItem('vidlab_lang') || 'vi';
    modalBody.innerHTML = `
      <div data-lang="vi" class="${lang === 'vi' ? 'active-lang' : ''}">
        <p>Nội dung chi tiết của bài viết <strong>"${title}"</strong> đang được cập nhật.</p>
        <p>Vui lòng quay lại sau để xem hướng dẫn sử dụng và các tính năng nâng cao của công cụ này.</p>
        <h4>Thông tin kỹ thuật:</h4>
        <ul>
          <li>Danh mục: ${category}</li>
          <li>Tình trạng: Sẵn sàng dùng thử</li>
        </ul>
      </div>
      <div data-lang="en" class="${lang === 'en' ? 'active-lang' : ''}">
        <p>Detailed content for <strong>"${title}"</strong> is currently being updated.</p>
        <p>Please check back later for usage guides and advanced features of this tool.</p>
        <h4>Technical Information:</h4>
        <ul>
          <li>Category: ${category}</li>
          <li>Status: Ready for trial</li>
        </ul>
      </div>
    `;
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Attach click events to cards and buttons
document.querySelectorAll('.app-card').forEach(card => {
  card.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    // If clicked on a link with a real URL (not just #), allow it to navigate
    if (link && link.getAttribute('href') !== '#' && !link.classList.contains('modal-trigger')) {
      return; 
    }
    
    // Don't trigger modal if clicking on secondary links
    if (e.target.closest('.card-btn-code')) return;
    
    e.preventDefault();
    openModal(card);
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Close modal on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ===== TYPING EFFECT IN CODE WINDOW =====
(function() {
  const cursor = document.querySelector('.code-cursor');
  if (!cursor) return;
  // Already blinking via CSS
})();
