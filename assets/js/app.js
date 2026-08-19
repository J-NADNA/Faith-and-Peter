(() => {
  'use strict';

  const config = window.WEDDING_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const entrance = $('#entrance');
  const audio = $('#weddingAudio');
  const musicControl = $('#musicControl');
  const musicLabel = $('.music-control__label');
  const form = $('#pledgeForm');
  const formError = $('#formError');
  const submitButton = $('#submitButton');
  const normalText = $('.submit-normal', submitButton);
  const loadingText = $('.submit-loading', submitButton);
  const guestCountPanel = $('#guestCountPanel');
  const guestCount = $('#guestCount');
  const reminderPanel = $('#reminderPanel');
  const reminderDate = $('#reminderDate');
  const reminderTime = $('#reminderTime');
  const reminderContact = $('#reminderContact');
  const reminderContactHint = $('#reminderContactHint');

  document.body.classList.add('no-scroll');

  function closeEntrance(playMusic) {
    entrance.classList.add('is-hidden');
    document.body.classList.remove('no-scroll');
    if (playMusic) {
      audio.play().catch(() => {});
    }
  }

  $('#enterWithMusic').addEventListener('click', () => closeEntrance(true));
  $('#enterQuietly').addEventListener('click', () => closeEntrance(false));

  function syncMusicButton() {
    const playing = !audio.paused;
    musicControl.classList.toggle('is-playing', playing);
    musicControl.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    musicControl.title = playing ? 'Pause background music' : 'Play background music';
    musicLabel.textContent = playing ? 'Pause' : 'Play song';
  }

  musicControl.addEventListener('click', async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
    } catch (error) {
      console.warn('Audio playback could not start.', error);
    }
    syncMusicButton();
  });
  audio.addEventListener('play', syncMusicButton);
  audio.addEventListener('pause', syncMusicButton);

  const weddingTime = new Date(config.weddingDate || '2026-12-05T09:00:00+03:00').getTime();
  function updateCountdown() {
    const diff = Math.max(0, weddingTime - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    $('#days').textContent = String(days);
    $('#hours').textContent = String(hours).padStart(2, '0');
    $('#minutes').textContent = String(minutes).padStart(2, '0');
    $('#seconds').textContent = String(seconds).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  $$('.reveal').forEach((element) => observer.observe(element));

  function setAttendanceState() {
    const attendance = $('input[name="attendance"]:checked', form)?.value;
    const attending = attendance === 'Yes';
    guestCountPanel.hidden = !attending;
    guestCount.required = attending;
    if (!attending) guestCount.value = '';
  }
  $$('input[name="attendance"]', form).forEach((radio) => radio.addEventListener('change', setAttendanceState));

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const weddingDateOnly = new Date('2026-12-05T00:00:00+03:00');
  const toInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  reminderDate.min = toInputDate(minDate);
  reminderDate.max = toInputDate(weddingDateOnly);

  function setReminderState() {
    const requested = $('input[name="reminderRequested"]:checked', form)?.value === 'Yes';
    reminderPanel.hidden = !requested;
    reminderDate.required = requested;
    reminderTime.required = requested;
    if (!requested) {
      reminderDate.value = '';
      reminderTime.value = '';
      $$('input[name="reminderMethod"]', form).forEach((radio) => { radio.checked = false; radio.required = false; });
      reminderContact.value = '';
      reminderContact.disabled = true;
      reminderContact.required = false;
      reminderContact.type = 'text';
      reminderContact.placeholder = 'Choose a reminder method above';
    } else {
      const methods = $$('input[name="reminderMethod"]', form);
      if (methods.length) methods[0].required = true;
    }
  }
  $$('input[name="reminderRequested"]', form).forEach((radio) => radio.addEventListener('change', setReminderState));

  function syncReminderContact() {
    const method = $('input[name="reminderMethod"]:checked', form)?.value;
    if (!method) return;
    reminderContact.disabled = false;
    reminderContact.required = true;
    if (method === 'Email') {
      reminderContact.type = 'email';
      reminderContact.inputMode = 'email';
      reminderContact.placeholder = 'e.g. name@example.com';
      reminderContact.value = reminderContact.value.includes('@') ? reminderContact.value : '';
      reminderContactHint.textContent = 'Enter the email address where you would like the reminder sent.';
    } else {
      reminderContact.type = 'tel';
      reminderContact.inputMode = 'tel';
      reminderContact.placeholder = 'e.g. +254 712 345 678';
      if (!reminderContact.value || reminderContact.value.includes('@')) reminderContact.value = $('#phone').value.trim();
      reminderContactHint.textContent = method === 'WhatsApp'
        ? 'Enter the WhatsApp number where you would like the reminder sent.'
        : 'Enter the mobile number where you would like the SMS reminder sent.';
    }
  }
  $$('input[name="reminderMethod"]', form).forEach((radio) => radio.addEventListener('change', syncReminderContact));

  $('#phone').addEventListener('blur', () => {
    const method = $('input[name="reminderMethod"]:checked', form)?.value;
    if ((method === 'WhatsApp' || method === 'SMS') && !reminderContact.value) reminderContact.value = $('#phone').value.trim();
  });

  $$('.quick-amounts button').forEach((button) => {
    button.addEventListener('click', () => {
      $('#pledgeAmount').value = button.dataset.amount;
      $$('.quick-amounts button').forEach((item) => item.classList.toggle('is-active', item === button));
      $('#pledgeAmount').focus();
    });
  });

  function formatKSh(value) {
    const amount = Number(String(value || '').replace(/,/g, '')) || 0;
    return `KSh ${amount.toLocaleString('en-KE')}`;
  }

  async function shareInvitation() {
    const shareData = {
      title: 'Peter & Faith | 5 December 2026',
      text: 'You are invited to celebrate Peter & Faith on 5 December 2026.',
      url: window.location.href
    };
    const status = $('#shareStatus');
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        status.textContent = 'Invitation shared.';
      } else {
        await navigator.clipboard.writeText(window.location.href);
        status.textContent = 'Invitation link copied.';
      }
    } catch (error) {
      if (error?.name !== 'AbortError') status.textContent = 'You can copy the page link from your browser.';
    }
    setTimeout(() => { status.textContent = ''; }, 2500);
  }
  $('#shareInvitation').addEventListener('click', shareInvitation);
  $('#shareDetails').addEventListener('click', shareInvitation);

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
    formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function clearError() { formError.hidden = true; formError.textContent = ''; }
  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    loadingText.hidden = !isSubmitting;
    normalText.hidden = isSubmitting;
  }

  function normalizePhone(value) { return String(value || '').replace(/[\s()-]/g, ''); }
  function isKenyanPhone(value) { return /^(?:\+?254|0)?[17]\d{8}$/.test(normalizePhone(value)); }

  function validateForm() {
    clearError();
    if (!form.checkValidity()) { form.reportValidity(); return false; }
    if (!isKenyanPhone($('#phone').value)) {
      showError('Please enter a valid Kenyan phone number, for example 0712345678 or +254712345678.');
      return false;
    }
    const attendance = $('input[name="attendance"]:checked', form)?.value;
    if (attendance === 'Yes' && !guestCount.value) {
      showError('Please tell us how many people will attend, including you.');
      return false;
    }
    const reminder = $('input[name="reminderRequested"]:checked', form)?.value;
    if (reminder === 'Yes') {
      const method = $('input[name="reminderMethod"]:checked', form)?.value;
      if (!reminderDate.value) { showError('Please choose the date you would like to be reminded.'); return false; }
      if (!reminderTime.value) { showError('Please choose the best time of day for your reminder.'); return false; }
      if (!method) { showError('Please choose WhatsApp, SMS or Email for your reminder.'); return false; }
      if (!reminderContact.value.trim()) { showError('Please enter where we should send the reminder.'); return false; }
      if ((method === 'WhatsApp' || method === 'SMS') && !isKenyanPhone(reminderContact.value)) {
        showError(`Please enter a valid Kenyan phone number for the ${method} reminder.`); return false;
      }
      if (method === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reminderContact.value.trim())) {
        showError('Please enter a valid email address for the reminder.'); return false;
      }
    }
    return true;
  }

  function buildPayload() {
    const data = new FormData(form);
    return {
      fullName: (data.get('fullName') || '').toString().trim(),
      phone: (data.get('phone') || '').toString().trim(),
      relationship: (data.get('relationship') || '').toString(),
      attendance: (data.get('attendance') || '').toString(),
      guestCount: (data.get('guestCount') || '').toString(),
      pledgeAmount: (data.get('pledgeAmount') || '').toString(),
      message: (data.get('message') || '').toString().trim(),
      reminderRequested: (data.get('reminderRequested') || '').toString(),
      reminderDate: (data.get('reminderDate') || '').toString(),
      reminderMethod: (data.get('reminderMethod') || '').toString(),
      reminderContact: (data.get('reminderContact') || '').toString().trim(),
      reminderTime: (data.get('reminderTime') || '').toString(),
      website: (data.get('website') || '').toString(),
      submittedFrom: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  async function sendToGoogleSheet(payload) {
    const endpoint = config.googleAppsScriptUrl;
    if (!endpoint || endpoint.includes('PASTE_YOUR_')) throw new Error('SETUP_REQUIRED');
    const body = new URLSearchParams(payload);
    await fetch(endpoint, { method: 'POST', mode: 'no-cors', body });
  }

  function celebrate() {
    const symbols = ['♥', '✦', '♡', '✧'];
    for (let i = 0; i < 22; i += 1) {
      const piece = document.createElement('span');
      piece.textContent = symbols[i % symbols.length];
      piece.style.cssText = `position:fixed;z-index:4000;left:${Math.random()*100}vw;top:105vh;color:${i%2 ? '#a8ff2f' : '#07172f'};font-size:${16+Math.random()*22}px;pointer-events:none;transition:transform 1.8s cubic-bezier(.2,.8,.2,1),opacity 1.8s ease-out;text-shadow:0 0 12px rgba(168,255,47,.2);`;
      document.body.appendChild(piece);
      requestAnimationFrame(() => {
        piece.style.transform = `translate(${(Math.random()-.5)*180}px,-${window.innerHeight*(.6+Math.random()*.45)}px) rotate(${Math.random()*260}deg)`;
        piece.style.opacity = '0';
      });
      setTimeout(() => piece.remove(), 2000);
    }
  }

  function showSuccess(payload) {
    form.hidden = true;
    const panel = $('#successPanel');
    panel.hidden = false;
    $('#successName').textContent = payload.fullName.split(' ')[0] || 'friend';
    $('#successAmount').textContent = formatKSh(payload.pledgeAmount);
    $('#tillNumber').textContent = config.tillNumber || '1610486';

    const reminderSummary = $('#successReminder');
    if (payload.reminderRequested === 'Yes') {
      reminderSummary.hidden = false;
      $('#successReminderMethod').textContent = payload.reminderMethod;
      const dateText = payload.reminderDate ? new Date(`${payload.reminderDate}T12:00:00`).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      $('#successReminderDate').textContent = `${dateText}${payload.reminderTime ? ` · ${payload.reminderTime}` : ''}`;
    } else reminderSummary.hidden = true;

    const message = $('#successMessage');
    const closing = $('#successClosing');
    if (payload.attendance === 'Yes') {
      message.textContent = 'Your RSVP and pledge have been received. Thank you for choosing to celebrate this beautiful day with us.';
      closing.textContent = 'We can’t wait to celebrate with you on 5 December 2026.';
    } else if (payload.attendance === 'No') {
      message.textContent = 'Your response and pledge have been received. Thank you for celebrating Peter and Faith from wherever you are.';
      closing.textContent = 'Your love and support are deeply appreciated.';
    } else {
      message.textContent = 'Your response and pledge have been received. Thank you for being part of Peter and Faith’s journey.';
      closing.textContent = 'Whenever your plans are clear, we will be glad to hear from you.';
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    celebrate();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const payload = buildPayload();
    if (payload.website) return;
    setSubmitting(true);
    clearError();
    try {
      await sendToGoogleSheet(payload);
      showSuccess(payload);
    } catch (error) {
      if (error.message === 'SETUP_REQUIRED') showError('The Google Sheet connection has not been activated yet. Please check assets/js/config.js.');
      else { console.error(error); showError('We could not send your response right now. Please check your internet connection and try again.'); }
    } finally { setSubmitting(false); }
  });

  $('#copyTill').addEventListener('click', async () => {
    const till = config.tillNumber || '1610486';
    const status = $('#copyStatus');
    try { await navigator.clipboard.writeText(till); status.textContent = 'Till Number copied.'; }
    catch { status.textContent = `Till Number: ${till}`; }
    setTimeout(() => { status.textContent = ''; }, 2500);
  });
})();
