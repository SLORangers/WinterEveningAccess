function doPost(e) {
  // Helper functions to return JSON
  const returnError = (msg) => {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: msg })
    ).setMimeType(ContentService.MimeType.JSON);
  };
  const returnSuccess = (data) => {
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, ...data })
    ).setMimeType(ContentService.MimeType.JSON);
  };

  try {
    // Parse incoming JSON
    const params = JSON.parse(e.postData.contents);
    const name = params.name;
    const email = params.email;
    const permitDate = params.permitDate; // "YYYY-MM-DD"
    const permitType = params.permitType;
    const waiverConfirmed = params.waiverConfirmed;

    // 1) Check waiver
    if (!waiverConfirmed) {
      return returnError("Please confirm you have read the waiver.");
    }

    // 2) Validate date
    const chosenDate = new Date(permitDate);
    if (isNaN(chosenDate.getTime())) {
      return returnError("Invalid date format.");
    }

    // Range constraints (Nov 3, 2024 - Mar 9, 2025)
    const earliest = new Date("2024-11-03");
    const latest = new Date("2025-03-09");
    if (chosenDate < earliest || chosenDate > latest) {
      return returnError("Date out of range (Nov 3, 2024 - Mar 9, 2025).");
    }

    // Must not be in the past; must not be more than 7 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    if (chosenDate < today) {
      return returnError("Cannot select a past date.");
    }
    if (chosenDate > sevenDaysFromNow) {
      return returnError("Date must be within the next 7 days.");
    }

    // 3) Check capacity (max 65 per day)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];

    // Get all rows (2D array)
    const data = sheet.getDataRange().getValues(); 
    // Assuming columns: A=0:Timestamp, B=1:Permit #, C=2:Name, D=3:Email, E=4:Permit Date, F=5:Permit Type, G=6:Waiver
    const DATE_COLUMN_INDEX = 4;

    let countForDate = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = new Date(row[DATE_COLUMN_INDEX]);
      if (
        rowDate.getFullYear() === chosenDate.getFullYear() &&
        rowDate.getMonth() === chosenDate.getMonth() &&
        rowDate.getDate() === chosenDate.getDate()
      ) {
        countForDate++;
      }
    }
    if (countForDate >= 65) {
      return returnError("Date is fully booked (65 permits).");
    }

    // 4) Generate next Permit #
    // We'll find the max number in column B (index=1) and add 1
    let maxPermitNumber = 1000; // or any base offset you like
    for (let i = 1; i < data.length; i++) {
      const rowPermitNumber = parseInt(data[i][1], 10); 
      if (!isNaN(rowPermitNumber) && rowPermitNumber > maxPermitNumber) {
        maxPermitNumber = rowPermitNumber;
      }
    }
    const newPermitNumber = maxPermitNumber + 1;

    // 5) Append row
    const timestamp = new Date();
    sheet.appendRow([
      timestamp.toISOString(),    // col A: Timestamp
      newPermitNumber,           // col B: Permit #
      name,                      // col C: Name
      email,                     // col D: Email
      permitDate,                // col E: Permit Date
      permitType,                // col F: Permit Type
      waiverConfirmed ? "Yes" : "No"
    ]);

    // 6) Return success with data
    return returnSuccess({
      permitNumber: newPermitNumber,
      name,
      email,
      permitDate,
      permitType
    });

  } catch (err) {
    // If something goes wrong, return an error in JSON
    return returnError("Server error: " + err);
  }
}
