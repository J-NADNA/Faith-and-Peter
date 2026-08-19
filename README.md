# Peter & Faith Wedding Website - Modern Editorial Edition

A mobile-first RSVP and pledge website for Peter Ochieng' and Faith, celebrating their wedding on 5 December 2026.

## Design direction

This version goes back to the strengths of the original site, then modernizes the visual system.

- No couple photos are used.
- No decorative icon packs or oversized wedding symbols are used.
- The design is driven by typography, space, luminous green accents, soft motion, abstract shapes and clean editorial cards.
- The original music experience is back as a compact floating play/pause pill.
- The entrance screen lets a guest choose whether to enter with the instrumental or quietly.
- The hero, countdown, story, wedding details, pledge target, RSVP form and confirmation have all been redesigned.
- RSVP and reminder fields stay conversational and reveal only when they are relevant.
- The form includes a four-step progress indicator.
- The confirmation screen still shows the pledge, reminder summary and M-Pesa Till details.
- The ceremony venue is correctly written as **Funyula Altar**.

## Google Sheet connection

The website is already configured with the working Google Apps Script endpoint:

`https://script.google.com/macros/s/AKfycbz33odHr8iMBUeaJ3dqjHmJsnjA3xMrC70W_uMx9LQQPGEz9rW6paHK8x_3b1oOFSTX/exec`

You do not need to paste this URL again.

## Reminder fields

If a guest asks to be reminded, the form collects:

- Reminder date
- Preferred time: Morning, Afternoon or Evening
- Reminder method: WhatsApp, SMS or Email
- The phone number or email address where the reminder should be sent

If your current Apps Script already records these three new reminder columns, you do not need to change it again.

If your sheet only records the older fields, update Apps Script once:

1. Open the wedding Google Sheet.
2. Go to **Extensions -> Apps Script**.
3. Open `google-apps-script/Code.gs` from this package.
4. Replace the existing Apps Script code and save.
5. Choose **Deploy -> Manage deployments**.
6. Edit the existing Web App deployment.
7. Set Version to **New version**.
8. Keep **Execute as: Me** and **Who has access: Anyone**.
9. Click **Deploy**.

Updating the existing deployment keeps the same `/exec` URL.

## Google Sheet columns added for reminders

The included receiver preserves the original response columns and adds:

- Reminder Method
- Reminder Contact
- Reminder Time

Existing rows remain intact.

## Deploy to GitHub and Netlify

Extract this ZIP and upload the extracted files to the GitHub repository. Do not upload the ZIP as the website itself.

Repository root:

- `index.html`
- `netlify.toml`
- `README.md`
- `DEPLOYMENT_CHECKLIST.md`
- `assets/`
- `google-apps-script/`

This is a static site, so Netlify needs no build command. If Netlify is already connected to the GitHub repository, pushing the new files should trigger a new deployment automatically.

## Recommended final test

Submit one test response from a phone with:

- RSVP = Yes
- Guest count = 2
- Pledge = KSh 1,000
- Reminder = Yes
- Reminder method = WhatsApp
- Reminder date = any valid future date before the wedding
- Reminder time = Morning
- Reminder contact = your test phone number

Then confirm that the Google Sheet receives the response and the reminder fields.
