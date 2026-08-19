(() => {
  const config = window.WEDDING_CONFIG || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const entrance = $('#entrance');
  const audio = $('#weddingAudio');
  const musicControl = $('#musicControl');
  const musicLabel = $('.music-control__label', musicControl);
  const enterWithMusic = $('#enterWithMusic');
  const enterQuietly = $('#enterQuietly');

  document.body.classList.add('is-locked');

  function closeEntrance() {
    entrance.classList.add('is-hidden');
    document.body.classList.remove('is-locked');
  }

  async function startMusic() {
    try {
      audio.volume = 0.42;
      await audio.play();
      musicControl.classList.add('is-playing');
      musicControl.setAttribute('aria-label', 'Pause background music');
      musicControl.title = 'Pause background music';
      musicLabel.textContent = 'Pause song';
    } catch (error) {
      console.info('Audio playback needs another user interaction.', error);
    }
  }

  function pauseMusic() {
    audio.pause();
    musicControl.classList.remove('is-playing');
    musicControl.setAttribute('aria-label', 'Play background music');
    musicControl.title = 'Play background music';
    musicLabel.textContent = 'Play song';
  }

  enterWithMusic.addEventListener('click', async () => {
    closeEntrance();
    await startMusic();
  });

  enterQuietly.addEventListener('click', closeEntrance);

  musicControl.addEventListener('click', () => {
    if (audio.paused) startMusic(); else pauseMusic();
  });

  // Countdown
  const target = new Date(config.weddingDate || '2026-12-05T09:00:00+03:00').getTime();
  const countdownEls = {
    days: $('#days'), hours: $('#hours'), minutes: $('#minutes'), seconds: $('#seconds')
  };

  function updateCountdown() {
    const distance = target - Date.now();
    if (distance <= 0) {
      countdownEls.days.textContent = '0';
      countdownEls.hours.textContent = '0';
      countdownEls.minutes.textContent = '0';
      countdownEls.seconds.textContent = '0';
      return;
    }
    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;
    countdownEls.days.textContent = Math.floor(distance / day);
    countdownEls.hours.textContent = Math.floor((distance % day) / hour);
    countdownEls.minutes.textContent = Math.floor((distance % hour) / minute);
    countdownEls.seconds.textContent = Math.floor((distance % minute) / 1000);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Reveal on scroll
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Form interactions
  const form = $('#pledgeForm');
  const attendanceInputs = $$('input[name="attendance"]', form);
  const reminderInputs = $$('input[name="reminderRequested"]', form);
  const guestCountWrap = $('#guestCountWrap');
  const guestCount = $('#guestCount');
  const reminderDateWrap = $('#reminderDateWrap');
  const reminderDate = $('#reminderDate');
  const pledgeAmount = $('#pledgeAmount');
  const formError = $('#formError');
  const submitButton = $('#submitButton');
  const loadingText = $('.button__loading', submitButton);
  const normalText = $('.button__normal', submitButton);

  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  reminderDate.min = localToday;
  reminderDate.max = '2026-12-04';

  attendanceInputs.forEach((input) => input.addEventListener('change', () => {
    const yes = $('input[name="attendance"]:checked', form)?.value === 'Yes';
    guestCountWrap.hidden = !yes;
    guestCount.required = yes;
    if (!yes) guestCount.value = '';
  }));

  reminderInputs.forEach((input) => input.addEventListener('change', () => {
    const yes = $('input[name="reminderRequested"]:checked', form)?.value === 'Yes';
    reminderDateWrap.hidden = !yes;
    reminderDate.required = yes;
    if (!yes) reminderDate.value = '';
  }));

  $$('.quick-amounts button').forEach((button) => {
    button.addEventListener('click', () => {
      pledgeAmount.value = button.dataset.amount;
      pledgeAmount.focus();
    });
  });

  function formatKSh(value) {
    const amount = Number(value || 0);
    return `KSh ${amount.toLocaleString('en-KE')}`;
  }

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
    formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearError() {
    formError.hidden = true;
    formError.textContent = '';
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    loadingText.hidden = !isSubmitting;
    normalText.hidden = isSubmitting;
  }

  function validateForm() {
    clearError();
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
    const phone = $('#phone').value.replace(/\s+/g, '');
    if (!/^(?:\+?254|0)?[17]\d{8}$/.test(phone)) {
      showError('Please enter a valid Kenyan phone number, for example 0712345678 or +254712345678.');
      return false;
    }
    const attendance = $('input[name="attendance"]:checked', form)?.value;
    if (attendance === 'Yes' && !guestCount.value) {
      showError('Please tell us how many people will attend, including you.');
      return false;
    }
    const reminder = $('input[name="reminderRequested"]:checked', form)?.value;
    if (reminder === 'Yes' && !reminderDate.value) {
      showError('Please choose the date you would like to be reminded.');
      return false;
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
      website: (data.get('website') || '').toString(),
      submittedFrom: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  async function sendToGoogleSheet(payload) {
    const endpoint = config.googleAppsScriptUrl;
    if (!endpoint || endpoint.includes('PASTE_YOUR_')) {
      throw new Error('SETUP_REQUIRED');
    }
    const body = new URLSearchParams(payload);
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      body
    });
  }

  function celebrate() {
    const symbols = ['♥', '♡', '✦'];
    for (let i = 0; i < 18; i += 1) {
      const piece = document.createElement('span');
      piece.textContent = symbols[i % symbols.length];
      piece.style.cssText = `position:fixed;z-index:4000;left:${Math.random()*100}vw;top:105vh;color:${i%2 ? '#a8ff2f' : '#07172f'};font-size:${16+Math.random()*20}px;pointer-events:none;transition:transform 1.6s ease-out,opacity 1.6s ease-out;`;
      document.body.appendChild(piece);
      requestAnimationFrame(() => {
        piece.style.transform = `translate(${(Math.random()-.5)*160}px,-${window.innerHeight*(.55+Math.random()*.4)}px) rotate(${Math.random()*220}deg)`;
        piece.style.opacity = '0';
      });
      setTimeout(() => piece.remove(), 1800);
    }
  }

  function showSuccess(payload) {
    form.hidden = true;
    const panel = $('#successPanel');
    panel.hidden = false;
    $('#successName').textContent = payload.fullName.split(' ')[0] || 'friend';
    $('#successAmount').textContent = formatKSh(payload.pledgeAmount);
    $('#tillNumber').textContent = config.tillNumber || '1610486';

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
      if (error.message === 'SETUP_REQUIRED') {
        showError('The website is ready, but the Google Sheet connection has not been activated yet. Please complete the Google Apps Script setup in README.md before publishing.');
      } else {
        console.error(error);
        showError('We could not send your response right now. Please check your internet connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  });

  $('#copyTill').addEventListener('click', async () => {
    const till = config.tillNumber || '1610486';
    const status = $('#copyStatus');
    try {
      await navigator.clipboard.writeText(till);
      status.textContent = 'Till Number copied.';
    } catch {
      status.textContent = `Till Number: ${till}`;
    }
    setTimeout(() => { status.textContent = ''; }, 2500);
  });
})();
