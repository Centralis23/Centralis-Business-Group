'use strict';

/* =======================================
   CENTRALIS BUSINESS GROUP — script.js
   Ultra-premium corporate site JS
   ======================================= */

/* ── 1. NAV SCROLL + BURGER ── */
(function () {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('nav-mobile');

  // Nav scroll class
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }, { passive: true });

  // Burger toggle
  if (burger && mobile) {
    burger.addEventListener('click', function () {
      const isOpen = mobile.classList.toggle('open');
      nav.classList.toggle('nav-open', isOpen);
    });

    // Close on mobile link click
    document.querySelectorAll('.nav-mobile-link, .nav-mobile-cta').forEach(function (link) {
      link.addEventListener('click', function () {
        mobile.classList.remove('open');
        nav.classList.remove('nav-open');
      });
    });
  }
})();


/* ── 2. SCROLL REVEAL ── */
(function () {
  const targets = document.querySelectorAll('.scroll-reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-50px 0px'
  });

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ── 3. COUNTER ANIMATION ── */
(function () {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ── 4. SMOOTH SCROLL ── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('nav').offsetHeight;
      const top       = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();


/* ── 5. 3D TILT CARDS ── */
(function () {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  // Disable on touch
  const isTouch = 'ontouchstart' in window;
  if (isTouch) return;

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -8;
      const rotY   = ((x - cx) / cx) *  8;

      card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
})();


/* ── 6. MAGNETIC BUTTONS ── */
(function () {
  const magnetics = document.querySelectorAll('.magnetic');
  if (!magnetics.length) return;

  const isTouch = 'ontouchstart' in window;
  if (isTouch) return;

  magnetics.forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      const rect   = el.getBoundingClientRect();
      const x      = e.clientX - (rect.left + rect.width  / 2);
      const y      = e.clientY - (rect.top  + rect.height / 2);
      el.style.transform = 'translate(' + x * 0.35 + 'px, ' + y * 0.35 + 'px)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = 'translate(0, 0)';
    });
  });
})();


/* ── 7. CONTACT FORM — Date field conditional + AJAX ── */
(function () {
  const form      = document.getElementById('contactForm');
  const sujet     = document.getElementById('sujet');
  const dateGroup = document.getElementById('dateGroup');
  const status    = document.getElementById('formStatus');

  if (!form) return;

  // Show date field for reservations
  if (sujet && dateGroup) {
    sujet.addEventListener('change', function () {
      const val = sujet.value;
      if (val === 'reservation-salle' || val === 'reservation-studio') {
        dateGroup.style.display = 'flex';
      } else {
        dateGroup.style.display = 'none';
      }
    });
  }

  // AJAX submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate required fields
    const nom     = form.querySelector('#nom');
    const email   = form.querySelector('#email');
    const message = form.querySelector('#message');
    const rgpd    = form.querySelector('#rgpd');

    if (!nom.value.trim()) { nom.focus(); return; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.focus(); return; }
    if (!message.value.trim()) { message.focus(); return; }
    if (!rgpd.checked) {
      rgpd.focus();
      return;
    }

    const submitBtn  = form.querySelector('.form-submit');
    const submitText = form.querySelector('.form-submit-text');

    submitBtn.disabled       = true;
    submitText.textContent   = 'Envoi en cours...';

    const formData = new FormData(form);

    fetch('contact.php', {
      method: 'POST',
      body:   formData
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.success) {
          if (status) {
            status.className    = 'form-status success';
            status.textContent  = data.message || 'Message envoye ! Nous vous repondrons sous 24h.';
          }
          form.reset();
          if (dateGroup) dateGroup.style.display = 'none';
        } else {
          if (status) {
            status.className   = 'form-status error';
            status.textContent = data.message || 'Une erreur est survenue. Veuillez reessayer.';
          }
        }
      })
      .catch(function () {
        if (status) {
          status.className   = 'form-status error';
          status.textContent = 'Erreur de connexion. Veuillez verifier votre connexion internet.';
        }
      })
      .finally(function () {
        submitBtn.disabled     = false;
        submitText.textContent = 'Envoyer le message';
      });
  });
})();
