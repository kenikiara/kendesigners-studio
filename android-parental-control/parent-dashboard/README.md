# Parent dashboard (web)

React + Vite + Firebase JS SDK. Runs in the parent's browser (desktop or phone). Chosen
over a second native app so there's less code to audit and it works anywhere.

## Setup

```bash
cp .env.example .env      # fill from Firebase console → web app config
npm install
npm run dev               # http://localhost:5173
```

Deploy to Firebase Hosting (optional):

```bash
npm run build
firebase deploy --only hosting   # after `firebase init hosting` pointing at dist/
```

## Features

- **Sign in** with Firebase email/password and **TOTP 2FA** (enroll from the Devices tab;
  sign-in prompts for the code when enrolled).
- **Map** — live marker, 7-day trail, and safe-zone overlays.
- **Apps & limits** — installed apps, per-app block, flag-on-open, daily time limits.
- **Rules** — screen-time budget, bedtime window, geofence editor, content filter (Private
  DNS host + optional VPN blocklist domains).
- **Activity** — chronological alert feed (geofence, flagged app, screen-time, monitoring off).
- **Devices** — pair a child device by QR (`createPairingCode`), see per-device health, and
  delete a child's data.
- **Commands** — locate now, ring, lock, unlock, bedtime now, push settings (via `relayCommand`).

## How pairing works

1. Click **Generate pairing QR** on the Devices tab. This calls the `createPairingCode`
   Cloud Function, which mints a child custom token + single-use code (valid 15 min).
2. The QR encodes `{ familyId, pairingCode, customToken }`.
3. The child app scans it, signs in with the custom token (claims: `familyId`,
   `role: "child"`), and registers itself. The Security Rules then scope it to your family.

## Push alerts in the browser

To receive alerts as web push, register the FCM token on sign-in using `VITE_FIREBASE_VAPID_KEY`
and a `firebase-messaging-sw.js` service worker in `public/`. The `parentUsers/{uid}.fcmTokens`
array is what the `onAlertCreated` function sends to. A starter service worker is in
`public/firebase-messaging-sw.js`.
