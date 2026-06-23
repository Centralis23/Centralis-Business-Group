/* ================================================
   CENTRALIS BUSINESS GROUP — script.js
   ================================================ */

// Désactive la restauration de scroll du navigateur
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// 1. Intro progress bar
(function() {
  const overlay = document.getElementById('intro-overlay');
  const bar = document.getElementById('intro-progress');
  const pct = document.getElementById('intro-percent');

  function dismiss() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
      // Scroll to target section si paramètre ?to= présent (depuis boutons blog)
      const to = new URLSearchParams(window.location.search).get('to');
      if (to) {
        const target = document.getElementById(to);
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }, 100);
  }

  if (!overlay || !bar) { document.body.style.overflow = ''; return; }
  document.body.style.overflow = 'hidden';
  const safetyTimer = setTimeout(dismiss, 5000);

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
      clearTimeout(safetyTimer);
      if (pct) pct.textContent = '100%';
      setTimeout(dismiss, 300);
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

// 3. Burger menu — tiroir latéral
const burger = document.querySelector('.burger');
const navLeft = document.querySelector('.nav-links-left');
const navRight = document.querySelector('.nav-links-right');
const navLinks = document.querySelector('.nav-links');

// Créer un tiroir séparé injecté dans le DOM
const drawer = document.createElement('div');
drawer.id = 'mobile-drawer';
drawer.style.cssText = [
  'position:fixed',
  'top:0','right:0','bottom:0',
  'width:75vw','max-width:300px',
  'background:#fff',
  'z-index:1002',
  'padding:4.5rem 1.75rem 2rem',
  'display:flex','flex-direction:column',
  'gap:0',
  'transform:translateX(110%)',
  'transition:transform 0.35s cubic-bezier(0.4,0,0.2,1)',
  'box-shadow:-8px 0 40px rgba(0,0,0,0.2)',
  'overflow-y:auto',
].join(';');

// Bouton fermer
const drawerClose = document.createElement('button');
drawerClose.style.cssText = 'position:absolute;top:1.2rem;right:1.2rem;background:none;border:none;cursor:pointer;padding:4px;';
drawerClose.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
drawer.appendChild(drawerClose);

// Cloner les liens depuis le nav existant
const sourceNav = navRight || navLinks;
if (sourceNav) {
  sourceNav.querySelectorAll('a').forEach(a => {
    const link = document.createElement('a');
    link.href = a.href;
    link.textContent = a.textContent.trim();
    link.style.cssText = 'display:block;padding:0.9rem 0;font-size:1rem;font-weight:600;color:#111827;border-bottom:1px solid rgba(17,24,39,0.07);text-decoration:none;';
    drawer.appendChild(link);
  });
}

// CTA contact
const drawerCta = document.createElement('a');
drawerCta.href = 'contact.html';
drawerCta.textContent = 'Nous contacter';
drawerCta.style.cssText = 'display:block;margin-top:1.5rem;padding:0.85rem 1.25rem;background:#1a1acc;color:#fff;border-radius:6px;font-weight:700;font-size:0.85rem;text-align:center;text-decoration:none;letter-spacing:0.03em;';
drawer.appendChild(drawerCta);

document.body.appendChild(drawer);

// Overlay
const drawerOverlay = document.createElement('div');
drawerOverlay.id = 'drawer-overlay';
drawerOverlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1001;opacity:0;transition:opacity 0.35s ease;';
document.body.appendChild(drawerOverlay);

function closeDrawer() {
  drawer.style.transform = 'translateX(110%)';
  if (burger) burger.setAttribute('aria-expanded', 'false');
  drawerOverlay.style.opacity = '0';
  setTimeout(() => { drawerOverlay.style.display = 'none'; }, 350);
  document.body.style.overflow = '';
}

function openDrawer() {
  drawerOverlay.style.display = 'block';
  requestAnimationFrame(() => {
    drawerOverlay.style.opacity = '1';
    drawer.style.transform = 'translateX(0)';
  });
  if (burger) burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

if (burger) {
  burger.addEventListener('click', () => {
    drawer.style.transform === 'translateX(0)' ? closeDrawer() : openDrawer();
  });
}
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

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
  const duration = 2500;
  el.textContent = '0';
  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  setTimeout(() => requestAnimationFrame(update), 50);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Attend que le stat-item soit bien apparu (après son fade-in de 300ms + transition 700ms)
      setTimeout(() => animateCounter(entry.target), 900);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// Community cards reveal
const commObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      commObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.comm-reveal-left, .comm-reveal-right').forEach(el => commObserver.observe(el));

// Stats items reveal
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in-view'), 300);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.stat-item').forEach(el => statObserver.observe(el));

// 6. Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
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

// 9. Activités — carrousel reveal + arrows mobile
(function() {
  const cards = document.querySelectorAll('.act-card');
  if (!cards.length) return;

  // Apparition une par une avec délai échelonné
  cards.forEach((c, i) => { c.style.transitionDelay = (i * 0.15) + 's'; });
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      cards.forEach((c, i) => {
        setTimeout(() => { c.classList.add('in-view'); }, i * 150);
      });
      io.disconnect();
    }
  }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });
  io.observe(cards[0]);
  setTimeout(() => {
    if (cards[0].getBoundingClientRect().top < window.innerHeight) {
      cards.forEach((c, i) => {
        setTimeout(() => { c.classList.add('in-view'); }, i * 150);
      });
    }
  }, 120);

  // Mobile carousel arrows
  const actCarousel = document.querySelector('.act-carousel');
  const actPrev = document.querySelector('.act-arrow--prev');
  const actNext = document.querySelector('.act-arrow--next');
  if (actCarousel && actPrev && actNext) {
    const scroll = (dir) => {
      const card = actCarousel.querySelector('.act-card');
      if (!card) return;
      actCarousel.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' });
    };
    actPrev.addEventListener('click', () => scroll(-1));
    actNext.addEventListener('click', () => scroll(1));
  }
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

// Formation cards carousel arrows
(function() {
  const grid = document.querySelector('.form-grid');
  const prev = document.querySelector('.form-arrow--prev');
  const next = document.querySelector('.form-arrow--next');
  if (!grid || !prev || !next) return;
  const scroll = (dir) => {
    const cardWidth = grid.querySelector('.form-card').offsetWidth + 16;
    grid.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => scroll(-1));
  next.addEventListener('click', () => scroll(1));
})();

// Salle cards carousel arrows
(function() {
  const grid = document.querySelector('.re-grid');
  const prev = document.querySelector('.re-arrow--prev');
  const next = document.querySelector('.re-arrow--next');
  if (!grid || !prev || !next) return;
  const scroll = (dir) => {
    const cardWidth = grid.querySelector('.re-card').offsetWidth + 16;
    grid.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => scroll(-1));
  next.addEventListener('click', () => scroll(1));
})();

// 12. Studio cards — animation d'entrée
(function() {
  const cards = document.querySelectorAll('.studio-card');
  if (!cards.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('studio-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(c => io.observe(c));
})();

// Accordion — Pourquoi nous choisir (formations mobile)
document.querySelectorAll('.form-accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const body = btn.nextElementSibling;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    body.classList.toggle('open', !expanded);
  });
});

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
