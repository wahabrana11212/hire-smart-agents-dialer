# Hire Smart Agents Sales Dialer

A browser-based sales workspace for Australian teams, built with Cloudflare Workers, Google Apps Script, Google Sheets and Twilio.

## Features

- Browser calling through Twilio Voice
- Australian phone-number validation
- Call timer, mute, keypad and hang-up controls
- Lead queue and manual dialler
- Call outcomes, notes and follow-up dates
- Outbound SMS and received-message inbox
- Missed-call inbox
- Do Not Call protection
- Admin dashboard, team activity and exact-number duplicate detection
- Optional outgoing webhooks for CRM and calendar integrations
- Separate agent and management access

Duplicate detection compares the complete normalised Australian phone number. Formatting differences such as `02 7908 4316` and `+61 2 7908 4316` are treated as the same number, while partial or similar numbers are not.

## Project structure

```text
src/Code.gs    Google Apps Script backend
src/worker.js  Cloudflare Worker and browser interface
```

## Private configuration

Never put credentials directly in the source code.

Add these values in **Google Apps Script → Project Settings → Script Properties**:

```text
SHEET_ID
TWIML_APP_SID
HSA_BRIDGE_SECRET
TWILIO_ACCOUNT_SID
TWILIO_API_KEY_SID
TWILIO_API_KEY_SECRET
TWILIO_AUTH_TOKEN
TWILIO_CALLER_ID
```

Add these values as **Cloudflare Worker variables/secrets**:

```text
GAS_BACKEND_URL
HSA_BRIDGE_SECRET
TWILIO_AUTH_TOKEN
TWILIO_CALLER_ID
```

`HSA_BRIDGE_SECRET` must be the same strong random value in Google Apps Script and Cloudflare.

## Google Sheet setup

Create a spreadsheet containing these sheets:

- `HSA Team` — columns A–D: Username, Password, Employee Name, Role
- `Leads - To Call` — include at least Business Name, Business Phone Number and Called?

The application creates its SMS, activity and Do Not Call sheets when required. Management roles are `Owner`, `Manager`, `Admin` or `Administrator`; ordinary users should have the `Agent` role.

## Deployment outline

1. Create the Google Sheet and add its ID to Script Properties.
2. Paste `src/Code.gs` into an Apps Script project.
3. Deploy Apps Script as a web app and save its `/exec` URL as `GAS_BACKEND_URL` in Cloudflare.
4. Create a TwiML App and put its SID in Apps Script Properties.
5. Deploy `src/worker.js` as a Cloudflare Worker.
6. Add all private values listed above.
7. Configure Twilio voice and messaging webhooks for the deployed Worker/App Script URLs.

## Security notes

- This repository intentionally contains no production Sheet ID, Twilio SID, API secret, auth token or bridge secret.
- Do not commit employee passwords or exported lead data.
- Rotate any credential immediately if it is ever committed publicly.
- Review Australian privacy, spam and Do Not Call requirements before production outreach.

## Company

[HireSmartAgents](https://www.hiresmartagents.com/) creates personalised AI voice agents for Australian businesses.
