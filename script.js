/* ================================================
   CENTRALIS BUSINESS GROUP — script.js
   ================================================ */

// 1. Intro progress bar
document.body.style.overflow = 'hidden';
(function() {
  const overlay = document.getElementById('intro-overlay');
  const bar = document.getElementById('intro-progress');
  const pct = document.getElementById('intro-percent');
  if (!overlay || !bar) return;
  let progress = 0;
  const duration = 2800;
  const interval = 30;
  const step = 100 / (duration / interval);
  const timer = setInterval(() => {
    progress = Math.min(progress + step + Math.random() * step * 0.5, 100);
    bar.style.width = progress + '%';
    if (pct) pct.textContent = Math.floor(progress) + '%';
    if (progress >= 100) {
      clearInterval(timer);
      if (pct) pct.textContent = '100%';
      setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
        setTimeout(() => overlay.remove(), 650);
      }, 300);
    }
  }, interval);
})();

// 2. Navbar — add .scrolled class on scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 80);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
const navbarCentered = document.querySelector('.navbar-centered');
if (navbarCentered && navbarCentered !== navbar) {
  const onScrollC = () => navbarCentered.classList.toggle('scrolled', window.scrollY > 80);
  window.addEventListener('scroll', onScrollC, { passive: true });
  onScrollC();
}

// 3. Burger menu
const burger = document.querySelector('.burger');
const navLeft = document.querySelector('.nav-links-left');
const navRight = document.querySelector('.nav-links-right');
const navLinks = document.querySelector('.nav-links');
if (burger) {
  burger.addEventListener('click', () => {
    const targets = [navLeft, navRight, navLinks].filter(Boolean);
    const isOpen = targets[0] ? !targets[0].classList.contains('open') : false;
    targets.forEach(t => t.classList.toggle('open', isOpen));
    burger.setAttribute('aria-expanded', isOpen);
  });
  [navLeft, navRight, navLinks].filter(Boolean).forEach(nav => {
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        [navLeft, navRight, navLinks].filter(Boolean).forEach(t => t.classList.remove('open'));
        burger.setAttribute('aria-expanded', 'false');
      });
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

// 8. Contact form — Netlify Forms
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type=submit]');
    const original = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;
    try {
      const body = new URLSearchParams(new FormData(this)).toString();
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      if (res.ok) {
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

// 9. Activités cards — staggered reveal
(function() {
  const cards = document.querySelectorAll('.act-card');
  if (!cards.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  cards.forEach(c => io.observe(c));
  setTimeout(() => {
    cards.forEach(c => {
      if (c.getBoundingClientRect().top < window.innerHeight) c.classList.add('in-view');
    });
  }, 120);
})();

// 11. Filter buttons (visual only)
document.querySelectorAll('.re-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.re-filter-btn').forEach(b => b.classList.remove('re-filter-btn--active'));
    btn.classList.add('re-filter-btn--active');
  });
});

// 10. About section — motion design reveal
(function() {
  const photos = document.querySelectorAll('.about-photo');
  const content = document.querySelector('.about-content');
  const stats = document.querySelectorAll('.about-stat');
  if (!photos.length && !content) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  photos.forEach(p => io.observe(p));
  if (content) io.observe(content);
  stats.forEach(s => io.observe(s));
  // Fallback : si l'élément est déjà visible au chargement
  setTimeout(() => {
    [...photos, content, ...stats].filter(Boolean).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add('in-view');
    });
  }, 100);
})();

// 11. Gallery thumbnail click (salle pages)
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
