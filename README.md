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
