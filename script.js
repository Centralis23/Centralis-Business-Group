/* ================================================
   CENTRALIS BUSINESS GROUP — script.js
   ================================================ */

// 1. Block scroll during intro, remove overlay after animation
document.body.style.overflow = 'hidden';
setTimeout(() => {
  const intro = document.getElementById('intro-overlay');
  if (intro) {
    intro.addEventListener('animationend', () => { intro.remove(); }, { once: true });
    setTimeout(() => { intro.remove(); }, 500);
  }
  document.body.style.overflow = '';
}, 3800);

// 2. Navbar — add .scrolled class on scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 80);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// 3. Burger menu
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// 4. Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// 5. Counter animation
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// 6. Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// 7. Video fallback
const heroVideo = document.querySelector('.hero-video');
const heroFallback = document.querySelector('.hero-fallback');
if (heroVideo && heroFallback) {
  heroVideo.addEventListener('canplay', () => {
    heroFallback.style.transition = 'opacity 0.5s';
    heroFallback.style.opacity = '0';
  }, { once: true });
  heroVideo.addEventListener('error', () => { heroVideo.style.display = 'none'; });
}

// 8. Contact form AJAX
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type=submit]');
    const original = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;
    try {
      const res = await fetch('contact.php', { method: 'POST', body: new FormData(this) });
      const data = await res.json();
      if (data.success) {
        const success = document.getElementById('form-success');
        if (success) success.style.display = 'block';
        this.reset();
        btn.textContent = 'Message envoyé ✓';
      } else { throw new Error(); }
    } catch {
      btn.textContent = 'Erreur — réessayez';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 3000);
    }
  });
}

// 9. Filter buttons (visual only)
document.querySelectorAll('.re-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.re-filter-btn').forEach(b => b.classList.remove('re-filter-btn--active'));
    btn.classList.add('re-filter-btn--active');
  });
});

// 10. Gallery thumbnail click (salle pages)
const mainImg = document.querySelector('.salle-gallery-main img');
if (mainImg) {
  mainImg.style.transition = 'opacity 0.2s ease';
  document.querySelectorAll('.salle-gallery-thumbs img').forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImg.style.opacity = '0';
      setTimeout(() => { mainImg.src = thumb.src; mainImg.style.opacity = '1'; }, 200);
    });
  });
}
