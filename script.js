/**
 * ═══════════════════════════════════════════════════════════════════════
 * HITANSHI & SHASHANK — WEDDING WEBSITE · script.js
 * ═══════════════════════════════════════════════════════════════════════
 */

'use strict';

/* ── GLOBAL CONFIG ─────────────────────────────────────────────────────── */
// Edit the wedding date and time here (format: YYYY-MM-DDTHH:MM:SS+TimeZone)
const WEDDING_DATE = new Date('2026-11-25T19:00:00+05:30');

// The WhatsApp phone number that will receive RSVP.
// IMPORTANT: Use country code first, no leading "+" or spaces (e.g. '919876543210')
const WHATSAPP_PHONE = '919876543210';

// The WhatsApp phone number that will receive Sangeet performance & music registrations.
// IMPORTANT: Use country code first, no leading "+" or spaces (e.g. '919876543210')
const SANGEET_REGISTRATION_PHONE = '919123456789';


/* ── DOM HELPERS ───────────────────────────────────────────────────────── */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce helper to limit how often a function runs
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/* ── PAGE LOAD INITIALIZATION ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  initGuestBanner();
  initCountdown();
  initScrollReveal();
  initNavHighlight();
  initNavScroll();
  initGallery();
  initRSVPForm();
  initHeroCanvas();
  initSangeetParticipation();
  initSangeetForm();
  initMobileMenu();
  initContentNotify();
});

/* ── GUEST WELCOME BANNER ───────────────────────────────────────────────── */
function initGuestBanner() {
  const banner = $('#guest-banner');
  if (!banner) return;

  const params = new URLSearchParams(window.location.search);
  const guest = params.get('guest') || params.get('name');
  if (guest) {
    const name = decodeURIComponent(guest).trim();
    banner.innerHTML = `🌸 Dear <strong>${name}</strong>, you are warmly invited — welcome! 🌸`;
    banner.style.display = 'block';
  }
}

/* ── COUNTDOWN TIMER ───────────────────────────────────────────────────── */
function initCountdown() {
  const els = {
    days:  $('#cd-days'),
    hours: $('#cd-hours'),
    mins:  $('#cd-mins'),
    secs:  $('#cd-secs'),
  };

  function tick() {
    const diff = WEDDING_DATE.getTime() - Date.now();
    if (diff <= 0) {
      Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }
    const pad = (n) => String(n).padStart(2, '0');
    if (els.days)  els.days.textContent  = pad(Math.floor(diff / 86400000));
    if (els.hours) els.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    if (els.mins)  els.mins.textContent  = pad(Math.floor((diff % 3600000) / 60000));
    if (els.secs)  els.secs.textContent  = pad(Math.floor((diff % 60000) / 1000));
  }

  tick();
  const interval = setInterval(tick, 1000);
  window.addEventListener('pagehide', () => clearInterval(interval));
}

/* ── SCROLL REVEAL ANIMATIONS ──────────────────────────────────────────── */
function initScrollReveal() {
  const targets = $$('.reveal, .timeline-item');
  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.event-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });

  targets.forEach(el => observer.observe(el));
}

/* ── NAV SCROLL HIGHLIGHTING ────────────────────────────────────────────── */
function initNavHighlight() {
  const sections = $$('section[id]');
  const navLinks = $$('#nav-menu a');
  if (!sections.length || !navLinks.length) return;

  let ticking = false;

  function update() {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 100) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
    ticking = false;
  }

  window.addEventListener('scroll', debounce(() => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, 200), { passive: true });
}

/* ── NAVIGATION BAR BACKGROUND SCROLL STYLE ────────────────────────────── */
function initNavScroll() {
  const nav = $('#main-nav');
  if (!nav) return;

  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', debounce(update, 200), { passive: true });
  update();
}

/* ── MOBILE MENU TOGGLE ────────────────────────────────────────────────── */
function toggleMobileMenu() {
  const btn  = $('#hamburger-btn');
  const menu = $('#nav-menu');
  if (!btn || !menu) return;

  const isOpen = menu.classList.toggle('mobile-open');
  btn.classList.toggle('open', isOpen);
  btn.setAttribute('aria-expanded', isOpen);
}

function closeMobileMenu() {
  const btn  = $('#hamburger-btn');
  const menu = $('#nav-menu');
  if (!btn || !menu) return;

  menu.classList.remove('mobile-open');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', (e) => {
  const nav = $('#main-nav');
  if (nav && !nav.contains(e.target)) closeMobileMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMobileMenu();
}, { passive: true });

/* ── PHOTO GALLERY / LIGHTBOX SLIDESHOW ────────────────────────────────── */
const lightbox = $('#lightbox');
const lightboxImage = $('#lightbox-image');
const lightboxCounter = $('#lightbox-counter');
let lightboxIndex = 0;
let galleryImages = [];

function initGallery() {
  galleryImages = [];
  const featured = $('.gallery-featured img');
  if (featured) {
    galleryImages.push({ src: featured.getAttribute('src'), alt: featured.getAttribute('alt') || 'Featured' });
  }

  $$('.gallery-item img').forEach(img => {
    galleryImages.push({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || 'Gallery Photo' });
  });

  // Bind click/keyboard events to all gallery items
  const items = $$('.gallery-featured, .gallery-item');
  items.forEach((item, idx) => {
    item.addEventListener('click', () => openLightboxByIndex(idx));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightboxByIndex(idx);
      }
    });
  });

  // Bind lightbox controls
  const closeBtn = $('.lightbox-close');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  const prevBtn = $('.lightbox-prev');
  if (prevBtn) prevBtn.addEventListener('click', lightboxPrev);

  const nextBtn = $('.lightbox-next');
  if (nextBtn) nextBtn.addEventListener('click', lightboxNext);
}

function openLightboxByIndex(index) {
  if (!lightbox || galleryImages.length === 0) return;
  lightboxIndex = index;
  showLightboxImage();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (lightboxImage) lightboxImage.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
  showLightboxImage();
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
  showLightboxImage();
}

function showLightboxImage() {
  const img = galleryImages[lightboxIndex];
  if (!img || !lightboxImage) return;
  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt || '';
  if (lightboxCounter) {
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryImages.length}`;
  }
}

document.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowRight') lightboxNext();
  else if (e.key === 'ArrowLeft') lightboxPrev();
});

if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

/* ── HERO CANVAS PARTICLE ANIMATION ────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.4 + 0.1,
    };
  }

  function initParticles() {
    particles = Array.from({ length: 40 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        particles[i] = createParticle();
        particles[i].y = H + 10;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184, 149, 63, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(() => { resize(); initParticles(); });
  ro.observe(canvas.parentElement || document.body);
  resize();
  initParticles();
  draw();
}

/* ── RSVP FORM VALIDATION & SUBMISSION ─────────────────────────────────── */
function initRSVPForm() {
  const form = $('#rsvp-form');
  if (!form) return;

  form.addEventListener('input', (e) => {
    const input = e.target;
    if (input.validity.valid) {
      input.style.borderColor = '';
    }
  });

  form.addEventListener('submit', handleRSVPSubmit);
}

// Validates the RSVP form inputs and redirects the user to WhatsApp with a 
// pre-filled RSVP confirmation message, then displays a success notification.
function handleRSVPSubmit(e) {
  e.preventDefault();
  const form = $('#rsvp-form');
  if (!form) return;

  const fullname = form.querySelector('input[name="fullname"]')?.value.trim() || '';
  const guestcount = form.querySelector('input[name="guestcount"]')?.value || '1';

  if (!fullname) {
    showFieldError(form.querySelector('input[name="fullname"]'), 'Please enter your full name');
    return;
  }
  if (!guestcount || parseInt(guestcount) < 1 || parseInt(guestcount) > 10) {
    showFieldError(form.querySelector('input[name="guestcount"]'), 'Guests must be between 1 and 10');
    return;
  }

  const message = [
    `Dear Meeta Mathur,`,
    ``,
    `💕 This is Confirmation for 💕`,
    `Wedding of your Daughter Hitanshi with Shashank,`,
    ``,
    `✨ Guest Name: ${fullname}`,
    `👥 Number of Guests: ${guestcount}`,
    `📆 Date of attending: ${form.querySelector('input[name="arrival-date"]')?.value || 'Not specified'}`,
    `✅ Joyfully Accept — I will be there! 🎉`,
    ``,
    `Looking forward to celebrating your special day! 🌸`,
    ``,
    `With love and warm wishes 💒`,
  ].join('\n');

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  
  form.style.display = 'none';
  const successDiv = $('#rsvp-success');
  if (successDiv) successDiv.style.display = 'block';

  triggerConfetti();

  setTimeout(() => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, 600);

  setTimeout(() => {
    form.reset();
    form.style.display = 'flex';
    if (successDiv) successDiv.style.display = 'none';
  }, 4000);
}

function showFieldError(input, message) {
  if (!input) return;
  input.style.borderColor = '#c14d5e';
  input.focus();
  showNotification(message, 3000);
  setTimeout(() => { input.style.borderColor = ''; }, 3000);
}

/* ── SANGEET PERFORMANCE REGISTRATION ──────────────────────────────────── */
// Validates the inputs for the Sangeet registration form and redirects the
// user to WhatsApp with a pre-filled message detailing their performance.
function submitSangeetEntry() {
  const name      = $('#perf-name')?.value.trim() || '';
  const phone     = $('#perf-phone')?.value.trim() || '';
  const groupsize = $('#perf-groupsize')?.value || '';
  const song      = $('#perf-song')?.value.trim() || '';
  const note      = $('#perf-note')?.value.trim() || '';

  const danceSelected = $('#perf-dance')?.checked;

  if (!name) {
    showNotification('Please enter your name.', 3000);
    $('#perf-name') && $('#perf-name').focus();
    return;
  }
  if (!phone) {
    showNotification('Please enter your WhatsApp number.', 3000);
    $('#perf-phone') && $('#perf-phone').focus();
    return;
  }
  if (!danceSelected) {
    showNotification('Please select Dance Performance.', 3000);
    return;
  }

  const groupLabel = {
    'solo': 'Solo (just me)',
    'duo': 'Duo (2 people)',
    'group-small': 'Small Group (3–5)',
    'group-large': 'Large Group (6+)',
  }[groupsize] || groupsize || 'Not specified';

  const message = [
    `Dear Wedding Team,`,
    ``,
    `🎶 Sangeet Performance Registration 🎶`,
    ``,
    `✨ Name: ${name}`,
    `📱 Contact: ${phone}`,
    `🎭 Performance Type: 💃 Dance Performance`,
    `👥 Group Size: ${groupLabel}`,
    `🎵 Song / Act: ${song || 'To be decided'}`,
    `📝 Notes: ${note || 'None'}`,
    ``,
    `I'm excited to perform at Hitanshi & Shashank's Sangeet! 🌟`,
  ].join('\n');

  const whatsappUrl = `https://wa.me/${SANGEET_REGISTRATION_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  showNotification('🎉 Registration sent! The team will confirm your slot soon.', 4000);
  triggerConfetti();

  // Reset form inputs
  setTimeout(() => {
    if ($('#perf-name')) $('#perf-name').value = '';
    if ($('#perf-phone')) $('#perf-phone').value = '';
    if ($('#perf-groupsize')) $('#perf-groupsize').value = '';
    if ($('#perf-song')) $('#perf-song').value = '';
    if ($('#perf-note')) $('#perf-note').value = '';
  }, 1500);
}


function initSangeetParticipation() {
  const perfSubmitBtn = $('#perf-submit-btn');
  if (perfSubmitBtn) {
    perfSubmitBtn.addEventListener('click', submitSangeetEntry);
  }
}

/* ── SANGEET SONG DETAILS SHARING ──────────────────────────────────────── */
function initSangeetForm() {
  const submitBtn = $('#sangeet-submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendSongDetailsToWhatsApp();
    });
  }
  
  const form = $('#sangeet-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendSongDetailsToWhatsApp();
    });
  }
}

function sendSongDetailsToWhatsApp() {
  const name = $('#sangeet-name')?.value.trim() || '';
  const group = $('#sangeet-group')?.value.trim() || '';
  const song = $('#sangeet-song')?.value.trim() || '';
  const danceDetails = $('#sangeet-dance')?.value.trim() || '';

  if (!name || !song) {
    showNotification('Please enter your name and song title', 3000);
    return;
  }

  const message = [
    `🎵 Sangeet Performance Registration`,
    ``,
    `Performer: ${name}${group ? ' (' + group + ')' : ''}`,
    `Song: ${song}`,
    `${danceDetails ? 'Dance Details: ' + danceDetails : ''}`,
    ``,
    `📎 here is my song file attached(must)`,
    ``,
    `For Hitanshi & Shashank's Wedding 💍`,
    `25th November 2026 - Jaipur`,
  ].filter(line => line !== '').join('\n');

  const whatsappUrl = `https://wa.me/${SANGEET_REGISTRATION_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  showNotification('✓ Opening WhatsApp to share your song details!', 3000);
  
  // Clear form after submission
  if ($('#sangeet-form')) {
    $('#sangeet-form').reset();
  }
}


/* ── POST-WEDDING CONTENT NOTIFICATION SIGNUP ──────────────────────────── */
function subscribeContentNotify() {
  const phone = $('#notify-phone')?.value.trim() || '';

  if (!phone) {
    showNotification('Please enter your WhatsApp number.', 3000);
    return;
  }

  const message = [
    `Hi Hitanshi & Shashank! 🎬`,
    ``,
    `Please add me to the list for wedding content notifications.`,
    ``,
    `📱 My WhatsApp: ${phone}`,
    ``,
    `I don't want to miss any photos, videos, or reels from the celebrations! 🌸`,
  ].join('\n');

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  showNotification('✓ You\'re on the list! We\'ll notify you when content goes live.', 4000);
  if ($('#notify-phone')) $('#notify-phone').value = '';
}

/* ── NOTIFICATION COMPONENT ────────────────────────────────────────────── */
function showNotification(message, duration = 3000) {
  const notif = $('#rsvp-success-notification');
  if (!notif) return;

  notif.innerHTML = message;
  notif.style.display = 'block';
  notif.classList.remove('removing');

  clearTimeout(notif._timeout);
  notif._timeout = setTimeout(() => {
    notif.classList.add('removing');
    setTimeout(() => {
      notif.style.display = 'none';
      notif.classList.remove('removing');
    }, 400);
  }, duration);
}



/* ── CONFETTI CELEBRATION ANIMATION ────────────────────────────────────── */
function triggerConfetti() {
  const pieces = ['🪷', '🌸', '🔱', '🌙', '🪔', '✨', '🔔'];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      el.style.cssText = `
        position:fixed;top:-20px;
        left:${Math.random() * 100}%;
        font-size:${14 + Math.random() * 16}px;
        pointer-events:none;z-index:9999;
        animation: confetti-fall ${2 + Math.random() * 2}s ease-in forwards;
        animation-delay:${Math.random() * 0.5}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 40);
  }

  if (!$('#confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
function initMobileMenu() {
  const btn = $('#hamburger-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  const navLinks = $$('#nav-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
}

function initContentNotify() {
  const notifyBtn = $('#content-notify-btn');
  const notifyInput = $('#notify-phone');
  
  if (notifyBtn) {
    notifyBtn.addEventListener('click', subscribeContentNotify);
  }
  if (notifyInput) {
    notifyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') subscribeContentNotify();
    });
  }
}

/* ── CONSOLE BRANDING LOG ──────────────────────────────────────────────── */
console.log('%c💍 Hitanshi & Shashank — Wedding 2026', 'color:#B8953F;font-size:14px;font-style:italic;');