/* =============================================
   CENTRALIS BUSINESS GROUP — script.js
   ============================================= */

'use strict';

/* ────────────────────────────────────────────
   NAV: SCROLL EFFECT
   ──────────────────────────────────────────── */
const nav = document.getElementById('nav');

function handleNavScroll() {
  if (window.scrollY > 24) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run on init

/* ────────────────────────────────────────────
   NAV: MOBILE BURGER MENU
   ──────────────────────────────────────────── */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  const spans = burger.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity   = '';
  spans[2].style.transform = '';
}

burger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(isOpen));
  const spans = burger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    closeMobileMenu();
  }
});

mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

/* ────────────────────────────────────────────
   INTERSECTION OBSERVER: GENERIC REVEAL
   ──────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : 0;
    setTimeout(() => el.classList.add('is-visible'), delay);
    revealObserver.unobserve(el);
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ────────────────────────────────────────────
   MANIFESTO: WORD-BY-WORD TEXT REVEAL
   ──────────────────────────────────────────── */
function setupWordReveal() {
  const el = document.querySelector('.reveal-words');
  if (!el) return;

  const rawText = el.textContent.trim();
  const words   = rawText.split(/\s+/);

  el.innerHTML = words
    .map(w => `<span class="word"><span class="word-inner">${w}</span></span>`)
    .join(' ');

  // observe this element with the same observer
  revealObserver.observe(el);
}
setupWordReveal();

/* ────────────────────────────────────────────
   STATS: COUNTER ANIMATION
   ──────────────────────────────────────────── */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 2000; // ms
  const startTime = performance.now();

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOutQuart(progress) * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item__num[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ────────────────────────────────────────────
   HERO: SCROLL PARALLAX (ORB LAYER)
   ──────────────────────────────────────────── */
function setupScrollParallax() {
  const orb1   = document.querySelector('.hero__orb--1');
  const orb2   = document.querySelector('.hero__orb--2');
  const orb3   = document.querySelector('.hero__orb--3');
  const heroEl = document.querySelector('.hero');
  if (!heroEl) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const hh = heroEl.offsetHeight;
      if (sy > hh) { ticking = false; return; }

      if (orb1) orb1.style.transform = `translateY(${sy * 0.28}px)`;
      if (orb2) orb2.style.transform = `translateY(${-sy * 0.18}px)`;
      if (orb3) orb3.style.transform = `translate(50%, calc(-50% + ${sy * 0.14}px))`;

      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}
setupScrollParallax();

/* ────────────────────────────────────────────
   HERO: MOUSE PARALLAX
   ──────────────────────────────────────────── */
function setupMouseParallax() {
  const heroEl = document.querySelector('.hero');
  if (!heroEl) return;

  const orb1  = document.querySelector('.hero__orb--1');
  const orb2  = document.querySelector('.hero__orb--2');
  const orb3  = document.querySelector('.hero__orb--3');
  const title = document.querySelector('.hero__title');

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;

  heroEl.addEventListener('mousemove', (e) => {
    const rect  = heroEl.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width  - 0.5);
    targetY = ((e.clientY - rect.top)  / rect.height - 0.5);
    if (!rafId) rafId = requestAnimationFrame(animateMouse);
  });

  heroEl.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(animateMouse);
  });

  function animateMouse() {
    const lerpFactor = 0.055;
    currentX += (targetX - currentX) * lerpFactor;
    currentY += (targetY - currentY) * lerpFactor;

    if (orb1)  orb1.style.transform  = `translateY(${window.scrollY * 0.28}px) translate(${currentX * 32}px, ${currentY * 22}px)`;
    if (orb2)  orb2.style.transform  = `translateY(${-window.scrollY * 0.18}px) translate(${-currentX * 26}px, ${-currentY * 16}px)`;
    if (orb3)  orb3.style.transform  = `translate(calc(50% + ${currentX * 18}px), calc(-50% + ${currentY * 12}px + ${window.scrollY * 0.14}px))`;
    if (title) title.style.transform = `translate(${currentX * 9}px, ${currentY * 6}px)`;

    const settled =
      Math.abs(targetX - currentX) < 0.0005 &&
      Math.abs(targetY - currentY) < 0.0005;

    if (settled) {
      rafId = null;
    } else {
      rafId = requestAnimationFrame(animateMouse);
    }
  }
}
setupMouseParallax();

/* ────────────────────────────────────────────
   SERVICE CARDS: 3-D TILT ON HOVER
   ──────────────────────────────────────────── */
function setupCardTilt() {
  const cards = document.querySelectorAll('.service-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const nx    = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5..0.5
      const ny    = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX = ny * 10;    // rotate around X axis
      const tiltY = -nx * 10;   // rotate around Y axis
      card.style.transform  = `translateY(-10px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
}
setupCardTilt();

/* ────────────────────────────────────────────
   SMOOTH SCROLL: ANCHOR LINKS
   ──────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href   = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();

    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
      10
    ) || 72;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  });
});

/* ────────────────────────────────────────────
   ACTIVE NAV LINK ON SCROLL
   ──────────────────────────────────────────── */
function setupActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__links a[href^="#"]');
  const navOffset = (parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10
  ) || 72) + 30;

  function update() {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - navOffset) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}
setupActiveNav();

/* ────────────────────────────────────────────
   CONTACT FORM: SUBMIT HANDLER
   ──────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn      = contactForm.querySelector('button[type="submit"]');
    const btnSpan  = btn.querySelector('span');
    const origText = btnSpan.textContent;

    // Loading state
    btn.disabled         = true;
    btn.style.background = 'var(--accent-indigo)';
    btnSpan.textContent  = 'Envoi en cours…';

    // Simulate async send (replace with real fetch in production)
    setTimeout(() => {
      btn.style.background = '#16A34A';
      btnSpan.textContent  = 'Message envoyé !';
      contactForm.reset();

      setTimeout(() => {
        btn.disabled         = false;
        btn.style.background = '';
        btnSpan.textContent  = origText;
      }, 4000);
    }, 1800);
  });
}

/* ────────────────────────────────────────────
   INIT
   ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  handleNavScroll();

  // Add 3-D perspective container for service cards
  const grid = document.querySelector('.services__grid');
  if (grid) grid.style.perspective = '1200px';
});
