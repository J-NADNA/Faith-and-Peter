# Peter & Faith Wedding Website - Vibrant Icon Edition

A mobile-friendly wedding RSVP and pledge website for Peter Ochieng' & Faith, 5 December 2026.

## What changed in this version

- Removed all couple photos from the website.
- Replaced photo-led sections with custom icon-led cards, linked-ring motifs, bright gradients and luminous green accents.
- Corrected the ceremony venue everywhere to **Funyula Altar**.
- Added the working Google Apps Script endpoint to `assets/js/config.js`.
- Expanded pledge reminders so guests can choose **WhatsApp, SMS or Email**.
- Guests who request a reminder also choose a reminder date, preferred time of day and the phone/email address where it should be sent.
- Added Share Invitation, Add to Calendar, Copy Till Number and richer success-screen interactions.
- Background instrumental remains available and starts only after a guest chooses to enter with music.

## Important: update Google Apps Script before using the new reminder fields

Your website is already connected to Google Sheets. However, the new reminder fields need the updated Apps Script receiver.

1. Open the wedding Google Sheet.
2. Go to **Extensions -> Apps Script**.
3. Open `google-apps-script/Code.gs` from this project.
4. Replace the existing Apps Script code with the new code and save.
5. In Apps Script, choose **Deploy -> Manage deployments**.
6. Click the edit/pencil icon on your existing Web App deployment.
7. Under Version, choose **New version**.
8. Confirm **Execute as: Me** and **Who has access: Anyone**.
9. Click **Deploy**.

If you update the existing deployment, the `/exec` URL normally stays the same. The website already contains:

`https://script.google.com/macros/s/AKfycbz33odHr8iMBUeaJ3dqjHmJsnjA3xMrC70W_uMx9LQQPGEz9rW6paHK8x_3b1oOFSTX/exec`

## New Google Sheet columns

The script keeps the original 12 columns unchanged and adds these at the end:

- Reminder Method
- Reminder Contact
- Reminder Time

This means existing responses remain aligned and readable.

## GitHub + Netlify deployment

Upload the extracted project files to your GitHub repository, not the ZIP itself. The repository root should contain:

- `index.html`
- `netlify.toml`
- `README.md`
- `DEPLOYMENT_CHECKLIST.md`
- `assets/`
- `google-apps-script/`

Netlify requires no build command because this is a static HTML/CSS/JavaScript site.

## Final test

After deploying the new Apps Script version and website version, submit one test response with:

- RSVP = Yes
- Reminder = Yes
- Reminder Method = WhatsApp
- Reminder Date = a future date
- Reminder Contact = your test number
- Reminder Time = Morning

Then confirm that the Google Sheet row contains values in the new reminder columns.
