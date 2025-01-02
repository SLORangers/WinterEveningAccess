const { google } = require('googleapis'); // We'll install this library
const dayjs = require('dayjs');           // For simpler date logic

// Load your service account JSON as environment variables or via config
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

// ID of your Google Sheet (from the sheet’s URL)
const SHEET_ID = "YOUR-SHEET-ID";

exports.handler = async (event, context) => {
  // Enable CORS if needed
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({})
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse form data from request
    const { name, email, permitDate, permitType, waiverConfirmed } = JSON.parse(event.body);

    // SERVER-SIDE VALIDATIONS:

    // 1. Check waiver
    if (!waiverConfirmed) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Waiver not confirmed.' }) };
    }

    // 2. Validate date format
    let chosenDate;
    try {
      chosenDate = dayjs(permitDate, 'YYYY-MM-DD', true); // expecting ISO string or do your own format
      if (!chosenDate.isValid()) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid date format.' }) };
      }
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid date format.' }) };
    }

    // 3. Check if date is within [Nov 3, 2024 ... Mar 9, 2025]
    const earliest = dayjs('2024-11-03');
    const latest = dayjs('2025-03-09');
    if (chosenDate.isBefore(earliest) || chosenDate.isAfter(latest)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Date out of permitted range.' }) };
    }

    // 4. Check if date is not in the past and within 7 days from 'today'
    const today = dayjs().startOf('day');
    const maxAllowed = today.add(7, 'day');
    if (chosenDate.isBefore(today) || chosenDate.isAfter(maxAllowed)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Date not within 7-day window.' }) };
    }

    // Access Sheets
    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const sheets = google.sheets({ version: 'v4', auth });

    // 5. Check how many signups for that date already
    const readRange = 'Sheet1!A:F'; // or whatever your sheet name + columns are
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: readRange
    });
    const rows = res.data.values || [];
    
    // rows[0] is your header row, so actual data starts at rows[1] ...
    const dateColumnIndex = 3; // A=0, B=1, C=2, D=3 => if "Permit Date" is in column D
    let signupsForDate = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[dateColumnIndex]) continue;

      const thisDate = dayjs(row[dateColumnIndex], 'YYYY-MM-DD');
      if (thisDate.isValid() && thisDate.isSame(chosenDate, 'day')) {
        signupsForDate++;
      }
    }

    if (signupsForDate >= 65) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Date fully booked.' }) };
    }

    // 6. Insert new row
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const newRow = [
      now,
      name,
      email,
      chosenDate.format('YYYY-MM-DD'),
      permitType,
      waiverConfirmed ? 'Yes' : 'No'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow]
      }
    });

    // Success response
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Permit submitted successfully!' })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

