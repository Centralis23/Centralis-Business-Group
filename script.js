'use strict';

/* ─── 1. NAV SCROLL + BURGER ─── */
(function() {
  var nav = document.getElementById('navbar');
  var burger = document.querySelector('.burger');
  if (!nav) return;

  window.addEventListener('scroll', function() {
    nav.classList.toggle('nav-scrolled', window.scrollY > 60);
  }, { passive: true });

  if (burger) {
    burger.addEventListener('click', function() {
      var open = nav.classList.toggle('nav-open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', open);
    });
  }
  document.querySelectorAll('.nav-links a, .btn-nav-cta').forEach(function(a) {
    a.addEventListener('click', function() {
      nav.classList.remove('nav-open');
      if (burger) { burger.classList.remove('active'); burger.setAttribute('aria-expanded', false); }
    });
  });
})();

/* ─── 2. SMOOTH SCROLL ─── */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var id = a.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = (document.getElementById('navbar') || {}).offsetHeight || 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
    });
  });
})();

/* ─── 3. SCROLL REVEAL ─── */
(function() {
  var els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function(el) { obs.observe(el); });
})();

/* ─── 4. COUNTER ANIMATION ─── */
(function() {
  var section = document.querySelector('.chiffres');
  if (!section) return;
  var done = false;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var start = performance.now();
    var dur = 2000;
    (function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(ease(p) * target);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target;
    })(start);
  }
  new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !done) {
      done = true;
      section.querySelectorAll('.counter').forEach(animateCounter);
    }
  }, { threshold: 0.3 }).observe(section);
})();

/* ─── 5. HERO VIDEO FALLBACK ─── */
(function() {
  var video = document.querySelector('.hero-video');
  if (!video) return;
  video.addEventListener('error', function() {
    video.style.display = 'none';
  });
  // If video doesn't load in 3s, hide it (graceful fallback to CSS bg)
  setTimeout(function() {
    if (video.readyState === 0) video.style.display = 'none';
  }, 3000);
})();

/* ─── 6. CONTACT FORM AJAX → contact.php ─── */
(function() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var subjectSelect = form.querySelector('#subject');
  var dateRow = document.getElementById('dateRow');
  if (subjectSelect && dateRow) {
    subjectSelect.addEventListener('change', function() {
      var showDate = ['salle-reunion','salle-formation','evenement','studio-podcast'].includes(this.value);
      dateRow.style.display = showDate ? 'grid' : 'none';
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = form.querySelector('.form-submit');
    var btnText = btn.querySelector('.form-submit-text') || btn;
    var origText = btnText.textContent;

    var name    = (form.querySelector('#name')    || {}).value || '';
    var email   = (form.querySelector('#email')   || {}).value || '';
    var message = (form.querySelector('#message') || {}).value || '';
    var rgpd    = form.querySelector('#rgpd') && form.querySelector('#rgpd').checked;

    if (!name.trim() || !email.trim() || !message.trim()) {
      shake(btn); btnText.textContent = 'Remplissez les champs obligatoires *';
      btn.style.background = '#e53e3e';
      setTimeout(function() { btnText.textContent = origText; btn.style.background = ''; }, 3000);
      return;
    }
    if (!rgpd) {
      shake(btn); btnText.textContent = 'Acceptez la politique de confidentialité';
      btn.style.background = '#e53e3e';
      setTimeout(function() { btnText.textContent = origText; btn.style.background = ''; }, 3000);
      return;
    }

    btn.disabled = true; btn.style.opacity = '0.7';
    btnText.textContent = 'Envoi en cours…';

    fetch('contact.php', { method: 'POST', body: new FormData(form) })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          btnText.textContent = '✓ Message envoyé !';
          btn.style.background = '#16a34a'; btn.style.opacity = '1';
          form.reset();
          if (dateRow) dateRow.style.display = 'none';
          setTimeout(function() { btnText.textContent = origText; btn.style.background = ''; btn.disabled = false; }, 5000);
        } else { throw new Error(res.message || 'Erreur'); }
      })
      .catch(function(err) {
        btnText.textContent = err.message || 'Erreur — réessayez';
        btn.style.background = '#e53e3e'; btn.style.opacity = '1'; btn.disabled = false;
        setTimeout(function() { btnText.textContent = origText; btn.style.background = ''; }, 5000);
      });
  });

  function shake(el) {
    el.style.animation = 'none'; el.offsetHeight;
    el.style.animation = 'formShake 0.4s ease';
    setTimeout(function() { el.style.animation = ''; }, 400);
  }
})();
