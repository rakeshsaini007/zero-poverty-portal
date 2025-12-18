
/**
 * GOOGLE APPS SCRIPT CODE
 * 1. Open Google Sheets.
 * 2. Extensions -> Apps Script.
 * 3. Replace content with this code.
 * 4. Deploy -> New Deployment -> Web App.
 * 5. Execute as: Me, Who has access: Anyone.
 * 
 * IMPORTANT: Use the URL ending in /exec for the app.
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
  
  return createJsonResponse({ error: 'Invalid Action' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'updateData') {
      return updateData(data);
    }
    return createJsonResponse({ error: 'Invalid Action' });
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Robustly finds a column index by header name (case-insensitive, trimmed)
 */
function findColumnIndex(headers, targetName) {
  const normalizedTarget = targetName.toLowerCase().replace(/\s/g, '');
  for (let i = 0; i < headers.length; i++) {
    const normalizedHeader = String(headers[i]).toLowerCase().replace(/\s/g, '');
    if (normalizedHeader.includes(normalizedTarget)) {
      return i;
    }
  }
  return -1;
}

/**
 * Fetches the list of Gram Panchayats from the sheet named "GramPanchayat"
 */
function getGPs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(GP_SHEET_NAME);
  
  // Fallback to Data sheet if GramPanchayat sheet doesn't exist
  if (!sheet) {
    sheet = ss.getSheetByName(DATA_SHEET_NAME);
  }

  if (!sheet) {
    return createJsonResponse({ data: [], error: 'No sheet found to fetch GPs' });
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) {
    return createJsonResponse({ data: [] });
  }

  const headers = rows[0];
  let gpColIndex = findColumnIndex(headers, 'GramPanchayat');
  
  // If not found, default to first column if it's the specific GP sheet, 
  // or second column if it's the Data sheet
  if (gpColIndex === -1) {
    gpColIndex = sheet.getName() === GP_SHEET_NAME ? 0 : 1;
  }

  const gps = new Set();
  for (let i = 1; i < rows.length; i++) {
    const val = rows[i][gpColIndex];
    if (val && String(val).trim() !== "") {
      gps.add(String(val).trim());
    }
  }
  
  return createJsonResponse({ data: Array.from(gps).sort() });
}

/**
 * Fetches student data from the "Data" sheet
 */
function getData(filterGp) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DATA_SHEET_NAME);
  if (!sheet) {
    return createJsonResponse({ data: [], error: 'Data sheet not found' });
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length < 1) return createJsonResponse({ data: [] });

  const headers = rows[0];
  const familyIdIdx = findColumnIndex(headers, 'FamilyId') !== -1 ? findColumnIndex(headers, 'FamilyId') : 0;
  const gpIdx = findColumnIndex(headers, 'GramPanchayat') !== -1 ? findColumnIndex(headers, 'GramPanchayat') : 1;
  const studentNameIdx = findColumnIndex(headers, 'StudentName') !== -1 ? findColumnIndex(headers, 'StudentName') : 2;
  const fatherNameIdx = findColumnIndex(headers, 'FatherName') !== -1 ? findColumnIndex(headers, 'FatherName') : 3;
  const aadhaarIdx = findColumnIndex(headers, 'Aadhaar') !== -1 ? findColumnIndex(headers, 'Aadhaar') : 4;
  const dobIdx = findColumnIndex(headers, 'DOB') !== -1 ? findColumnIndex(headers, 'DOB') : 5;
  const ageIdx = findColumnIndex(headers, 'Age') !== -1 ? findColumnIndex(headers, 'Age') : 6;
  const mobileIdx = findColumnIndex(headers, 'Mobile') !== -1 ? findColumnIndex(headers, 'Mobile') : 7;
  const genderIdx = findColumnIndex(headers, 'gender') !== -1 ? findColumnIndex(headers, 'gender') : 8;
  const zeroPovertyIdx = findColumnIndex(headers, 'ZEROPUVERTY') !== -1 ? findColumnIndex(headers, 'ZEROPUVERTY') : 9;

  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const currentGp = String(row[gpIdx] || '').trim();
    
    if (filterGp && currentGp !== filterGp) continue;

    data.push({
      rowIndex: i + 1,
      familyId: row[familyIdIdx] ? String(row[familyIdIdx]) : '',
      gramPanchayat: currentGp,
      studentName: row[studentNameIdx] ? String(row[studentNameIdx]) : '',
      fatherName: row[fatherNameIdx] ? String(row[fatherNameIdx]) : '',
      aadhaar: row[aadhaarIdx] ? String(row[aadhaarIdx]) : '',
      dob: row[dobIdx] ? String(row[dobIdx]) : '',
      age: row[ageIdx] || 0,
      mobile: row[mobileIdx] ? String(row[mobileIdx]) : '',
      gender: row[genderIdx] ? String(row[genderIdx]) : '',
      zeroPovertyId: row[zeroPovertyIdx] ? String(row[zeroPovertyIdx]) : '',
      ineligibleReason: String(row[10] || ''),
      alreadyEnrolled: String(row[11] || ''),
      prevSchoolType: String(row[12] || ''),
      prevUdiseCode: String(row[13] || ''),
      newlyEnrolled: String(row[14] || ''),
      newSchoolType: String(row[15] || ''),
      newUdiseCode: String(row[16] || '')
    });
  }

  return createJsonResponse({ data: data });
}

/**
 * Updates a student's information in the "Data" sheet
 */
function updateData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DATA_SHEET_NAME);
  const rowIndex = data.rowIndex;

  if (!rowIndex) return createJsonResponse({ error: "No row index provided" });

  sheet.getRange(rowIndex, 11).setValue(data.ineligibleReason || "");
  sheet.getRange(rowIndex, 12).setValue(data.alreadyEnrolled || "");
  sheet.getRange(rowIndex, 13).setValue(data.prevSchoolType || "");
  
  const prevUdiseCell = sheet.getRange(rowIndex, 14);
  prevUdiseCell.setNumberFormat("@");
  prevUdiseCell.setValue(data.prevUdiseCode || "");

  sheet.getRange(rowIndex, 15).setValue(data.newlyEnrolled || "");
  sheet.getRange(rowIndex, 16).setValue(data.newSchoolType || "");
  
  const newUdiseCell = sheet.getRange(rowIndex, 17);
  newUdiseCell.setNumberFormat("@");
  newUdiseCell.setValue(data.newUdiseCode || "");

  return createJsonResponse({ success: true });
}
