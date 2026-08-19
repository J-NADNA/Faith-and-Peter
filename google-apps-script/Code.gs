/**
 * Peter & Faith Wedding Website -> Google Sheets receiver
 *
 * SETUP:
 * 1. Open the wedding Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Replace the editor content with this file.
 * 4. Save.
 * 5. Deploy -> New deployment -> Web app.
 * 6. Execute as: Me.
 * 7. Who has access: Anyone.
 * 8. Deploy and copy the Web App URL ending in /exec.
 * 9. Paste that URL into assets/js/config.js.
 */

const SHEET_ID = '1g5kNzHEwPvesv8ZfB2w-pT7Wqi15pvs1zDcQ2zDrYfM';
const SHEET_NAME = 'Responses';

const HEADERS = [
  'Timestamp',
  'Full Name',
  'Phone Number',
  'Relationship',
  'Attendance',
  'Guest Count',
  'Pledge Amount (KSh)',
  'Reminder Requested',
  'Reminder Date',
  'Message to Couple',
  'Submitted From',
  'User Agent'
];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'Peter & Faith wedding form' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};

    // Honeypot: real guests never fill this field.
    if (String(p.website || '').trim()) {
      return json_({ ok: true });
    }

    const fullName = clean_(p.fullName, 120);
    const phone = clean_(p.phone, 40);
    const relationship = clean_(p.relationship, 60);
    const attendance = clean_(p.attendance, 20);
    const guestCount = clean_(p.guestCount, 10);
    const pledgeAmount = toNumber_(p.pledgeAmount);
    const reminderRequested = clean_(p.reminderRequested, 10);
    const reminderDate = clean_(p.reminderDate, 20);
    const message = clean_(p.message, 500);
    const submittedFrom = clean_(p.submittedFrom, 300);
    const userAgent = clean_(p.userAgent, 500);

    if (!fullName || !phone || !attendance || pledgeAmount <= 0 || !reminderRequested) {
      return json_({ ok: false, error: 'Missing required fields.' });
    }

    if (attendance === 'Yes' && !guestCount) {
      return json_({ ok: false, error: 'Guest count is required for attending guests.' });
    }

    if (reminderRequested === 'Yes' && !reminderDate) {
      return json_({ ok: false, error: 'Reminder date is required.' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      let sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(SHEET_NAME);
      }

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADERS);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      }

      sheet.appendRow([
        new Date(),
        fullName,
        phone,
        relationship,
        attendance,
        guestCount,
        pledgeAmount,
        reminderRequested,
        reminderDate,
        message,
        submittedFrom,
        userAgent
      ]);

      // Helpful number/date formatting.
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 1).setNumberFormat('dd mmm yyyy, hh:mm');
      sheet.getRange(lastRow, 7).setNumberFormat('#,##0');
      sheet.autoResizeColumns(1, HEADERS.length);
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function clean_(value, maxLength) {
  const text = String(value == null ? '' : value).trim();
  // Prevent values beginning with spreadsheet formula characters from executing as formulas.
  const safe = /^[=+\-@]/.test(text) ? "'" + text : text;
  return safe.slice(0, maxLength);
}

function toNumber_(value) {
  const n = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function json_(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
