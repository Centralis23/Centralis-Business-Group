'use strict';

/* ═══════════════════════════════════════
   1. CUSTOM CURSOR
═══════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = ring.style.display = 'none';
    return;
  }

  let dx = 0, dy = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function(e) {
    dx = e.clientX; dy = e.clientY;
  }, { passive: true });

  (function loop() {
    rx += (dx - rx) * 0.13;
    ry += (dy - ry) * 0.13;
    dot.style.left  = dx + 'px';
    dot.style.top   = dy + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .tilt-card, .magnetic').forEach(function(el) {
    el.addEventListener('mouseenter', function() { document.body.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', function() { document.body.classList.remove('cursor-hover'); });
  });
})();


/* ═══════════════════════════════════════
   2. INTRO → trigger scramble when done
═══════════════════════════════════════ */
(function initIntro() {
  var intro = document.getElementById('intro');
  if (!intro) return;
  // After wipe animation ends (~2.75s), mark done and start hero animations
  setTimeout(function() {
    intro.classList.add('done');
    setTimeout(function() {
      intro.style.display = 'none';
    }, 300);
    startHeroSequence();
  }, 2750);
})();


/* ═══════════════════════════════════════
   3. TEXT SCRAMBLE ENGINE
═══════════════════════════════════════ */
var SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

function scrambleText(element, finalText, duration, onDone) {
  var totalFrames = Math.round(duration / 16);
  var frame = 0;

  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
  element.classList.add('revealed');

  var id = setInterval(function() {
    var lockedCount = Math.floor((frame / totalFrames) * finalText.length);
    var result = '';
    for (var i = 0; i < finalText.length; i++) {
      if (finalText[i] === ' ') { result += ' '; continue; }
      if (i < lockedCount) {
        result += finalText[i];
      } else {
        result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    element.textContent = result;
    frame++;
    if (frame >= totalFrames) {
      clearInterval(id);
      element.textContent = finalText;
      if (onDone) onDone();
    }
  }, 16);
}


/* ═══════════════════════════════════════
   4. HERO SEQUENCE
═══════════════════════════════════════ */
function startHeroSequence() {
  var words = document.querySelectorAll('.scramble-word');
  if (!words.length) return;

  var delay = 0;
  words.forEach(function(word, i) {
    var text = word.getAttribute('data-text') || word.textContent;
    var lineDelay = parseInt(word.closest('.hero-line') && word.closest('.hero-line').getAttribute('data-delay') || 0);
    var wordDelay = delay + lineDelay + i * 140;
    setTimeout(function() {
      scrambleText(word, text, 480);
    }, wordDelay);
  });
}


/* ═══════════════════════════════════════
   5. CANVAS PARTICLE SYSTEM
═══════════════════════════════════════ */
(function initCanvas() {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W, H, particles = [];
  var mouse = { x: -999, y: -999 };
  var COUNT = 70;
  var CONNECTION_DIST = 140;
  var MOUSE_DIST = 120;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r  = Math.random() * 2 + 1;
    this.alpha = Math.random() * 0.4 + 0.1;
  }

  Particle.prototype.update = function() {
    var dx = mouse.x - this.x;
    var dy = mouse.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_DIST) {
      var force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.015;
      this.vx -= dx * force;
      this.vy -= dy * force;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  };

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      var p = particles[i];

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26,86,255,' + p.alpha + ')';
      ctx.fill();

      // Draw connections
      for (var j = i + 1; j < particles.length; j++) {
        var q = particles[j];
        var dx = p.x - q.x;
        var dy = p.y - q.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          var opacity = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(26,86,255,' + opacity + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('resize', function() { resize(); init(); });
  init();
  draw();
})();


/* ═══════════════════════════════════════
   6. MAGNETIC BUTTONS
═══════════════════════════════════════ */
(function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.magnetic').forEach(function(el) {
    el.addEventListener('mousemove', function(e) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) * 0.35;
      var dy = (e.clientY - cy) * 0.35;
      el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    });
    el.addEventListener('mouseleave', function() {
      el.style.transform = 'translate(0,0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(function() { el.style.transition = ''; }, 500);
    });
  });
})();


/* ═══════════════════════════════════════
   7. ORB PARALLAX
═══════════════════════════════════════ */
(function initOrbParallax() {
  var orbs = [document.querySelector('.orb-1'), document.querySelector('.orb-2'), document.querySelector('.orb-3')];
  if (!orbs[0]) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var tx = 0, ty = 0, mx = 0, my = 0;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX - window.innerWidth / 2;
    my = e.clientY - window.innerHeight / 2;
  }, { passive: true });

  (function loop() {
    tx += (mx - tx) * 0.06;
    ty += (my - ty) * 0.06;
    if (orbs[0]) orbs[0].style.transform = 'translate(' + tx * 0.025 + 'px,' + ty * 0.025 + 'px)';
    if (orbs[1]) orbs[1].style.transform = 'translate(' + tx * -0.03 + 'px,' + ty * -0.03 + 'px)';
    if (orbs[2]) orbs[2].style.transform = 'translate(' + tx * 0.018 + 'px,' + ty * 0.018 + 'px)';
    requestAnimationFrame(loop);
  })();
})();


/* ═══════════════════════════════════════
   8. NAV SCROLL + BURGER
═══════════════════════════════════════ */
(function initNav() {
  var navbar = document.getElementById('navbar');
  var burger = document.querySelector('.burger');
  if (!navbar) return;

  window.addEventListener('scroll', function() {
    navbar.classList.toggle('nav-scrolled', window.scrollY > 50);
  }, { passive: true });

  if (burger) {
    burger.addEventListener('click', function() {
      var open = navbar.classList.toggle('nav-open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', open);
    });
  }

  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.addEventListener('click', function() {
      navbar.classList.remove('nav-open');
      if (burger) { burger.classList.remove('active'); burger.setAttribute('aria-expanded', false); }
    });
  });
})();


/* ═══════════════════════════════════════
   9. SCROLL REVEAL
═══════════════════════════════════════ */
(function initScrollReveal() {
  var els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  els.forEach(function(el) { obs.observe(el); });
})();


/* ═══════════════════════════════════════
   10. MANIFESTE WORD ANIMATION
═══════════════════════════════════════ */
(function initManifesteWords() {
  var bq = document.querySelector('.manifeste-quote');
  if (!bq) return;
  var done = false;
  var obs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !done) {
      done = true;
      bq.querySelectorAll('.word').forEach(function(w, i) {
        setTimeout(function() { w.classList.add('visible'); }, i * 45);
      });
      obs.disconnect();
    }
  }, { threshold: 0.2 });
  obs.observe(bq);
})();


/* ═══════════════════════════════════════
   11. COUNTER ANIMATION
═══════════════════════════════════════ */
(function initCounters() {
  var section = document.querySelector('.stats');
  if (!section) return;
  var done = false;

  function ease(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    var special = el.dataset.special;
    if (special) { setTimeout(function() { el.textContent = special; }, 1700); return; }
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


/* ═══════════════════════════════════════
   12. 3D TILT CARDS
═══════════════════════════════════════ */
(function initTiltCards() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.tilt-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var r = card.getBoundingClientRect();
      var rx = -((e.clientY - r.top)  / r.height - 0.5) * 10;
      var ry =  ((e.clientX - r.left) / r.width  - 0.5) * 10;
      card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(6px)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      card.style.transform = '';
      setTimeout(function() { card.style.transition = ''; }, 500);
    });
  });
})();


/* ═══════════════════════════════════════
   13. SMOOTH SCROLL
═══════════════════════════════════════ */
(function initSmoothScroll() {
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


/* ═══════════════════════════════════════
   14. CONTACT FORM
═══════════════════════════════════════ */
(function initForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = form.querySelector('.form-submit');
    var orig = btn.textContent;
    var name = form.querySelector('#name') && form.querySelector('#name').value.trim();
    var email = form.querySelector('#email') && form.querySelector('#email').value.trim();
    var msg = form.querySelector('#message') && form.querySelector('#message').value.trim();
    if (!name || !email || !msg) {
      btn.textContent = 'Veuillez remplir tous les champs';
      btn.style.background = '#e53e3e';
      setTimeout(function() { btn.textContent = orig; btn.style.background = ''; }, 3000);
      return;
    }
    btn.textContent = 'Envoi…'; btn.disabled = true; btn.style.opacity = '0.7';
    setTimeout(function() {
      btn.textContent = 'Message envoyé ✓'; btn.style.background = '#38a169'; btn.style.opacity = '1';
      setTimeout(function() { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; form.reset(); }, 3000);
    }, 1500);
  });
})();
