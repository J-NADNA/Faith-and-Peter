(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const config = window.WEDDING_CONFIG || {};

  const body = document.body;
  const gate = $('#experienceGate');
  const audio = $('#weddingSong');
  const musicDock = $('#musicDock');
  const musicLabel = $('#musicLabel');
  const heroPlay = $('#heroPlay');
  const topbar = $('#topbar');
  const form = $('#pledgeForm');
  const formError = $('#formError');
  let currentStep = 1;
  let submitting = false;
  let holdTimer = null;
  let holdStart = 0;
  let holdRaf = null;

  body.classList.add('gate-open');

  const setMusicUI = () => {
    const playing = !audio.paused;
    musicDock.classList.toggle('playing', playing);
    musicLabel.textContent = playing ? 'Pause instrumental' : 'Play instrumental';
    musicDock.setAttribute('aria-label', playing ? 'Pause wedding instrumental' : 'Play wedding instrumental');
    if (heroPlay) heroPlay.textContent = playing ? 'Pause our song ♪' : 'Play our song ♪';
  };

  async function playMusic() {
    try {
      audio.volume = 0.55;
      await audio.play();
      setMusicUI();
    } catch (e) {
      console.warn('Music playback needs another tap.', e);
    }
  }

  function enterExperience(withMusic) {
    gate.classList.add('closed');
    body.classList.remove('gate-open');
    topbar.classList.add('visible');
    musicDock.classList.add('visible');
    if (withMusic) playMusic();
    setTimeout(() => gate.setAttribute('aria-hidden', 'true'), 900);
  }

  $('#enterWithMusic')?.addEventListener('click', () => enterExperience(true));
  $('#enterQuietly')?.addEventListener('click', () => enterExperience(false));
  musicDock?.addEventListener('click', () => audio.paused ? playMusic() : audio.pause());
  heroPlay?.addEventListener('click', () => audio.paused ? playMusic() : audio.pause());
  audio?.addEventListener('play', setMusicUI);
  audio?.addEventListener('pause', setMusicUI);

  // Scroll reveals and page progress
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  const pageProgress = $('#pageProgress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0;
    pageProgress.style.width = `${pct}%`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Desktop glow
  const glow = $('#cursorGlow');
  if (matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
      glow.style.opacity = '1';
    }, { passive: true });
    addEventListener('mouseout', () => glow.style.opacity = '0');
  }

  // Play the decorative countdown video only near viewport
  const countdownVideo = $('#countdownVideo');
  if (countdownVideo) {
    const videoObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) countdownVideo.play().catch(() => {});
      else countdownVideo.pause();
    }, { threshold: 0.18 });
    videoObserver.observe(countdownVideo);
  }

  // Countdown
  const weddingDate = new Date(config.weddingDate || '2026-12-05T09:00:00+03:00');
  const pad2 = n => String(n).padStart(2, '0');
  const updateCountdown = () => {
    const diff = Math.max(0, weddingDate.getTime() - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const minutes = Math.floor(diff / 60000) % 60;
    const seconds = Math.floor(diff / 1000) % 60;
    $('#days').textContent = String(days).padStart(3, '0');
    $('#hours').textContent = pad2(hours);
    $('#minutes').textContent = pad2(minutes);
    $('#seconds').textContent = pad2(seconds);
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Quote tabs
  $$('.story-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.story;
      $$('.story-tab').forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      $$('.story-panel').forEach(panel => {
        const active = panel.dataset.panel === key;
        panel.hidden = !active;
        panel.classList.toggle('active', active);
      });
    });
  });

  // Wizard helpers
  const steps = $$('.wizard-step', form);
  const progressSegments = $$('.wizard-progress span');
  const wizardBack = $('#wizardBack');
  const wizardCount = $('#wizardCount');
  const miniLine = $('#miniLine');
  const miniText = $('#miniText');

  function showStep(step) {
    currentStep = Math.min(5, Math.max(1, step));
    steps.forEach(el => {
      const active = Number(el.dataset.step) === currentStep;
      el.hidden = !active;
      el.classList.toggle('active', active);
    });
    progressSegments.forEach((el, i) => el.classList.toggle('active', i < currentStep));
    wizardCount.textContent = `${String(currentStep).padStart(2, '0')} / 05`;
    wizardBack.hidden = currentStep === 1 || submitting;
    miniLine.style.width = `${currentStep * 20}%`;
    miniText.textContent = `Step ${currentStep} of 5`;
    formError.hidden = true;
    const cardTop = $('.response-card').getBoundingClientRect().top + scrollY - 100;
    if (scrollY > cardTop + 250) scrollTo({ top: cardTop, behavior: 'smooth' });
    const focusTarget = $('.wizard-step:not([hidden]) input:not([type=radio]):not([type=hidden]), .wizard-step:not([hidden]) button:not(.next-step)', form);
    setTimeout(() => focusTarget?.focus({ preventScroll: true }), 260);
  }

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  function normalizePhone(v) { return v.replace(/[\s()-]/g, ''); }
  function validPhone(v) {
    const p = normalizePhone(v);
    return /^(?:\+254|254|0)(?:1|7)\d{8}$/.test(p);
  }

  function validateStep(step) {
    formError.hidden = true;
    if (step === 1) {
      const name = $('#fullName').value.trim();
      const phone = $('#phone').value.trim();
      if (name.length < 2) { showError('Please enter your name so Peter and Faith know who this is from.'); $('#fullName').focus(); return false; }
      if (!validPhone(phone)) { showError('Please enter a valid Kenyan phone number, for example +254 712 345 678.'); $('#phone').focus(); return false; }
      $('#attendanceGreeting').textContent = `${name.split(/\s+/)[0]}, will you be celebrating with us?`;
    }
    if (step === 2) {
      const attendance = $('input[name="attendance"]:checked', form)?.value;
      if (!attendance) { showError('Please tell us whether you expect to attend.'); return false; }
      if (attendance === 'Yes' && !$('input[name="guestCount"]:checked', form)) { showError('Please choose how many people will attend with you.'); return false; }
    }
    if (step === 3) {
      const amount = Number($('#pledgeAmount').value || 0);
      if (!Number.isFinite(amount) || amount <= 0) { showError('Please enter the amount you would like to pledge.'); $('#pledgeAmount').focus(); return false; }
    }
    if (step === 4) {
      const requested = $('input[name="reminderRequested"]:checked', form)?.value;
      if (!requested) { showError('Please tell us whether you would like a pledge reminder.'); return false; }
      if (requested === 'Yes') {
        const date = $('#reminderDate').value;
        const time = $('#reminderTime').value;
        const method = $('input[name="reminderMethod"]:checked', form)?.value;
        const contact = $('#reminderContact').value.trim();
        if (!date) { showError('Please choose the date you would like to be reminded.'); return false; }
        if (!time) { showError('Please choose the best time of day for your reminder.'); return false; }
        if (!method) { showError('Please choose WhatsApp, SMS or Email for your reminder.'); return false; }
        if (!contact) { showError('Please enter where we should send the reminder.'); return false; }
        if ((method === 'WhatsApp' || method === 'SMS') && !validPhone(contact)) { showError(`Please enter a valid Kenyan phone number for the ${method} reminder.`); return false; }
        if (method === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) { showError('Please enter a valid email address for the reminder.'); return false; }
      }
    }
    return true;
  }

  $$('.next-step', form).forEach(btn => btn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 4) buildReview();
    showStep(currentStep + 1);
  }));
  wizardBack.addEventListener('click', () => showStep(currentStep - 1));

  // Attendance dependent field
  const guestPanel = $('#guestPanel');
  $$('input[name="attendance"]', form).forEach(radio => radio.addEventListener('change', () => {
    const yes = $('input[name="attendance"]:checked', form)?.value === 'Yes';
    guestPanel.hidden = !yes;
    if (!yes) $$('input[name="guestCount"]', form).forEach(i => i.checked = false);
  }));

  // Amount shortcuts
  $$('.amount-picks button', form).forEach(button => {
    button.addEventListener('click', () => {
      $$('.amount-picks button', form).forEach(b => b.classList.toggle('selected', b === button));
      $('#pledgeAmount').value = button.dataset.amount;
      $('#pledgeAmount').dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  $('#pledgeAmount').addEventListener('input', () => {
    const value = $('#pledgeAmount').value;
    $$('.amount-picks button', form).forEach(b => b.classList.toggle('selected', b.dataset.amount === value));
  });

  // Reminder fields
  const reminderPanel = $('#reminderPanel');
  const reminderDate = $('#reminderDate');
  const reminderTime = $('#reminderTime');
  const reminderContact = $('#reminderContact');
  const reminderLabel = $('#reminderContactLabel');
  const reminderHint = $('#reminderContactHint');
  const today = new Date();
  today.setHours(0,0,0,0);
  const minDate = new Date(today); minDate.setDate(minDate.getDate() + 1);
  const fmtInput = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  reminderDate.min = fmtInput(minDate);
  reminderDate.max = fmtInput(weddingDate);

  function setReminderState() {
    const yes = $('input[name="reminderRequested"]:checked', form)?.value === 'Yes';
    reminderPanel.hidden = !yes;
    reminderDate.required = yes;
    reminderTime.required = yes;
    $$('input[name="reminderMethod"]', form).forEach(r => r.required = yes);
    reminderContact.required = yes;
    if (!yes) {
      reminderDate.value = '';
      reminderTime.value = '';
      $$('input[name="reminderMethod"]', form).forEach(r => r.checked = false);
      reminderContact.value = '';
      reminderContact.disabled = true;
    }
  }
  $$('input[name="reminderRequested"]', form).forEach(r => r.addEventListener('change', setReminderState));

  function setReminderContact() {
    const method = $('input[name="reminderMethod"]:checked', form)?.value;
    if (!method) return;
    reminderContact.disabled = false;
    if (method === 'Email') {
      reminderContact.type = 'email';
      reminderContact.inputMode = 'email';
      reminderLabel.textContent = 'Email address';
      reminderContact.placeholder = 'e.g. name@example.com';
      if (!reminderContact.value.includes('@')) reminderContact.value = '';
      reminderHint.textContent = 'We will use this email only for your requested pledge reminder.';
    } else {
      reminderContact.type = 'tel';
      reminderContact.inputMode = 'tel';
      reminderLabel.textContent = method === 'WhatsApp' ? 'WhatsApp number' : 'Mobile number';
      reminderContact.placeholder = 'e.g. +254 712 345 678';
      if (!reminderContact.value || reminderContact.value.includes('@')) reminderContact.value = $('#phone').value.trim();
      reminderHint.textContent = `We will use this number only for your requested ${method} reminder.`;
    }
  }
  $$('input[name="reminderMethod"]', form).forEach(r => r.addEventListener('change', setReminderContact));

  const formatKSh = value => `KSh ${Number(value || 0).toLocaleString('en-KE')}`;
  const escapeHtml = (s) => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function collectPayload() {
    const data = new FormData(form);
    return {
      fullName: String(data.get('fullName') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      relationship: String(data.get('relationship') || '').trim(),
      attendance: String(data.get('attendance') || '').trim(),
      guestCount: String(data.get('guestCount') || '').trim(),
      pledgeAmount: String(data.get('pledgeAmount') || '').trim(),
      message: String(data.get('message') || '').trim(),
      reminderRequested: String(data.get('reminderRequested') || '').trim(),
      reminderDate: String(data.get('reminderDate') || '').trim(),
      reminderMethod: String(data.get('reminderMethod') || '').trim(),
      reminderContact: String(data.get('reminderContact') || '').trim(),
      reminderTime: String(data.get('reminderTime') || '').trim(),
      website: String(data.get('website') || '').trim(),
      submittedFrom: location.href,
      userAgent: navigator.userAgent
    };
  }

  function buildReview() {
    const p = collectPayload();
    const attendance = p.attendance === 'Yes' ? `Attending${p.guestCount ? ` · ${p.guestCount} ${p.guestCount === '1' ? 'guest' : 'guests'}` : ''}` : p.attendance;
    let reminder = 'No reminder requested';
    if (p.reminderRequested === 'Yes') {
      const d = new Date(`${p.reminderDate}T12:00:00`);
      const dateText = Number.isNaN(d.getTime()) ? p.reminderDate : d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'});
      reminder = `${p.reminderMethod} · ${dateText} · ${p.reminderTime}`;
    }
    $('#reviewCard').innerHTML = `
      <div class="review-row"><span>Name</span><strong>${escapeHtml(p.fullName)}</strong></div>
      <div class="review-row"><span>RSVP</span><strong>${escapeHtml(attendance)}</strong></div>
      <div class="review-row"><span>Pledge</span><strong>${escapeHtml(formatKSh(p.pledgeAmount))}</strong></div>
      <div class="review-row"><span>Reminder</span><strong>${escapeHtml(reminder)}</strong></div>
      ${p.message ? `<div class="review-row"><span>Your message</span><strong>${escapeHtml(p.message)}</strong></div>` : ''}
    `;
  }

  async function submitForm() {
    if (submitting) return;
    submitting = true;
    wizardBack.hidden = true;
    const holdButton = $('#holdSubmit');
    holdButton.disabled = true;
    $('#holdStatus').textContent = 'Sending your response...';
    formError.hidden = true;
    const payload = collectPayload();
    const bodyData = new URLSearchParams(payload);
    try {
      if (!config.googleAppsScriptUrl) throw new Error('Google Apps Script URL is missing.');
      await fetch(config.googleAppsScriptUrl, { method:'POST', mode:'no-cors', body: bodyData });
      showSuccess(payload);
    } catch (err) {
      console.error(err);
      showError('We could not send your response just now. Please check your connection and try again.');
      $('#holdStatus').textContent = 'Not sealed yet';
      holdButton.disabled = false;
      submitting = false;
    }
  }

  // Hold-to-seal interaction
  const holdButton = $('#holdSubmit');
  const holdFill = $('#holdFill');
  const holdStatus = $('#holdStatus');
  const HOLD_MS = 1350;

  function cancelHold() {
    if (submitting) return;
    clearTimeout(holdTimer);
    cancelAnimationFrame(holdRaf);
    holdStart = 0;
    holdFill.style.width = '0%';
    holdButton.classList.remove('sealing');
    holdStatus.textContent = 'Not sealed yet';
  }
  function animateHold(now) {
    if (!holdStart) return;
    const pct = Math.min(100, (now - holdStart) / HOLD_MS * 100);
    holdFill.style.width = `${pct}%`;
    holdStatus.textContent = pct > 72 ? 'Almost there...' : 'Keep holding...';
    if (pct < 100) holdRaf = requestAnimationFrame(animateHold);
  }
  function beginHold(e) {
    if (submitting) return;
    if (e.type === 'keydown' && !['Enter',' '].includes(e.key)) return;
    e.preventDefault();
    holdButton.classList.add('sealing');
    holdStart = performance.now();
    holdRaf = requestAnimationFrame(animateHold);
    holdTimer = setTimeout(() => {
      holdFill.style.width = '100%';
      holdStatus.textContent = 'Sealed with love.';
      navigator.vibrate?.([35,30,70]);
      submitForm();
    }, HOLD_MS);
  }
  holdButton.addEventListener('pointerdown', beginHold);
  holdButton.addEventListener('pointerup', cancelHold);
  holdButton.addEventListener('pointerleave', cancelHold);
  holdButton.addEventListener('pointercancel', cancelHold);
  holdButton.addEventListener('keydown', beginHold);
  holdButton.addEventListener('keyup', cancelHold);

  function showSuccess(payload) {
    const firstName = payload.fullName.split(/\s+/)[0] || 'friend';
    $('#successName').textContent = firstName;
    $('#successAmount').textContent = formatKSh(payload.pledgeAmount);
    $('#successAttendance').textContent = payload.attendance === 'Yes' ? `Yes${payload.guestCount ? ` · ${payload.guestCount}` : ''}` : payload.attendance;
    const msg = $('#successMessage');
    if (payload.attendance === 'Yes') msg.textContent = 'Your RSVP and pledge are in. We cannot wait to celebrate this beautiful day with you.';
    else if (payload.attendance === 'No') msg.textContent = 'Your response and pledge are in. Thank you for celebrating Peter and Faith from wherever you are.';
    else msg.textContent = 'Your response and pledge are in. Thank you for being part of Peter and Faith’s journey.';
    const rem = $('#successReminder');
    if (payload.reminderRequested === 'Yes') {
      rem.hidden = false;
      $('#successReminderMethod').textContent = payload.reminderMethod;
      const d = new Date(`${payload.reminderDate}T12:00:00`);
      const dateText = Number.isNaN(d.getTime()) ? payload.reminderDate : d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'});
      $('#successReminderDate').textContent = `${dateText} · ${payload.reminderTime}`;
    } else rem.hidden = true;
    const scene = $('#successScene');
    scene.hidden = false;
    scene.scrollIntoView({ behavior:'smooth', block:'start' });
    setTimeout(() => launchConfetti(), 550);
    submitting = false;
  }

  $('#copyTill').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(String(config.tillNumber || '1610486'));
      const btn = $('#copyTill');
      const old = btn.textContent;
      btn.textContent = 'Copied ✓';
      navigator.vibrate?.(35);
      setTimeout(() => btn.textContent = old, 1800);
    } catch {
      prompt('Copy the M-Pesa Till Number:', String(config.tillNumber || '1610486'));
    }
  });

  $('#shareResponse').addEventListener('click', async () => {
    const shareData = {
      title: 'Peter & Faith · 5 December 2026',
      text: 'Celebrate Peter & Faith on 5 December 2026. #PeterAndFaith2026',
      url: location.origin + location.pathname
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(shareData.url);
    } catch (e) { if (e?.name !== 'AbortError') console.warn(e); }
  });

  // Lightweight confetti without an external library
  function launchConfetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = $('#confettiCanvas');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = Math.max(innerHeight, $('#successScene').offsetHeight) * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    const colors = ['#b8ff35','#ffffff','#d7ff82','#5fa3ff'];
    const pieces = Array.from({length:90}, () => ({
      x: innerWidth * (.15 + Math.random()*.7), y: -20-Math.random()*120,
      vx:(Math.random()-.5)*3, vy:2.5+Math.random()*4,
      r:2+Math.random()*4, rot:Math.random()*6.28, vr:(Math.random()-.5)*.15,
      c:colors[Math.floor(Math.random()*colors.length)]
    }));
    let frames = 0;
    function draw() {
      ctx.clearRect(0,0,innerWidth,canvas.height/dpr);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += .018;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c;
        ctx.fillRect(-p.r,-p.r*.45,p.r*2,p.r*.9); ctx.restore();
      });
      frames++;
      if (frames < 300) requestAnimationFrame(draw); else ctx.clearRect(0,0,innerWidth,canvas.height/dpr);
    }
    draw();
  }

  // Initialize
  showStep(1);
  setReminderState();
  setMusicUI();
})();
