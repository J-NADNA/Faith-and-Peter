# Peter & Faith Website - Update Checklist

## 1. Update Google Apps Script
- [ ] Open the wedding Google Sheet.
- [ ] Extensions -> Apps Script.
- [ ] Replace the existing code with `google-apps-script/Code.gs`.
- [ ] Save.
- [ ] Deploy -> Manage deployments.
- [ ] Edit the existing Web App deployment.
- [ ] Version -> New version.
- [ ] Execute as -> Me.
- [ ] Who has access -> Anyone.
- [ ] Deploy.

## 2. Upload the website update
- [ ] Extract this ZIP.
- [ ] Replace the old repository files with the files in this package.
- [ ] Commit and push to GitHub.
- [ ] Let Netlify redeploy from GitHub, or upload the extracted folder manually in Netlify.

## 3. Test on phone and desktop
- [ ] Entrance screen opens.
- [ ] Music plays after tapping “Enter with our song”.
- [ ] Venue reads **Funyula Altar**.
- [ ] Countdown is working.
- [ ] Reception directions open correctly.
- [ ] Add to Calendar downloads the wedding event.
- [ ] Share Invitation works or copies the page link.
- [ ] RSVP Yes reveals guest count.
- [ ] Reminder Yes reveals date, time, method and contact fields.
- [ ] WhatsApp/SMS reminder accepts a Kenyan phone number.
- [ ] Email reminder accepts an email address.
- [ ] Submission reaches the Google Sheet.
- [ ] New Sheet columns record Reminder Method, Reminder Contact and Reminder Time.
- [ ] Thank-you screen shows M-Pesa Till 1610486.
- [ ] Copy Till Number works.
- [ ] Faith and Peter WhatsApp buttons work.
