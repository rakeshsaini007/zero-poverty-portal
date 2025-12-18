
/**
 * GOOGLE APPS SCRIPT CODE
 * 1. Open Google Sheets.
 * 2. Extensions -> Apps Script.
 * 3. Replace content with this code.
 * 4. Deploy -> New Deployment -> Web App.
 * 5. Execute as: Me, Who has access: Anyone.
 */

const SHEET_NAME = 'Data';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getData') {
    return getData();
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid Action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  if (action === 'updateData') {
    return updateData(data);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid Action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    data.push({
      rowIndex: i + 1,
      familyId: String(row[0]),
      gramPanchayat: String(row[1]),
      studentName: String(row[2]),
      fatherName: String(row[3]),
      aadhaar: String(row[4]),
      dob: String(row[5]),
      age: row[6],
      mobile: String(row[7]),
      gender: String(row[8]),
      zeroPovertyId: String(row[9]),
      ineligibleReason: String(row[10] || ''),
      alreadyEnrolled: String(row[11] || ''),
      prevSchoolType: String(row[12] || ''),
      prevUdiseCode: String(row[13] || ''),
      newlyEnrolled: String(row[14] || ''),
      newSchoolType: String(row[15] || ''),
      newUdiseCode: String(row[16] || '')
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rowIndex = data.rowIndex;

  if (!rowIndex) return ContentService.createTextOutput("Error: No row index").setMimeType(ContentService.MimeType.TEXT);

  // Column Mapping based on headers provided:
  // K: 11 - सदस्य नामांकन हेतु अपात्र है
  // L: 12 - पूर्व से नामांकित है
  // M: 13 - यदि हाँ तो विद्यालय का प्रकार (Prev)
  // N: 14 - विद्यालय का यूडायस कोड (Prev)
  // O: 15 - नया नामांकन करा गया है
  // P: 16 - यदि हाँ तो विद्यालय का प्रकार (New)
  // Q: 17 - विद्यालय का यूडायस कोड (New)

  sheet.getRange(rowIndex, 11).setValue(data.ineligibleReason);
  sheet.getRange(rowIndex, 12).setValue(data.alreadyEnrolled);
  sheet.getRange(rowIndex, 13).setValue(data.prevSchoolType);
  
  // Format UDISE code as string to preserve leading zero
  const prevUdiseCell = sheet.getRange(rowIndex, 14);
  prevUdiseCell.setNumberFormat("@");
  prevUdiseCell.setValue(data.prevUdiseCode);

  sheet.getRange(rowIndex, 15).setValue(data.newlyEnrolled);
  sheet.getRange(rowIndex, 16).setValue(data.newSchoolType);
  
  const newUdiseCell = sheet.getRange(rowIndex, 17);
  newUdiseCell.setNumberFormat("@");
  newUdiseCell.setValue(data.newUdiseCode);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
