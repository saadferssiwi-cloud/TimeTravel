/* ═══════════════════════════════════════════════════════════════
   TimeTravel Agency — Main JavaScript
   Loader · Stars · Portal · Navbar · Counters · Modals
   Quiz · Chatbot · Booking · FAQ · Carousel · Clock
═══════════════════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════════════════════ STATE ═══════════
const state = {
  chatOpen: false,
  quizAnswers: {},
  currentSlide: 0,
  totalSlides: 3,
  travelers: 1,
};

/* ════════════════════════════════════════════════════════════
   1. LOADER
════════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader    = document.getElementById('loader');
  const bar       = document.getElementById('loaderBar');
  const percent   = document.getElementById('loaderPercent');
  const canvas    = document.getElementById('loaderCanvas');
  const ctx       = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  // Particle field on loader canvas
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.6 + 0.2,
  }));

  function drawLoader() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
      ctx.fill();
    });
    if (!loader.classList.contains('fade-out')) requestAnimationFrame(drawLoader);
  }
  drawLoader();

  let prog = 0;
  const steps = [
    { to: 30, delay: 200 },
    { to: 55, delay: 400 },
    { to: 78, delay: 300 },
    { to: 95, delay: 500 },
    { to: 100, delay: 300 },
  ];

  function runStep(i) {
    if (i >= steps.length) {
      setTimeout(() => {
        loader.classList.add('fade-out');
        initApp();
      }, 400);
      return;
    }
    const { to, delay } = steps[i];
    const interval = setInterval(() => {
      prog++;
      bar.style.width = prog + '%';
      percent.textContent = prog + '%';
      if (prog >= to) {
        clearInterval(interval);
        setTimeout(() => runStep(i + 1), delay);
      }
    }, 18);
  }
  setTimeout(() => runStep(0), 600);
})();

/* ════════════════════════════════════════════════════════════
   2. INIT APP (called after loader)
════════════════════════════════════════════════════════════ */
function initApp() {
  initStarCanvas();
  initPortalParticles();
  initNavbar();
  initScrollAnimations();
  initCounters();
  initCarousel();
  initClock();
  initVoyageCounter();
  setTimeout(() => toggleChatbot(), 3000); // Auto-open chatbot hint after 3s
}

/* ════════════════════════════════════════════════════════════
   3. STAR CANVAS (interactive)
════════════════════════════════════════════════════════════ */
function initStarCanvas() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 220 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.2,
    alpha: Math.random() * 0.7 + 0.1,
    speed: Math.random() * 0.15 + 0.02,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
  }));

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.twinkle += s.twinkleSpeed;
      const alpha = s.alpha * (0.5 + 0.5 * Math.sin(s.twinkle));

      // Subtle mouse parallax
      const dx = (mouse.x - canvas.width / 2) * 0.002;
      const dy = (mouse.y - canvas.height / 2) * 0.002;

      ctx.beginPath();
      ctx.arc(s.x + dx * s.r * 10, s.y + dy * s.r * 10, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248,248,248,${alpha})`;
      ctx.fill();
    });

    // Shooting star occasionally
    if (Math.random() < 0.003) {
      spawnShootingStar(ctx, canvas);
    }

    requestAnimationFrame(draw);
  }
  draw();
}

let shootingStars = [];
function spawnShootingStar(ctx, canvas) {
  const star = {
    x: Math.random() * canvas.width * 0.7,
    y: Math.random() * canvas.height * 0.4,
    len: 120 + Math.random() * 100,
    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
    speed: 8 + Math.random() * 6,
    alpha: 1,
    life: 0,
  };
  let frame = 0;
  function animateStar() {
    frame++;
    star.x += Math.cos(star.angle) * star.speed;
    star.y += Math.sin(star.angle) * star.speed;
    star.alpha = Math.max(0, 1 - frame / 30);
    if (frame < 30 && star.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = star.alpha;
      const grad = ctx.createLinearGradient(
        star.x, star.y,
        star.x - Math.cos(star.angle) * star.len,
        star.y - Math.sin(star.angle) * star.len
      );
      grad.addColorStop(0, 'rgba(212,175,55,0.9)');
      grad.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(
        star.x - Math.cos(star.angle) * star.len,
        star.y - Math.sin(star.angle) * star.len
      );
      ctx.stroke();
      ctx.restore();
      requestAnimationFrame(animateStar);
    }
  }
  animateStar();
}

/* ════════════════════════════════════════════════════════════
   4. PORTAL PARTICLES
════════════════════════════════════════════════════════════ */
function initPortalParticles() {
  const container = document.getElementById('portalParticles');
  if (!container) return;

  for (let i = 0; i < 18; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: ${3 + Math.random() * 4}px;
      height: ${3 + Math.random() * 4}px;
      background: ${Math.random() > 0.5 ? 'rgba(212,175,55,0.8)' : 'rgba(139,92,246,0.8)'};
      border-radius: 50%;
      top: 50%; left: 50%;
      animation: particleOrbit${i % 3} ${3 + Math.random() * 4}s linear infinite;
      animation-delay: ${-Math.random() * 4}s;
      transform-origin: ${100 + Math.random() * 160}px 0;
      box-shadow: 0 0 6px currentColor;
    `;
    container.appendChild(dot);
  }

  // Inject keyframes for particle orbits
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleOrbit0 {
      from { transform: rotate(0deg) translateX(${130 + Math.random()*40}px); }
      to   { transform: rotate(360deg) translateX(${130 + Math.random()*40}px); }
    }
    @keyframes particleOrbit1 {
      from { transform: rotate(0deg) translateX(${160 + Math.random()*30}px); }
      to   { transform: rotate(-360deg) translateX(${160 + Math.random()*30}px); }
    }
    @keyframes particleOrbit2 {
      from { transform: rotate(120deg) translateX(${200 + Math.random()*40}px); }
      to   { transform: rotate(480deg) translateX(${200 + Math.random()*40}px); }
    }
  `;
  document.head.appendChild(style);
}

/* ════════════════════════════════════════════════════════════
   5. NAVBAR
════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id], footer[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}

/* ════════════════════════════════════════════════════════════
   6. SCROLL ANIMATIONS
════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-delay') || '0');
        setTimeout(() => entry.target.classList.add('in-view'), delay);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════════════════════
   7. ANIMATED COUNTERS
════════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el      = entry.target;
        const target  = parseFloat(el.getAttribute('data-target'));
        const suffix  = el.getAttribute('data-suffix') || '';
        const isFloat = target % 1 !== 0;
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;

          if (target >= 1000) {
            el.textContent = Math.floor(value).toLocaleString('fr-FR') + suffix;
          } else if (isFloat) {
            el.textContent = value.toFixed(1) + suffix;
          } else {
            el.textContent = Math.floor(value) + suffix;
          }

          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ════════════════════════════════════════════════════════════
   8. DESTINATION MODALS
════════════════════════════════════════════════════════════ */
function openModal(id) {
  const modal = document.getElementById(`modal-${id}`);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(`modal-${id}`);
  if (!modal) return;
  modal.style.animation = 'modalFadeIn 0.2s ease reverse';
  setTimeout(() => {
    modal.classList.remove('open');
    modal.style.animation = '';
    document.body.style.overflow = '';
  }, 200);
}

function closeModalOnOverlay(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['paris', 'florence', 'cretaceous'].forEach(id => closeModal(id));
  }
});

function setDestination(dest) {
  const select = document.getElementById('destination');
  if (select) {
    select.value = dest;
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  }
}

/* ════════════════════════════════════════════════════════════
   9. AI QUIZ
════════════════════════════════════════════════════════════ */
function selectQuizOpt(btn, step) {
  const panel = document.getElementById(`quiz-step-${step}`);
  panel.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.quizAnswers[step] = btn.getAttribute('data-value');
  document.getElementById(`quiz-next-${step}`).disabled = false;

  // Update step indicators
  document.querySelectorAll('.quiz-step').forEach((el, i) => {
    if (i + 1 < step) el.classList.add('done');
    if (i + 1 === step) el.classList.add('active');
  });
}

function quizNext(nextStep) {
  const currentPanel = document.getElementById(`quiz-step-${nextStep - 1}`);
  const nextPanel    = document.getElementById(`quiz-step-${nextStep}`);
  if (!nextPanel) return;

  currentPanel.classList.remove('active');
  nextPanel.classList.add('active');

  // Activate step indicator
  document.querySelectorAll('.quiz-step').forEach((el, i) => {
    if (i + 1 < nextStep) el.classList.add('done');
    if (i + 1 === nextStep) { el.classList.add('active'); el.classList.remove('done'); }
  });
}

function quizFinish() {
  const interest = state.quizAnswers[1];
  const budget   = parseInt(state.quizAnswers[2]);
  const duration = parseInt(state.quizAnswers[3]);

  // Recommendation logic
  let recommendation;

  if (interest === 'aventure' || interest === 'science' || duration === 7 || budget >= 10000) {
    recommendation = {
      dest: 'Crétacé — -65 millions d\'années',
      icon: '🦕',
      price: '6 990 €',
      why: 'Votre profil d\'aventurier et votre goût pour la découverte scientifique font du safari préhistorique la destination idéale pour vous. Une expérience unique au monde !',
      modal: 'cretaceous',
    };
  } else if (interest === 'art' || duration >= 7 || budget >= 5000) {
    recommendation = {
      dest: 'Florence 1504 — Renaissance Italienne',
      icon: '🎨',
      price: '4 290 €',
      why: 'Votre sensibilité artistique et votre amour de la culture font de la Florence de la Renaissance votre destination de rêve. Rencontrez Michel-Ange et Léonard de Vinci !',
      modal: 'florence',
    };
  } else {
    recommendation = {
      dest: 'Paris 1889 — Belle Époque',
      icon: '🗼',
      price: '3 490 €',
      why: 'Votre passion pour l\'histoire et la culture européenne fait de Paris 1889 le voyage parfait. Assistez à la naissance de la Tour Eiffel lors de l\'Exposition Universelle !',
      modal: 'paris',
    };
  }

  // Show result panel
  document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('done'));
  document.getElementById('quiz-step-3').classList.remove('active');
  document.getElementById('quizResultIcon').textContent = recommendation.icon;

  document.getElementById('quizResultCard').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
      <div style="font-size:2.5rem;">${recommendation.icon}</div>
      <div>
        <div style="font-family:'Orbitron',sans-serif;font-size:0.65rem;font-weight:700;color:var(--gold);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Destination recommandée</div>
        <div style="font-family:'Cinzel',serif;font-size:1.2rem;font-weight:700;">${recommendation.dest}</div>
      </div>
    </div>
    <p style="color:var(--muted);font-size:0.92rem;line-height:1.65;margin-bottom:20px;">${recommendation.why}</p>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-size:0.72rem;color:var(--muted);">À partir de</div>
        <div style="font-family:'Orbitron',sans-serif;font-size:1.5rem;font-weight:800;color:var(--gold);">${recommendation.price}</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn-secondary" onclick="openModal('${recommendation.modal}')" style="padding:10px 18px;font-size:0.85rem;">En savoir plus</button>
        <a href="#booking" class="btn-primary" onclick="setDestination('${recommendation.dest}')" style="padding:10px 18px;font-size:0.85rem;"><span>Réserver</span></a>
      </div>
    </div>
  `;

  document.getElementById('quiz-result').classList.add('active');
}

function quizRestart() {
  state.quizAnswers = {};
  document.querySelectorAll('.quiz-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('quiz-step-1').classList.add('active');
  document.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.btn-quiz-next').forEach(b => b.disabled = true);
  document.querySelectorAll('.quiz-step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i === 0) el.classList.add('active');
  });
}

/* ════════════════════════════════════════════════════════════
   10. TESTIMONIALS CAROUSEL
════════════════════════════════════════════════════════════ */
function initCarousel() {
  const carousel = document.getElementById('carousel');
  const dotsWrap = document.getElementById('carouselDots');
  if (!carousel) return;

  // Create dots
  for (let i = 0; i < state.totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Témoignage ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  }

  function goToSlide(index) {
    state.currentSlide = index;
    carousel.style.transform = `translateX(-${index * 100}%)`;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  // Auto-advance every 5s
  setInterval(() => {
    goToSlide((state.currentSlide + 1) % state.totalSlides);
  }, 5000);

  // Touch/drag support
  let startX = 0;
  carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 50) {
      goToSlide(delta < 0
        ? Math.min(state.currentSlide + 1, state.totalSlides - 1)
        : Math.max(state.currentSlide - 1, 0)
      );
    }
  });
}

/* ════════════════════════════════════════════════════════════
   11. BOOKING FORM
════════════════════════════════════════════════════════════ */
function changeTravelers(delta) {
  state.travelers = Math.max(1, Math.min(20, state.travelers + delta));
  document.getElementById('travelersCount').textContent = state.travelers;
  document.getElementById('travelers').value = state.travelers;
}

function validateField(id, errorId, validator) {
  const input = document.getElementById(id);
  const error = document.getElementById(errorId);
  if (!input || !error) return true;

  const result = validator(input.value);
  if (result) {
    input.classList.remove('error');
    error.textContent = '';
    return true;
  } else {
    input.classList.add('error');
    return false;
  }
}

function setFieldError(inputId, errorId, msg) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) error.textContent = msg;
}

function submitBooking(event) {
  event.preventDefault();

  let valid = true;

  // First name
  const firstName = document.getElementById('firstName').value.trim();
  if (firstName.length < 2) {
    setFieldError('firstName', 'err-firstName', 'Veuillez entrer votre prénom.');
    valid = false;
  } else { clearError('firstName', 'err-firstName'); }

  // Last name
  const lastName = document.getElementById('lastName').value.trim();
  if (lastName.length < 2) {
    setFieldError('lastName', 'err-lastName', 'Veuillez entrer votre nom.');
    valid = false;
  } else { clearError('lastName', 'err-lastName'); }

  // Email
  const email = document.getElementById('email').value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    setFieldError('email', 'err-email', 'Adresse email invalide.');
    valid = false;
  } else { clearError('email', 'err-email'); }

  // Destination
  const dest = document.getElementById('destination').value;
  if (!dest) {
    setFieldError('destination', 'err-destination', 'Veuillez choisir une destination.');
    valid = false;
  } else { clearError('destination', 'err-destination'); }

  // Date
  const date = document.getElementById('travelDate').value;
  if (!date) {
    setFieldError('travelDate', 'err-travelDate', 'Veuillez choisir une date.');
    valid = false;
  } else { clearError('travelDate', 'err-travelDate'); }

  if (!valid) return;

  // Success
  const form    = document.getElementById('bookingForm');
  const success = document.getElementById('bookingSuccess');
  const wrap    = document.querySelector('.booking-wrap');

  if (wrap) wrap.style.display = 'none';
  if (success) success.classList.add('show');

  // Scroll to success
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('error');
  if (error) error.textContent = '';
}

// Real-time validation on blur
document.addEventListener('DOMContentLoaded', () => {
  const formFields = ['firstName', 'lastName', 'email', 'destination', 'travelDate'];
  formFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', () => {
        if (el.value.trim()) clearError(id, `err-${id}`);
      });
    }
  });
});

/* ════════════════════════════════════════════════════════════
   12. FAQ ACCORDION
════════════════════════════════════════════════════════════ */
function toggleFAQ(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));

  // Open clicked (if was closed)
  if (!isOpen) item.classList.add('open');
}

/* ════════════════════════════════════════════════════════════
   13. CHATBOT — Chronos IA
════════════════════════════════════════════════════════════ */
const chronosResponses = {
  default: "Je suis là pour vous guider dans votre aventure temporelle ! Vous pouvez me demander des informations sur nos destinations, nos tarifs, la sécurité, ou comment fonctionne notre technologie quantique. ⏳",

  greetings: ["bonjour", "salut", "hello", "bonsoir", "coucou"],
  greetingsReply: "Bonjour ! Je suis **Chronos**, votre conseiller en voyages temporels chez TimeTravel Agency. ✨ Comment puis-je vous aider aujourd'hui ?",

  paris: ["paris", "1889", "eiffel", "exposition universelle", "belle époque", "belle epoque"],
  parisReply: "🗼 **Paris 1889** est notre destination phare ! Vous vivrez en direct l'inauguration de la Tour Eiffel lors de l'Exposition Universelle. Vous côtoierez les grands artistes et inventeurs de la Belle Époque.\n\n📅 Durée : 3 jours\n💰 Prix : à partir de **3 490 €**\n🟢 Niveau de risque : Minimal\n\nC'est notre best-seller — et pour cause ! Voulez-vous réserver ?",

  florence: ["florence", "renaissance", "michel-ange", "michel ange", "leonard", "léonard", "vinci", "1504", "medicis", "médicis"],
  florenceReply: "🎨 **Florence 1504** — le joyau de notre catalogue ! Vous plongez au cœur de la Renaissance italienne. Rencontrez Michel-Ange dans son atelier, assistez aux conférences de Léonard de Vinci, et explorez les palais des Médicis.\n\n📅 Durée : 7 jours\n💰 Prix : à partir de **4 290 €**\n🟢 Niveau de risque : Minimal\n\nUne expérience artistique et culturelle incomparable !",

  cretaceous: ["crétacé", "cretace", "dinosaure", "dino", "t-rex", "tyrannosaure", "préhistorique", "prehistorique", "65 million"],
  cretaceousReply: "🦕 **Le Crétacé** — notre aventure la plus épique ! Depuis nos capsules d'observation blindées de dernière génération, vous observerez des T-Rex, Triceratops et Ptérodactyles dans leur habitat naturel.\n\n📅 Durée : 1 semaine\n💰 Prix : à partir de **6 990 €**\n🟡 Niveau de risque : Modéré (mais sécurisé à 100%)\n\nDéconseillé aux cardiaques, recommandé aux aventuriers ! 😄",

  price: ["prix", "tarif", "combien", "coût", "coute", "coûte", "cher"],
  priceReply: "💰 Voici nos tarifs :\n\n🗼 **Paris 1889** — à partir de **3 490 €**/personne\n🎨 **Florence 1504** — à partir de **4 290 €**/personne\n🦕 **Crétacé** — à partir de **6 990 €**/personne\n\nCes prix incluent le transport temporel aller-retour, le guide expert et l'hébergement d'époque. Des options supplémentaires (assurance, guide privé, capsule VIP) sont disponibles.",

  safety: ["sécurité", "securite", "sécurisé", "securise", "risque", "danger", "dangereux", "peur", "safe"],
  safetyReply: "🛡️ La sécurité est notre priorité absolue ! Voici nos protocoles :\n\n✅ Taux de retour réussi : **99,8%**\n✅ 47 systèmes de sécurité redondants\n✅ Bracelet Quantum d'Urgence (rapatriement en 3 secondes)\n✅ Centre de contrôle 24h/24\n✅ Équipe de 12 experts par voyage\n✅ Assurance temporelle complète disponible\n\nVous entre des mains expertes ! 💪",

  howItWorks: ["fonctionne", "comment", "technologie", "quantique", "portail", "voyage temporel"],
  howItWorksReply: "⚛️ Notre technologie repose sur le **brevet QT-2089** d'intrication quantique. En résumé :\n\n1. **Calibration** — Nous calculons précisément vos coordonnées spatio-temporelles\n2. **Portail** — Notre générateur quantique ouvre un corridor temporel\n3. **Transit** — Le voyage dure 3 à 8 secondes selon l'époque\n4. **Retour** — Le protocole automatique vous ramène à l'heure exacte de départ\n\nVous ne serez jamais absent plus de 12 secondes dans votre présent ! ✨",

  dinos: ["dinosaures dangereux", "t-rex dangereux", "danger dinosaure"],
  dinosReply: "🦖 Excellente question ! Les dinosaures sont observés exclusivement depuis nos **capsules d'observation blindées** en titane quantique. Aucun contact direct n'est possible — vous êtes 100% protégés.\n\nNos capsules résistent à des impacts de 15 tonnes et sont équipées de systèmes de camouflage holographique pour ne pas perturber l'écosystème. L'adrénaline est réelle, le danger est zéro ! 😎",

  michelange: ["rencontrer michel-ange", "rencontrer michel ange", "parler à michel-ange", "voir michel-ange"],
  michelangeReply: "🎨 Absolument ! Notre voyage **Florence 1504** inclut une visite guidée de l'atelier de Michel-Ange. En 1504, il vient de terminer le David et travaille sur de nouveaux projets.\n\nVous ne pouvez pas lui parler directement (protocole Chrono-Éthique), mais vous pouvez l'observer au travail de très près. Nos guides historiens vous fourniront le contexte en temps réel. Une émotion incomparable ! 🙌",

  booking: ["réserver", "reserver", "réservation", "reservation", "acheter", "commander"],
  bookingReply: "Parfait ! Pour réserver, rendez-vous dans notre section **Réservation** 👉 Remplissez le formulaire avec vos informations et notre équipe de chrono-navigateurs vous contactera sous **24 heures** pour confirmer votre aventure.\n\nPuis-je vous orienter vers une destination spécifique ?",

  faq: ["annuler", "annulation", "remboursement", "âge", "age", "objet", "emporter", "paradoxe"],
  faqReply: "Pour toutes les questions pratiques (annulation, remboursement, objets autorisés, limites d'âge, paradoxes temporels), consultez notre section **FAQ** sur cette page. Elle répond à toutes vos questions ! 📋\n\nAvez-vous une question spécifique ?",
};

function getChrOnosReply(message) {
  const msg = message.toLowerCase();

  const checks = [
    { keys: chronosResponses.greetings, reply: chronosResponses.greetingsReply },
    { keys: chronosResponses.paris, reply: chronosResponses.parisReply },
    { keys: chronosResponses.florence, reply: chronosResponses.florenceReply },
    { keys: chronosResponses.cretaceous, reply: chronosResponses.cretaceousReply },
    { keys: chronosResponses.price, reply: chronosResponses.priceReply },
    { keys: chronosResponses.safety, reply: chronosResponses.safetyReply },
    { keys: chronosResponses.howItWorks, reply: chronosResponses.howItWorksReply },
    { keys: chronosResponses.dinos, reply: chronosResponses.dinosReply },
    { keys: chronosResponses.michelange, reply: chronosResponses.michelangeReply },
    { keys: chronosResponses.booking, reply: chronosResponses.bookingReply },
    { keys: chronosResponses.faq, reply: chronosResponses.faqReply },
  ];

  for (const check of checks) {
    if (check.keys.some(k => msg.includes(k))) return check.reply;
  }

  return chronosResponses.default;
}

function toggleChatbot() {
  const win    = document.getElementById('chatbotWindow');
  const notif  = document.getElementById('bubbleNotif');

  state.chatOpen = !state.chatOpen;
  win.classList.toggle('open', state.chatOpen);

  if (state.chatOpen && notif) {
    notif.classList.add('hidden');
  }
}

function addMessage(text, isUser = false) {
  const container = document.getElementById('chatMessages');

  // Remove quick replies on first user message
  const qr = document.getElementById('quickReplies');
  if (isUser && qr) qr.style.display = 'none';

  const msgEl = document.createElement('div');
  msgEl.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
  msgEl.innerHTML = `<div class="msg-bubble">${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</div>`;
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.id = 'typingIndicator';
  typing.innerHTML = `<div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;

  addMessage(text, true);
  input.value = '';

  showTyping();
  const delay = 800 + Math.random() * 700;

  setTimeout(() => {
    removeTyping();
    const reply = getChrOnosReply(text);
    addMessage(reply, false);
  }, delay);
}

function quickReply(text) {
  if (!state.chatOpen) toggleChatbot();
  setTimeout(() => {
    document.getElementById('chatInput').value = text;
    sendChat();
  }, 200);
}

/* ════════════════════════════════════════════════════════════
   14. CLOCK WIDGET
════════════════════════════════════════════════════════════ */
function initClock() {
  const display = document.getElementById('clockDisplay');
  const dateEl  = document.getElementById('clockDate');
  if (!display) return;

  const months = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  const days   = ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'];

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    display.textContent = `${h}:${m}:${s}`;

    if (dateEl) {
      dateEl.textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
  }

  update();
  setInterval(update, 1000);
}

/* ════════════════════════════════════════════════════════════
   15. LIVE VOYAGE COUNTER
════════════════════════════════════════════════════════════ */
function initVoyageCounter() {
  const counter = document.getElementById('voyagesCount');
  if (!counter) return;

  // Simulate live active voyages (fluctuates between 3 and 12)
  let current = 5 + Math.floor(Math.random() * 5);

  function update() {
    const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
    current = Math.max(3, Math.min(12, current + change));
    counter.textContent = current;
  }

  counter.textContent = current;
  setInterval(update, 4000 + Math.random() * 3000);
}

/* ════════════════════════════════════════════════════════════
   16. SMOOTH ANCHOR SCROLL
════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
