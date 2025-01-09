# Hiking Permit Website (GitHub Pages + Google Apps Script + Google Sheets)

This repo contains:

- **index.html**: The main form page (hosted on GitHub Pages)  
- **confirmation.html**: Displays the user’s confirmed permit # after they submit  
- **apps-script/Code.gs**: Sample code for Google Apps Script (paste into your Apps Script editor)

## How It Works

1. **Google Apps Script** (`Code.gs`) is published as a Web App, which processes form submissions:
   - Checks date range (Nov 3, 2024 - Mar 9, 2025)
   - Checks max 7 days from today
   - Rejects if the date is full (65 sign-ups)
   - Generates a unique Permit # and writes to the Google Sheet
   - Returns a JSON response

2. **index.html**:
   - Collects user data
   - Sends a `fetch` POST request to the Apps Script Web App URL
   - On success, redirects to `confirmation.html`

3. **confirmation.html**:
   - Reads the query parameters (Permit #, user info)
   - Displays a confirmation message

## Deployment Steps

1. **Set up Google Sheet** with columns:  
   `Timestamp | Permit # | Name | Email | Permit Date | Permit Type | Waiver`
2. **Add Apps Script** (via Extensions → Apps Script) and copy `Code.gs` content.  
3. **Deploy as a Web App** with "Anyone" access. Copy the `/exec` URL.  
4. **Clone or upload this repo** to GitHub.  
5. **Edit `index.html`** to insert your `/exec` URL in `APPS_SCRIPT_URL`.  
6. **Enable GitHub Pages** in your repo’s settings (Settings → Pages).  
7. Access `index.html` at `[your-username].github.io/[repo-name]/index.html`.

That's it! Users see the form, fill it out, get validated by Apps Script, and receive a Permit # upon success.



helpful for figuring out how to post to a google sheet - need to set up an oath token
https://stackoverflow.com/questions/37315266/google-sheets-api-v4-receives-http-401-responses-for-public-feeds


Go to https://developers.google.com/oauthplayground where you will acquire authorization tokens.
On Step 1, choose Google Sheets API v4 and choose https://www.googleapis.com/auth/spreadsheets scope so you have bot read and write permissions.
Click the Authorize APIs button. Allow the authentication and you'll proceed to Step 2.
On Step 2, click Exchange authorization code for tokens button. After that, proceed to Step 3.

*** GET REQUEST ***
curl \
  'https://sheets.googleapis.com/v4/spreadsheets/1w8pxQQcahr9KSQUTJt50uQskDXb3XTccJkZOFw2p7oo/values/Sheet1!A1:D5000000' \
  -H 'Authorization: Bearer ya29.a0ARW5m77iXk7IBXRYFJilowSpaAZLa8KAKMCThIep7DVqP0MpmRTfErGsVupjn8tGNX1dy198U7iOfe8BXHJcauQAdFMlfBa_bxwqc4xa7M8NbIhnDTXC419DRW7u-w32S1l8_GHWRUo9JQm1ES95HBK3C4TFyHmPf_sPvvwXaCgYKASMSARASFQHGX2MioOhk4OH-RX5zkkyWZNFtkw0175' \
  -H 'Content-Type: application/json' 
  

*** POST REQUEST ***
curl -X POST \
  'https://sheets.googleapis.com/v4/spreadsheets/1w8pxQQcahr9KSQUTJt50uQskDXb3XTccJkZOFw2p7oo/values:batchUpdate' \
  -H 'Authorization: Bearer ya29.a0ARW5m77iXk7IBXRYFJilowSpaAZLa8KAKMCThIep7DVqP0MpmRTfErGsVupjn8tGNX1dy198U7iOfe8BXHJcauQAdFMlfBa_bxwqc4xa7M8NbIhnDTXC419DRW7u-w32S1l8_GHWRUo9JQm1ES95HBK3C4TFyHmPf_sPvvwXaCgYKASMSARASFQHGX2MioOhk4OH-RX5zkkyWZNFtkw0175' \
  -H 'Content-Type: application/json' \
  -d '{
  "valueInputOption": "USER_ENTERED",
  "data": [
    {
      "range": "A1:A3",
      "values": [
        [
          "B1"
        ],
        [
          "B2"
        ],
        [
          "B3"
        ]
      ]
    }
  ]
}'


