/**
 * Peter & Faith Wedding Website -> Google Sheets receiver (v2)
 *
 * IMPORTANT FOR AN EXISTING DEPLOYMENT:
 * 1. Open the wedding Google Sheet -> Extensions -> Apps Script.
 * 2. Replace the existing Code.gs with this file and save.
 * 3. Deploy -> Manage deployments.
 * 4. Edit the existing Web App deployment.
 * 5. Set Version to "New version" and deploy.
 * 6. Keep Execute as: Me and Who has access: Anyone.
 *
 * Your existing /exec URL can stay the same when you update the same deployment.
 */

const SHEET_ID = '1g5kNzHEwPvesv8ZfB2w-pT7Wqi15pvs1zDcQ2zDrYfM';
const SHEET_NAME = 'Responses';

// The first 12 columns remain exactly as they were in v1 so existing rows stay aligned.
// New reminder fields are appended at the end for backward compatibility.
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
  'User Agent',
  'Reminder Method',
  'Reminder Contact',
  'Reminder Time'
];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'Peter & Faith wedding form v2' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};

    if (String(p.website || '').trim()) return json_({ ok: true });

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
    const reminderMethod = clean_(p.reminderMethod, 20);
    const reminderContact = clean_(p.reminderContact, 120);
    const reminderTime = clean_(p.reminderTime, 20);

    if (!fullName || !phone || !attendance || pledgeAmount <= 0 || !reminderRequested) {
      return json_({ ok: false, error: 'Missing required fields.' });
    }
    if (attendance === 'Yes' && !guestCount) {
      return json_({ ok: false, error: 'Guest count is required for attending guests.' });
    }
    if (reminderRequested === 'Yes' && (!reminderDate || !reminderMethod || !reminderContact || !reminderTime)) {
      return json_({ ok: false, error: 'Reminder date, method, contact and time are required.' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      let sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
      ensureHeaders_(sheet);

      sheet.appendRow([
        new Date(), fullName, phone, relationship, attendance, guestCount,
        pledgeAmount, reminderRequested, reminderDate, message, submittedFrom,
        userAgent, reminderMethod, reminderContact, reminderTime
      ]);

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

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    return;
  }

  // Preserve existing v1 data. Only add/refresh headers in the new columns.
  const currentLastColumn = Math.max(sheet.getLastColumn(), 1);
  const currentHeaders = sheet.getRange(1, 1, 1, currentLastColumn).getValues()[0];
  for (let i = 0; i < HEADERS.length; i += 1) {
    if (!currentHeaders[i] || i >= 12) sheet.getRange(1, i + 1).setValue(HEADERS[i]);
  }
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
}

function clean_(value, maxLength) {
  const text = String(value == null ? '' : value).trim();
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
