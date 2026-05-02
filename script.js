/* ============================================================
   ZAYN & GIGI - Wedding Invitation Script
   ============================================================ */
'use strict';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const weddingConfig = {
  groomName: 'zayn',
  brideName: 'gigi',
  weddingDate: {
    year: 2026,
    monthIndex: 4, // May (0-based index)
    day: 5,
    hour: 18,
    minute: 0,
    second: 0,
    displayShort: '5/5/2026',
    displayLong: 'Tuesday · May 5, 2026',
    displayWithTime: 'Tuesday · 5/5/2026 · 06:00 PM',
  },
  location: 'Rexoplaza',
  ticketCode: 'INV-2026-LOVE',
  images: {
    rootsGroomYoung: 'https://res.cloudinary.com/durlokstj/image/upload/v1777757363/WhatsApp_Image_2026-05-03_at_12.17.57_AM_obaobf.jpg',
    rootsGroomAdult: 'https://res.cloudinary.com/durlokstj/image/upload/v1777757363/WhatsApp_Image_2026-05-03_at_12.17.57_AMv_ic1ljr.jpg',
    rootsBrideYoung: 'https://res.cloudinary.com/durlokstj/image/upload/v1777757363/WhatsApp_Image_2026-05-03_at_12.17.57_AMs_tlksrh.jpg',
    rootsBrideAdult: 'https://res.cloudinary.com/durlokstj/image/upload/v1777759733/WhatsApp_Image_2026-05-03_at_1.08.24_AM_syurhk.jpg',
  },
};

let guestSource = 'Unknown';
let selectedTheme = null;

(function initThemeAndSplash() {
  applyWeddingConfig();
  createParticles();

  const overlay = $('#theme-overlay');
  const groomBtn = $('#groomBtn');
  const brideBtn = $('#brideBtn');
  const enterBtn = $('#enterBtn');

  gsap.set($$('.splash-line'), { y: 20 });

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('#sl1', { opacity: 1, y: 0, duration: 1.2, delay: 0.6 }, 'start')
    .to('#sl2', { opacity: 1, y: 0, duration: 1.2 }, '-=0.4')
    .to('#sl3', { opacity: 1, y: 0, duration: 1.2 }, '-=0.4')
    .to('.splash-divider', { opacity: 1, width: '80px', duration: 0.8 }, '-=0.2')
    .to('.enter-btn', { opacity: 1, duration: 0.8 });

  function handleThemeSelect(theme) {
    if (selectedTheme) return;

    selectedTheme = theme;
    guestSource = theme === 'groom' ? 'Side: Groom' : 'Side: Bride';

    document.body.classList.remove('groom-theme', 'bride-theme');
    document.body.classList.add(theme === 'groom' ? 'groom-theme' : 'bride-theme');

    const audio = $('#weddingMusic');
    if (audio) {
      audio.play().catch(() => {
        // Browser policies can block autoplay if interaction chain breaks.
      });
    }

    updateTicketSide();

    if (overlay) {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          overlay.style.display = 'none';
        },
      });
    }
  }

  groomBtn?.addEventListener('click', () => handleThemeSelect('groom'));
  brideBtn?.addEventListener('click', () => handleThemeSelect('bride'));
  enterBtn?.addEventListener('click', handleEnter);

  function handleEnter() {
    gsap.timeline()
      .to('#splash', { opacity: 0, duration: 1, ease: 'power2.inOut' })
      .call(() => {
        const splash = $('#splash');
        if (splash) splash.style.display = 'none';

        const main = $('#mainContent');
        if (main) {
          main.style.display = 'block';
          main.classList.remove('main-hidden');
          gsap.from(main, { opacity: 0, duration: 0.5 });
        }

        initScrollAnimations();
        initRoots();
        initRSVP();
        initDigitalTicket();
        spawnPetals();
        updateNavDots();

        ScrollTrigger.refresh();
      });
  }
})();

function toDisplayName(name) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getWeddingDateTarget() {
  return new Date(
    weddingConfig.weddingDate.year,
    weddingConfig.weddingDate.monthIndex,
    weddingConfig.weddingDate.day,
    weddingConfig.weddingDate.hour,
    weddingConfig.weddingDate.minute,
    weddingConfig.weddingDate.second
  ).getTime();
}

function applyWeddingConfig() {
  const groomDisplay = toDisplayName(weddingConfig.groomName);
  const brideDisplay = toDisplayName(weddingConfig.brideName);
  const coupleDisplay = `${groomDisplay} & ${brideDisplay}`;

  document.title = `${coupleDisplay} — ${weddingConfig.weddingDate.displayShort}`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      `${coupleDisplay} — A celebration of love, union, and a new beginning. Join us on ${weddingConfig.weddingDate.displayShort}.`
    );
  }

  const groomHeroName = $('.name-zayn');
  const brideHeroName = $('.name-gigi');
  if (groomHeroName) groomHeroName.textContent = groomDisplay;
  if (brideHeroName) brideHeroName.textContent = brideDisplay;

  const heroDate = $('#heroWeddingDate');
  if (heroDate) heroDate.textContent = weddingConfig.weddingDate.displayLong;

  const footerNames = $('.footer-names');
  if (footerNames) footerNames.textContent = coupleDisplay;

  const footerDate = $('#footerWeddingDate');
  if (footerDate) footerDate.textContent = weddingConfig.weddingDate.displayShort;

  const venueAddress = $('.venue-address');
  if (venueAddress) venueAddress.textContent = weddingConfig.location;

  const ticketCouple = $('#ticketCoupleNames');
  if (ticketCouple) ticketCouple.textContent = coupleDisplay;

  const ticketEventDate = $('#ticketEventDate');
  if (ticketEventDate) ticketEventDate.textContent = weddingConfig.weddingDate.displayWithTime;

  const ticketLocation = $('#ticketLocationText');
  if (ticketLocation) ticketLocation.textContent = weddingConfig.location;

  const rootCards = $$('#roots .root-card');
  const groomCard = rootCards[0];
  const brideCard = rootCards[1];

  if (groomCard) {
    const name = groomCard.querySelector('.root-name');
    const young = groomCard.querySelector('.young-img');
    const adult = groomCard.querySelector('.adult-img');
    if (name) name.textContent = groomDisplay;
    if (young) {
      young.src = weddingConfig.images.rootsGroomYoung;
      young.alt = `Young ${groomDisplay}`;
    }
    if (adult) {
      adult.src = weddingConfig.images.rootsGroomAdult;
      adult.alt = `${groomDisplay} today`;
    }
  }

  if (brideCard) {
    const name = brideCard.querySelector('.root-name');
    const young = brideCard.querySelector('.young-img');
    const adult = brideCard.querySelector('.adult-img');
    if (name) name.textContent = brideDisplay;
    if (young) {
      young.src = weddingConfig.images.rootsBrideYoung;
      young.alt = `Young ${brideDisplay}`;
    }
    if (adult) {
      adult.src = weddingConfig.images.rootsBrideAdult;
      adult.alt = `${brideDisplay} today`;
    }
  }
}

function createParticles() {
  const container = $('#splashParticles');
  if (!container) return;

  for (let i = 0; i < 60; i += 1) {
    const p = document.createElement('div');
    p.className = 'particle';
    Object.assign(p.style, {
      position: 'absolute',
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      borderRadius: '50%',
      background: `rgba(184,147,90,${Math.random() * 0.4 + 0.1})`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    });

    container.appendChild(p);

    gsap.to(p, {
      y: '-=40',
      x: `+=${(Math.random() - 0.5) * 60}`,
      opacity: 0,
      duration: Math.random() * 4 + 3,
      repeat: -1,
      delay: Math.random() * 4,
      ease: 'none',
    });
  }
}

function initScrollAnimations() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('.reveal-item').forEach((el) => {
    const delay = parseFloat(el.dataset.delay || '0');
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: reduceMotion ? 0.2 : 1,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.section-padding').forEach((section) => {
    gsap.fromTo(
      section,
      { opacity: 0.94, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: reduceMotion ? 0.2 : 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  gsap.utils.toArray('.parallax-bg').forEach((bg) => {
    gsap.to(bg, {
      yPercent: reduceMotion ? 0 : 12,
      ease: 'none',
      scrollTrigger: {
        trigger: bg.closest('section') || bg,
        scrub: reduceMotion ? false : 0.7,
      },
    });
  });

  gsap.from('.timeline-line', {
    scaleY: 0,
    transformOrigin: 'top',
    duration: 2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#program',
      start: 'top 70%',
    },
  });
}

function initRoots() {
  const circles = $$('#roots .root-circle');
  if (!circles.length) return;

  // Start with adult visible, then toggle Adult <-> Childhood every 3s.
  let showAdult = true;
  circles.forEach((circle) => circle.classList.add('revealed-adult'));

  setInterval(() => {
    showAdult = !showAdult;
    circles.forEach((circle) => {
      circle.classList.add('photo-fade');
      circle.classList.toggle('revealed-adult', showAdult);
      setTimeout(() => circle.classList.remove('photo-fade'), 420);
    });
  }, 3000);
}

function spawnPetals() {
  const container = $('#petals');
  if (!container) return;

  const shapes = ['*', '+', 'o', '.'];
  for (let i = 0; i < 18; i += 1) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = shapes[i % shapes.length];
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${Math.random() * 10 + 6}px;
      color: rgba(184,147,90,${Math.random() * 0.5 + 0.1});
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}

function initCountdown() {
  const target = getWeddingDateTarget();
  const countdown = $('#countdown');
  let intervalId = null;

  function tick() {
    const diff = target - Date.now();

    if (diff <= 0) {
      if (intervalId) clearInterval(intervalId);
      if (countdown) {
        countdown.innerHTML = '<p class="countdown-finished">The Wedding is Today!</p>';
      }
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, '0');

    const cdDays = $('#cd-days');
    const cdHours = $('#cd-hours');
    const cdMins = $('#cd-mins');
    const cdSecs = $('#cd-secs');

    if (cdDays) cdDays.innerText = pad(d);
    if (cdHours) cdHours.innerText = pad(h);
    if (cdMins) cdMins.innerText = pad(m);
    if (cdSecs) cdSecs.innerText = pad(s);
  }

  tick();
  intervalId = setInterval(tick, 1000);
}

document.addEventListener('DOMContentLoaded', initCountdown);

function initRSVP() {
  const form = $('#rsvpForm');
  if (!form) return;

  const success = $('#rsvpSuccess');
  const nameInput = $('#rsvpName');
  const guestsInput = $('#rsvpGuests');
  const noteInput = $('#rsvpNote');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const guests = Math.max(1, Math.min(6, parseInt(guestsInput.value || '1', 10)));
    const status = form.querySelector('input[name="attendance"]:checked')?.value || 'joyfully_attending';
    const note = noteInput.value.trim();

    if (!name) {
      nameInput.focus();
      success.textContent = 'Please add your name before sending.';
      success.style.color = '#8B2D2D';
      return;
    }

    const submitBtn = $('#rsvpSubmitBtn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.disabled = true;

    const messageText = `New RSVP\nGuest: ${name}\nStatus: ${status === 'joyfully_attending' ? 'Attending' : 'Declining'}\nGuests: ${guests}\nSource: ${guestSource}\nMessage: ${note || 'No message left'}`;

    const token = '8789687204:AAGUWQwHK1n08z4GPG30odQ8cTR16vK6WUw';
    const chatId = '5577896692';
    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(messageText)}`;

    fetch(tgUrl, { method: 'POST' })
      .then((response) => {
        if (response.ok) {
          form.reset();
          guestsInput.value = '1';
          success.textContent =
            status === 'joyfully_attending'
              ? 'RSVP received. We cannot wait to celebrate with you.'
              : 'Your RSVP is received with love. You will be missed dearly.';
          success.style.color = '';
          gsap.fromTo('.rsvp-card', { y: 0 }, { y: -3, duration: 0.14, yoyo: true, repeat: 1 });
        } else {
          success.textContent = 'Oops! There was a problem submitting your RSVP.';
          success.style.color = '#8B2D2D';
        }
      })
      .catch(() => {
        success.textContent = 'Oops! A network error occurred. Please try again.';
        success.style.color = '#8B2D2D';
      })
      .finally(() => {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
      });
  });
}

function updateNavDots() {
  const sections = ['hero', 'roots', 'program', 'dresscode', 'venue', 'rsvp', 'digital-ticket'];
  const dots = $$('.nav-dot');

  function setActive() {
    const mid = window.innerHeight / 2;
    sections.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= mid && rect.bottom >= mid) {
        dots.forEach((d) => d.classList.remove('active'));
        if (dots[i]) dots[i].classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(sections[i])?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function sanitizeFileNamePart(value) {
  return (value || 'Guest')
    .replace(/[<>:"/\\|?*]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 40) || 'Guest';
}

function updateTicketSide() {
  const sideEl = $('#ticketGuestSide');
  if (!sideEl) return;
  sideEl.textContent = selectedTheme === 'groom'
    ? 'Groom Side'
    : selectedTheme === 'bride'
      ? 'Bride Side'
      : 'Select Groom or Bride';
}

function drawTicketToCanvas(guestName) {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 840;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  const isBride = selectedTheme === 'bride';
  const primary = isBride ? '#D81B60' : '#1976D2';
  const secondary = isBride ? '#F06292' : '#64B5F6';
  const bgTop = isBride ? '#FFE7F0' : '#EAF5FF';
  const bgBottom = isBride ? '#FFF7FA' : '#F7FBFF';
  const textDark = '#1A1714';
  const textSoft = '#6B6570';

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, bgTop);
  gradient.addColorStop(1, bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card container
  const cardX = 110;
  const cardY = 90;
  const cardW = canvas.width - 220;
  const cardH = canvas.height - 180;
  const radius = 36;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = primary;
  ctx.lineWidth = 3;
  roundRect(ctx, cardX, cardY, cardW, cardH, radius, true, true);

  // Decorative icons/shapes
  ctx.font = '38px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.fillStyle = `${primary}55`;
  ctx.fillText('♡', cardX + cardW - 88, cardY + 62);
  ctx.fillText('✦', cardX + cardW - 132, cardY + 118);
  ctx.fillText('♡', cardX + 52, cardY + cardH - 34);

  ctx.fillStyle = `${secondary}44`;
  ctx.beginPath();
  ctx.arc(cardX + cardW - 74, cardY + cardH - 64, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px Inter, Arial, sans-serif';
  ctx.fillText('MC', cardX + cardW - 90, cardY + cardH - 58);

  // Header
  ctx.fillStyle = primary;
  ctx.font = '600 24px Inter, Arial, sans-serif';
  ctx.fillText('YOUR DIGITAL TICKET', cardX + 48, cardY + 70);

  ctx.fillStyle = textDark;
  ctx.font = 'italic 68px "Playfair Display", Georgia, serif';
  ctx.fillText(`${toDisplayName(weddingConfig.groomName)} & ${toDisplayName(weddingConfig.brideName)}`, cardX + 46, cardY + 146);

  const sideText = selectedTheme === 'groom'
    ? 'Groom Side'
    : selectedTheme === 'bride'
      ? 'Bride Side'
      : 'Guest Side';

  const rows = [
    { label: 'Guest Name', value: guestName },
    { label: 'Side', value: sideText },
    { label: 'Event Date & Time', value: `${weddingConfig.weddingDate.displayShort} · 06:00 PM` },
    { label: 'Location', value: weddingConfig.location },
  ];

  let rowY = cardY + 210;
  rows.forEach((row, index) => {
    ctx.fillStyle = `${secondary}22`;
    roundRect(ctx, cardX + 40, rowY - 34, cardW - 80, 86, 14, true, false);

    ctx.fillStyle = textSoft;
    ctx.font = '600 20px Inter, Arial, sans-serif';
    ctx.fillText(row.label.toUpperCase(), cardX + 62, rowY);

    ctx.fillStyle = index === 0 ? primary : textDark;
    ctx.font = index === 0
      ? 'italic 44px "Playfair Display", Georgia, serif'
      : '500 32px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(row.value, cardX + 360, rowY + 2);

    rowY += 108;
  });

  ctx.fillStyle = primary;
  ctx.font = '600 18px Inter, Arial, sans-serif';
  ctx.fillText(weddingConfig.ticketCode, cardX + cardW - 206, cardY + cardH - 28);

  return canvas;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function initDigitalTicket() {
  const ticketCard = $('#ticketCard');
  const nameInput = $('#ticketNameInput');
  const nameOutput = $('#ticketGuestName');
  const saveBtn = $('#saveTicketBtn');
  const status = $('#ticketStatus');
  const section = $('#digital-ticket');

  if (!ticketCard || !nameInput || !nameOutput || !saveBtn || !status || !section) return;

  updateTicketSide();

  const syncName = () => {
    const value = nameInput.value.trim();
    nameOutput.textContent = value || 'Your Name Here';
  };

  nameInput.addEventListener('input', syncName);
  syncName();

  gsap.from('.ticket-wrap', {
    opacity: 0,
    y: 34,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });

  saveBtn.addEventListener('click', () => {
    const guestName = nameInput.value.trim();
    if (!guestName) {
      status.textContent = 'Please enter your name first to claim your invitation.';
      status.style.color = '#8B2D2D';
      nameInput.focus();
      return;
    }

    const originalBtnText = saveBtn.textContent;
    saveBtn.textContent = 'Generating Ticket...';
    status.style.color = '';
    status.textContent = 'Preparing your ticket...';
    saveBtn.disabled = true;

    const ticketSource = document.querySelector('#ticketCard');
    if (!ticketSource) {
      console.error('Manual Debug Error: #ticketCard was not found in DOM.');
      status.textContent = 'Could not find ticket element (#ticketCard).';
      status.style.color = '#8B2D2D';
      saveBtn.disabled = false;
      saveBtn.textContent = originalBtnText;
      return;
    }

    // Small defer for smoother UX and to ensure button state paints first.
    setTimeout(() => {
      try {
        const canvas = drawTicketToCanvas(guestName);
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.style.display = 'none';
        link.download = `Wedding_Ticket_${sanitizeFileNamePart(guestName)}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        link.remove();

        status.textContent = 'Your ticket has been downloaded successfully.';
        status.style.color = '';
      } catch (err) {
        console.error('Manual Debug Error:', err);
        status.textContent = 'Could not generate ticket image. Check console for details.';
        status.style.color = '#8B2D2D';
        alert('Check console for error details');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalBtnText;
      }
    }, 120);
  });
}
