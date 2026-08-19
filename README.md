# Peter & Faith Wedding Experience

A cinematic, interactive wedding RSVP and pledge website for Peter Ochieng' and Lorin Faith.

## What this version includes

- Cinematic entry screen with optional instrumental music
- Motion video backgrounds and wedding imagery
- Live countdown to 5 December 2026 at 9:00 AM
- Interactive Peter / Faith message switcher
- Ceremony and reception details
- Add-to-calendar file and reception map link
- Wedding support target: KSh 550,000
- Five-step conversational RSVP and pledge journey
- Conditional guest-count question
- Quick pledge amounts plus custom amount
- Personal message field
- Optional reminder date, time, method and contact
- Press-and-hold "seal" interaction before submission
- Google Sheets submission through Google Apps Script
- Personalized confirmation and wedding-pass screen
- M-Pesa Till Number 1610486 with copy button
- Share action, enquiry phone numbers and WhatsApp links
- Responsive mobile layout, reduced-motion support and lightweight confetti

## Google Apps Script

The live endpoint is already configured in `assets/js/config.js`:

`https://script.google.com/macros/s/AKfycbz33odHr8iMBUeaJ3dqjHmJsnjA3xMrC70W_uMx9LQQPGEz9rW6paHK8x_3b1oOFSTX/exec`

If your current Google Sheet is already receiving these fields, you do not need to change the endpoint:

- Full Name
- Phone Number
- Relationship
- Attendance
- Guest Count
- Pledge Amount
- Reminder Requested
- Reminder Date
- Message
- Reminder Method
- Reminder Contact
- Reminder Time

If the three reminder detail columns are not yet appearing, replace the existing Apps Script code with `google-apps-script/Code.gs`, then update the existing Web App deployment to a new version. Keep "Execute as: Me" and "Who has access: Anyone".

## GitHub + Netlify

1. Extract the ZIP.
2. Upload the extracted contents to the root of your GitHub repository.
3. Do not upload the ZIP itself as the website.
4. Commit and push the files.
5. If Netlify is already connected to the repository, the site should redeploy automatically.
6. If creating a new Netlify site, use the repository root as the publish directory. No build command is required.

## Important final test

Before sharing the site publicly, submit one test response on a phone and confirm that the row appears in the `Responses` tab of the Google Sheet, including any reminder fields you selected.
