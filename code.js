
/**
 * GOOGLE APPS SCRIPT CODE
 * 1. Open Google Sheets.
 * 2. Extensions -> Apps Script.
 * 3. Replace content with this code.
 * 4. Deploy -> New Deployment -> Web App.
 * 5. Execute as: Me, Who has access: Anyone.
 */

const DATA_SHEET_NAME = 'Data';
const GP_SHEET_NAME = 'GramPanchayat';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getGPs') {
    return getGPs();
  }
  
  if (action === 'getData') {
    const gp = e.parameter.gp;
    return getData(gp);
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

/**
 * Fetches the list of Gram Panchayats from the sheet named "GramPanchayat"
 */
function getGPs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(GP_SHEET_NAME);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ 
      data: [], 
      error: `Sheet named "${GP_SHEET_NAME}" not found.` 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length < 1) {
    return ContentService.createTextOutput(JSON.stringify({ data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const gps = new Set();
  const headers = rows[0];
  const gpColIndex = headers.indexOf('GramPanchayat');
  
  // Use the column with header "GramPanchayat", otherwise default to the first column
  const indexToUse = gpColIndex !== -1 ? gpColIndex : 0;

  for (let i = 1; i < rows.length; i++) {
    const val = rows[i][indexToUse];
    if (val) gps.add(String(val).trim());
  }
  
  return ContentService.createTextOutput(JSON.stringify({ data: Array.from(gps).sort() }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fetches student data from the "Data" sheet
 */
function getData(filterGp) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DATA_SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ data: [], error: 'Data sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const rows = sheet.getDataRange().getValues();
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const currentGp = String(row[1]);
    
    // If filterGp is provided, only include matching rows
    if (filterGp && currentGp !== filterGp) continue;

    data.push({
      rowIndex: i + 1,
      familyId: String(row[0]),
      gramPanchayat: currentGp,
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

/**
 * Updates a student's information in the "Data" sheet
 */
function updateData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DATA_SHEET_NAME);
  const rowIndex = data.rowIndex;

  if (!rowIndex) return ContentService.createTextOutput("Error: No row index").setMimeType(ContentService.MimeType.TEXT);

  sheet.getRange(rowIndex, 11).setValue(data.ineligibleReason);
  sheet.getRange(rowIndex, 12).setValue(data.alreadyEnrolled);
  sheet.getRange(rowIndex, 13).setValue(data.prevSchoolType);
  
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
