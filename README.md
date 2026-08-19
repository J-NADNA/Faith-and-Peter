# Peter & Faith Wedding Pledge Website

A one-page, mobile-friendly wedding invitation, RSVP and pledge site for **Peter Ochieng' & Lorin Faith (Faith)**.

## What is already included

- Peter & Faith hero section using the supplied photos
- Background instrumental using the supplied song
- Music starts after the guest taps the entrance button, which works more reliably on phones than forced autoplay
- Live countdown to **5 December 2026 at 9:00 AM (East Africa Time)**
- Wedding ceremony details for **Funyula Alter**
- Reception details for **Samia Resort, Nangina, Mayatos-Funyula Rd, Busia**
- Reception directions button
- Peter and Faith's personal messages
- Pledge target: **KSh 550,000**
- RSVP: Yes / No / Not sure
- Guest count appears only when the guest selects Yes
- Relationship to couple field
- Pledge amount with quick amount buttons
- Personal message field
- Reminder Yes / No
- Reminder date appears only when Yes is selected
- Personalized thank-you screen
- M-Pesa Till Number: **1610486**
- Till Name: **Peter Ochieng**
- Copy Till Number button
- Wedding enquiry phone and WhatsApp buttons for Faith and Peter
- Hashtag: **#PeterAndFaith2026**
- Google Apps Script receiver for saving responses to the supplied Google Sheet
- Basic bot honeypot, server-side validation and spreadsheet formula-injection protection
- Netlify configuration with security/cache headers

## IMPORTANT: one setup step is still required before the live form can save to Google Sheets

A static website cannot write directly into a Google Sheet just from the spreadsheet URL. Google requires a small Google Apps Script Web App to receive the form response.

This project already contains the exact Apps Script code. You only need to deploy it once and paste its Web App URL into the website config.

## Connect the form to Google Sheets

The target spreadsheet is:

`https://docs.google.com/spreadsheets/d/1g5kNzHEwPvesv8ZfB2w-pT7Wqi15pvs1zDcQ2zDrYfM/edit?usp=sharing`

### Step 1: Open Apps Script

1. Open the Google Sheet above while signed into the Google account that owns or can edit it.
2. Click **Extensions**.
3. Click **Apps Script**.
4. A new Apps Script tab opens.

### Step 2: Add the supplied backend code

1. In this project, open `google-apps-script/Code.gs`.
2. Copy everything in that file.
3. In Apps Script, open the default `Code.gs` file.
4. Delete the default code.
5. Paste the supplied code.
6. Click **Save**.

You do not need to change the spreadsheet ID because it is already configured.

### Step 3: Deploy as a Web App

1. In Apps Script, click **Deploy**.
2. Choose **New deployment**.
3. Click the gear icon and choose **Web app**.
4. Description: `Peter & Faith wedding form`.
5. **Execute as:** Me.
6. **Who has access:** Anyone.
7. Click **Deploy**.
8. Google may ask you to authorize access to the spreadsheet. Complete that authorization.
9. Copy the **Web app URL**. It should end with `/exec`.

### Step 4: Paste the URL into the website

Open:

`assets/js/config.js`

Replace:

`PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`

with the Web App URL you copied.

Example format only:

`https://script.google.com/macros/s/EXAMPLE_DEPLOYMENT_ID/exec`

Do not change the other settings unless wedding details change.

### Step 5: Test before publishing

1. Open `index.html` in a browser or use a local web server.
2. Enter the site.
3. Fill in a test response.
4. Submit it.
5. Open the Google Sheet.
6. A tab named **Responses** should appear automatically if it did not already exist.
7. Confirm the test row is present.
8. Delete the test row if desired.

## Upload to GitHub

**Do not upload only the ZIP file into the repository expecting GitHub/Netlify to extract it.** Unzip the package first, then upload the project files and folders.

Your repository root should look like this:

```text
index.html
netlify.toml
README.md
assets/
  css/
  js/
  images/
  audio/
google-apps-script/
```

The `google-apps-script` folder can remain in the GitHub repository. It is documentation/backend source code only and does not affect the public form.

## Deploy with Netlify from GitHub

1. Push or upload the unzipped project to a GitHub repository.
2. Sign in to Netlify.
3. Choose **Add new site** / **Import an existing project**.
4. Choose GitHub.
5. Select the repository.
6. No build command is required.
7. Publish directory can remain `.` because `netlify.toml` already specifies it.
8. Deploy.

After deployment, test the following on the actual Netlify URL:

- Music play and pause
- Countdown
- Reception map link
- WhatsApp links
- RSVP Yes reveals guest count
- Reminder Yes reveals reminder date
- Quick pledge amount buttons
- Form submission creates a new Google Sheet row
- Thank-you screen shows the guest's first name and pledge amount
- Copy Till Number button
- Mobile layout

## Editing important details later

Most editable details are in `index.html`.

Technical values are centralized in:

`assets/js/config.js`

That file contains:

- Google Apps Script URL
- Wedding date/time
- Till Number
- Till Name
- Pledge target
- Reception map link

## Privacy and safety notes

- The website publicly displays Faith and Peter's enquiry phone numbers because that was requested.
- Guest responses are not displayed publicly.
- The Apps Script endpoint is intentionally write-only from the website. The Google Sheet itself should remain private and should not be published to the web.
- Do not store passwords, M-Pesa PINs, API keys or personal account credentials in this repository.
- A public form can still receive spam. The included honeypot helps with simple bots, but it is not a full anti-spam service.

## Supplied media

The project uses the four photos and instrumental track supplied in the original ZIP. Images were converted to WebP for faster loading while keeping the originals out of the deploy package.
