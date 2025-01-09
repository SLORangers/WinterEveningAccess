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



# How to GET/POST to Google Sheets API v4
Go to https://developers.google.com/oauthplayground where you will acquire a "refresh" authorization tokens. This will allow you to get a new access token that expires in 1hr

On Step 1, choose Google Sheets API v4 and choose https://www.googleapis.com/auth/spreadsheets scope so you have bot read and write permissions.

Click the Authorize APIs button. Allow the authentication and you'll proceed to Step 2.

On Step 2, copy the Refresh Token. This is the token you will use to get a new access token. Keep it safe and do not share it.

*** POST REQUEST TO GET ACCESS TOKEN using the refresh token - do NOT share the refresh token ***
curl 'https://developers.google.com/oauthplayground/refreshAccessToken' \
  -H 'accept: application/json, text/javascript, */*; q=0.01' \
  -H 'content-type: application/json' \
  --data-raw '{"token_uri":"https://oauth2.googleapis.com/token","refresh_token":"YOUR_REFRESH_TOKEN_HERE"}'

## Put the returned access token in the header of the request after Bearer 

*** GET REQUEST (get data from Sheet1 for spreadsheet with ID from A1 to K50000000 ) ***
curl \
  'https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/Sheet1!A1:K5000000' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN_HERE' \
  -H 'Content-Type: application/json' 
  

*** POST REQUEST (post data to sheet for range A2 to G2) ***
curl -X POST \
  'https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values:batchUpdate' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
  "valueInputOption": "USER_ENTERED",
  "data": [
    {
      "range": "A2:G2",
      "values": [
        [
          "B1", "B2", "B3", "B4", "B5", "B6", "B7"
        ],
      ]
    }
  ]
}'



# Next steps for Brazil - 
Edit the index.html file to do the following:
   - add a loading spinner to the form 
   - make a JS fetch request to to the google developers playground to get a new access token 

   ```javascript
   fetch('https://developers.google.com/oauthplayground/refreshAccessToken', {
      method: 'POST',
      headers: {
         'Accept': 'application/json, text/javascript, */*; q=0.01',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         token_uri: 'https://oauth2.googleapis.com/token',
         refresh_token: 'YOUR_REFRESH_TOKEN_HERE'
      })
   })
   .then(response => response.json())
   .then(data => {
      console.log('Access Token:', data.access_token);
   })
   .catch(error => {
      console.error('Error:', error);
   });
   ```

   - make a JS fetch request to the google sheets API to get ALL the data from the sheet

   ```javascript
   fetch('https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/Sheet1!A1:K5000000', {
      method: 'GET',
      headers: {
         'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE',
         'Content-Type': 'application/json'
      }
   })
   .then(response => response.json())
   .then(data => {
      console.log('Sheet Data:', data);
      
   })
   .catch(error => {
      console.error('Error:', error);
   });
   ```

   - parse the data that you get back and figure out how many permits are left for each day

   - display the number of permits left for each day on the form
   - if the user hits submit for a valid date (and they've checked the waver) make a new JS fetch request to the google sheets API posting their data to the sheet

   - after they've submitted the form, display a NEW confirmation page with their permit number so they can't keep submitting the form over and over again
Make sure the confirmation page is working 
   