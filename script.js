/* =============================================
   CENTRALIS BUSINESS GROUP — script.js
   ============================================= */

'use strict';

/* ── 1. NAV SCROLL EFFECT ── */
(function initNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('nav-scrolled');
    } else {
      navbar.classList.remove('nav-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ── 2. MOBILE BURGER MENU ── */
(function initBurger() {
  const burger = document.querySelector('.burger');
  const navbar = document.getElementById('navbar');
  if (!burger || !navbar) return;

  burger.addEventListener('click', function () {
    const isOpen = navbar.classList.toggle('nav-open');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', isOpen.toString());
  });
})();


/* ── 10. CLOSE MOBILE MENU ON NAV LINK CLICK ── */
(function initNavLinkClose() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const navbar = document.getElementById('navbar');
  const burger = document.querySelector('.burger');
  if (!navbar) return;

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navbar.classList.remove('nav-open');
      if (burger) {
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();


/* ── 3. HERO WORD ANIMATION ── */
document.addEventListener('DOMContentLoaded', function () {
  const heroWords = document.querySelectorAll('.hero .word');
  heroWords.forEach(function (word, index) {
    setTimeout(function () {
      word.classList.add('visible');
    }, index * 80 + 200);
  });
});


/* ── 4. SCROLL REVEAL (IntersectionObserver) ── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.scroll-reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ── 5. COUNTER ANIMATION ── */
(function initCounters() {
  const statsSection = document.querySelector('.stats');
  if (!statsSection) return;

  let animated = false;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const special = el.dataset.special;
    const duration = 2000;
    const startTime = performance.now();

    // Handle special values like "7/7"
    if (special) {
      setTimeout(function () {
        el.textContent = special;
      }, duration * 0.85);
      return;
    }

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !animated) {
        animated = true;
        const counters = statsSection.querySelectorAll('.counter');
        counters.forEach(function (counter) {
          animateCounter(counter);
        });
        observer.unobserve(statsSection);
      }
    });
  }, {
    threshold: 0.3
  });

  observer.observe(statsSection);
})();


/* ── 6. HERO ORB PARALLAX ── */
(function initOrbParallax() {
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  const orb3 = document.querySelector('.orb-3');

  if (!orb1 || !orb2 || !orb3) return;

  // Only run parallax on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let rafId = null;
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
  }, { passive: true });

  function animateOrbs() {
    targetX += (mouseX - targetX) * 0.08;
    targetY += (mouseY - targetY) * 0.08;

    orb1.style.transform = 'translate(' + (targetX * 0.02) + 'px, ' + (targetY * 0.02) + 'px)';
    orb2.style.transform = 'translate(' + (targetX * -0.03) + 'px, ' + (targetY * -0.03) + 'px)';
    orb3.style.transform = 'translate(' + (targetX * 0.015) + 'px, ' + (targetY * 0.015) + 'px)';

    rafId = requestAnimationFrame(animateOrbs);
  }

  animateOrbs();
})();


/* ── 7. 3D TILT ON CARDS ── */
(function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  // Only run tilt on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 8;
      const rotateX = -((y - centerY) / centerY) * 8;

      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(4px)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      // Smooth reset
      card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(function () {
        card.style.transition = 'transform 0.1s ease';
      }, 400);
    });

    card.addEventListener('mouseenter', function () {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();


/* ── 8. MANIFESTE WORD ANIMATION ── */
(function initManifesteWords() {
  const blockquote = document.querySelector('.manifeste-quote');
  if (!blockquote) return;

  let animated = false;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !animated) {
        animated = true;
        const words = blockquote.querySelectorAll('.word');
        words.forEach(function (word, index) {
          setTimeout(function () {
            word.classList.add('visible');
          }, index * 50);
        });
        observer.unobserve(blockquote);
      }
    });
  }, {
    threshold: 0.2
  });

  observer.observe(blockquote);
})();


/* ── 9. SMOOTH SCROLL ── */
(function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('navbar') ? document.getElementById('navbar').offsetHeight : 80;
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    });
  });
})();


/* ── CONTACT FORM HANDLER ── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;

    // Basic validation
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      submitBtn.textContent = 'Veuillez remplir tous les champs requis';
      submitBtn.style.background = '#e53e3e';
      setTimeout(function () {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
      }, 3000);
      return;
    }

    // Simulate submission
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    setTimeout(function () {
      submitBtn.textContent = 'Message envoyé !';
      submitBtn.style.background = '#38a169';
      submitBtn.style.opacity = '1';

      setTimeout(function () {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        form.reset();
      }, 3000);
    }, 1500);
  });
})();


/* ── SCROLL INDICATOR CLICK ── */
(function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  indicator.addEventListener('click', function () {
    const manifeste = document.querySelector('.manifeste');
    if (manifeste) {
      manifeste.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();
