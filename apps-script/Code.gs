/**
 * doPost(e): Handles form submission.
 * Returns plain JSON response with CORS headers.
 */
function doPost(e) {
  try {
    Logger.log("Received POST request: " + JSON.stringify(e));
    if (!e.postData) throw new Error("No postData received!");

    const params = JSON.parse(e.postData.contents);
    const name = params.name;
    const email = params.email;
    const permitDate = params.permitDate; // "YYYY-MM-DD"
    const permitType = params.permitType;
    const waiverConfirmed = params.waiverConfirmed;

    // 1) Check waiver
    if (!waiverConfirmed) {
      return createJsonResponse({ success: false, error: "Please confirm the waiver." });
    }

    // 2) Validate date format
    const chosenDate = new Date(permitDate);
    if (isNaN(chosenDate.getTime())) {
      return createJsonResponse({ success: false, error: "Invalid date format." });
    }

    // 3) Range checks (Nov 3, 2024 – Mar 9, 2025; no past, no more than 7 days out)
    const earliest = new Date("2024-11-03");
    const latest = new Date("2025-03-09");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    if (chosenDate < earliest || chosenDate > latest) {
      return createJsonResponse({ success: false, error: "Date out of range (Nov 3, 2024 – Mar 9, 2025)." });
    }
    if (chosenDate < today) {
      return createJsonResponse({ success: false, error: "Cannot select a past date." });
    }
    if (chosenDate > sevenDaysFromNow) {
      return createJsonResponse({ success: false, error: "Date must be within the next 7 days." });
    }

    // 4) Check capacity
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    const DATE_COL = 4; // Column E: Permit Date

    let countForDate = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = new Date(row[DATE_COL]);
      if (
        rowDate.getFullYear() === chosenDate.getFullYear() &&
        rowDate.getMonth() === chosenDate.getMonth() &&
        rowDate.getDate() === chosenDate.getDate()
      ) {
        countForDate++;
      }
    }
    if (countForDate >= 65) {
      return createJsonResponse({ success: false, error: "Date is fully booked (65 permits)." });
    }

    // 5) Generate next permit number
    let maxPermitNumber = 1000;
    for (let i = 1; i < data.length; i++) {
      const rowPermitNumber = parseInt(data[i][1], 10);
      if (!isNaN(rowPermitNumber) && rowPermitNumber > maxPermitNumber) {
        maxPermitNumber = rowPermitNumber;
      }
    }
    const newPermitNumber = maxPermitNumber + 1;

    // 6) Append row to Google Sheets
    const timestamp = new Date().toISOString();
    sheet.appendRow([
      timestamp,
      newPermitNumber,
      name,
      email,
      permitDate,
      permitType,
      waiverConfirmed ? "Yes" : "No"
    ]);

    // 7) Return success response
    return createJsonResponse({
      success: true,
      permitNumber: newPermitNumber,
      name,
      email,
      permitDate,
      permitType
    });

  } catch (err) {
    Logger.log("Error in doPost: " + err);
    return createJsonResponse({ success: false, error: "Server error: " + err });
  }
}

/**
 * doGet(e): Handles GET request to check remaining permits for a specific date.
 */
function doGet(e) {
  try {
    const dateParam = e.parameter.date; // from ?date=YYYY-MM-DD
    if (!dateParam) {
      return createJsonResponse({ success: false, error: "No 'date' query param provided." });
    }

    const chosenDate = new Date(dateParam);
    if (isNaN(chosenDate.getTime())) {
      return createJsonResponse({ success: false, error: "Invalid date format." });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();

    const DATE_COL = 4; // Column E: Permit Date
    let countForDate = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = new Date(row[DATE_COL]);
      if (
        rowDate.getFullYear() === chosenDate.getFullYear() &&
        rowDate.getMonth() === chosenDate.getMonth() &&
        rowDate.getDate() === chosenDate.getDate()
      ) {
        countForDate++;
      }
    }

    const remaining = 65 - countForDate;
    return createJsonResponse({ success: true, remainingPermits: Math.max(remaining, 0) });
  } catch (err) {
    Logger.log("Error in doGet: " + err);
    return createJsonResponse({ success: false, error: "Server error: " + err });
  }
}

/**
 * Creates a JSON response with CORS headers using ContentService.
 */
function createJsonResponse(jsonObj) {
  return ContentService
    .createTextOutput(JSON.stringify(jsonObj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle OPTIONS (CORS preflight) requests.
 */
function doOptions(e) {
  Logger.log("Received OPTIONS request");
  return createJsonResponse({ success: true });
}
