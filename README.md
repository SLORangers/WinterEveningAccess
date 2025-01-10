# Hiking Permit Website (GitHub Pages + Google Apps Script + Google Sheets)

## One time Setup: 

install the latest version of node ( https://nodejs.org/en/download/ )
npm install 

# Local Development: 
npm run start

Go to http://localhost:3000

## Deploy Your Own

Deploy your own Vite project with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/vercel/tree/main/examples/vite-react&template=vite-react)

_Live Example: https://vite-react-example.vercel.app_

### Deploying From Your Terminal

You can deploy your new Vite project with a single command from your terminal using [Vercel CLI](https://vercel.com/download):

```shell
$ vercel
```


1. **Set up Google Sheet** with columns:  
   `Timestamp | Permit # | Name | Email | Permit Date | Permit Type | Waiver`
   


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
   async function getAccessToken() {
      try {
         const response = await fetch('https://corsproxy.io/?key=aa313e6b&url=https://developers.google.com/oauthplayground/refreshAccessToken', {
            method: 'POST',
            headers: {
            'Referrer-Policy': 'no-referrer',
               'Access-Control-Allow-Origin': '*',
               'Accept': 'application/json, text/javascript, */*; q=0.01',
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               token_uri: 'https://oauth2.googleapis.com/token',
               refresh_token: '1//047hJy9LrGZP9CgYIARAAGAQSNwF-L9Irfp1IVROFH6ryvQT_-HKxoiGNxdAOaWc34mVKxYepy_soIZY9YCXTumLC3spCuBcJZEU'
            })
         });
         const data = await response.json();
         console.log('Access Token:', data.access_token);
         return data.access_token;
      } catch (error) {
         console.error('Error:', error);
      }
   }
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
   