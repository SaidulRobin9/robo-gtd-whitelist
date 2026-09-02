# Robo GTD — Whitelist Registration Deployment Package

The header now reads **ROBO WHITELIST REGISTRATION IS NOW OPEN!**. Registration submissions can be stored in Supabase in real time through the included browser bridge. The schema has been applied to the connected `therobowtf` Supabase project. A fourth required task now asks visitors to like and retweet the latest Robo post.

Each browser receives a persistent device ID and a unique referral code. The form shows a shareable referral link and quote-tweet text, requires confirmation that the visitor created the quote tweet, and blocks repeat submissions from the same browser. Browser storage can be cleared or bypassed, so the database's unique device constraint is the authoritative duplicate check.

## Supabase setup

1. The connected `therobowtf` project is already configured. If you deploy this package against a different Supabase project, open its SQL editor and run `supabase-schema.sql`. This creates the `whitelist_registrations` table, enables row-level security, and adds the table to the realtime publication.
2. In Netlify, add these environment variables to the site:
   - `SUPABASE_URL` — your project URL, such as `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY` — your project's public anon key
3. Redeploy the site. `build-config.mjs` writes those values into `supabase-config.js` during the Netlify build.

The anon key is intended for browser use; the SQL policy only allows public inserts and does not expose registrations for public reads. Keep service-role keys out of the browser and out of this package.

For a non-Netlify static host, replace the empty values in `supabase-config.js` with the same project URL and public anon key. When Supabase is configured, the existing Google Apps Script webhook is not called; if it is left unconfigured, the original Google Apps Script behavior remains available.

## What Was Fixed
1. **Username & Wallet Address Collection**:
   - Added styled input fields for **X (Twitter) Username / Handle** and **Wallet Address** to the Tasks submission form.
   - Added validation to ensure the user completes all tasks and fills in their username and wallet address before submitting.
   - Updated the submission payload sent to Google Apps Script to include `username`, `walletAddress`, `address`, and `tasksCompleted`.

2. **Google Apps Script Template**:
   - Included `google-apps-script-code.js` ready to copy-paste into your Google Sheet's Apps Script editor.

3. **Supabase Collection**:
   - Added `supabase-schema.sql` for the registration table and realtime publication.
   - Added a browser bridge that sends the existing form payload to Supabase without requiring a rebuild of the bundled app.

4. **Latest X Task**:
   - Added the latest like-and-retweet task through `patch-bundle.mjs`, which runs automatically during the Netlify build.

5. **Referral and duplicate protection**:
   - Added unique referral link generation, quote-tweet confirmation, and one-submission-per-device enforcement backed by Supabase.

---

## How to Set Up Google Sheets
1. Open your Google Sheet.
2. In the top menu, go to **Extensions** > **Apps Script**.
3. Paste the contents of `google-apps-script-code.js` into the editor.
4. Click **Deploy** > **Manage Deployments** (or **New Deployment**).
   - Set **Select type**: *Web app*
   - Set **Execute as**: *Me*
   - Set **Who has access**: *Anyone*
5. Click **Deploy**. If the URL changed, update the URL in `assets/index-dvfib72a.js`.

The Supabase integration is the preferred storage path once `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured.
