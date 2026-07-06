# Family Guardian

A self-hosted **Android parental-control system** for a parent to help keep their
own minor child safe on a **family-owned** phone.

> ### ⚖️ Plain-language use notice — read this first
>
> This software is intended for **one specific, lawful use**: a **parent or legal
> guardian** monitoring **their own minor child** on a device **the family owns**,
> **with the child's knowledge**. The child app is deliberately **visible** — it
> has an icon, a name, and an on-device screen that tells the child what is being
> monitored.
>
> Installing monitoring software on another adult's device, on a device you do not
> own, or **without the monitored person's knowledge** may be **illegal** in your
> jurisdiction (it can violate wiretapping, stalking, computer-misuse, and privacy
> laws). This project is **not** designed for, and must **not** be used for,
> covert surveillance of a partner, employee, or any other person. It is **not**
> published to the Play Store and is **not** for commercial use.
>
> You are responsible for complying with the laws that apply to you. If in doubt,
> talk to your child and consult a lawyer.

---

## What this is

Three modules that work together:

| Module | Runs on | Tech |
| --- | --- | --- |
| **`child-app/`** | The child's phone | Kotlin, Jetpack Compose, Android 12+ (API 31+) |
| **`parent-dashboard/`** | The parent's browser / phone browser | React + Vite + Firebase JS SDK |
| **`firebase/`** | Google Cloud | Firestore, Cloud Functions, Cloud Messaging, Security Rules |

The parent chooses a **web dashboard** (this repo) rather than a second native app
— it runs on the parent's phone browser or laptop, supports QR pairing, a live map,
push alerts, and 2FA, with far less code to audit.

## Feature map

**Child app**
- Live + periodic **location** (Fused Location Provider) and **geofencing** (safe zones).
- **App inventory & usage** reporting (`UsageStatsManager`).
- **App blocking & per-app time limits** — Device Owner (`DevicePolicyManager`) as the
  primary mechanism, with an `AccessibilityService` block-overlay fallback.
- **Screen-time budget & bedtime/downtime** enforcement (`lockNow()`).
- **Content filtering** — Device-Owner Private DNS **and/or** an optional local
  `VpnService` blocklist (trade-offs documented in code).
- **Remote commands** over FCM (lock, unlock, block/unblock app, locate now, ring, bedtime now).
- **Alerts** to the parent (flagged-app open, geofence transition, screen-time limit).
- **Reliability** — foreground service, battery-exemption request, boot restart, auto-restart.
- **Transparency & tamper-resistance** — visible app, uninstall/factory-reset protection as
  Device Owner, and a parent alert if monitoring is disabled.

**Parent dashboard**
- Firebase sign-in **with 2FA (TOTP)**, QR pairing to the child device.
- Live map + short (7-day) location history.
- Installed apps, usage stats, per-app blocks & time limits.
- Screen-time budget, bedtime windows, geofence editor.
- Remote commands, push alerts, and an activity feed.

## Repository layout

```
android-parental-control/
├── README.md               ← you are here (setup, sideloading, signing, legal note)
├── PROVISIONING.md         ← Device Owner setup: QR / afw# enrollment and adb dpm
├── TROUBLESHOOTING.md      ← OEM battery-killers and reliability fixes
├── SECURITY.md             ← data protection, retention, and privacy model
├── child-app/              ← Android (Kotlin, Compose)
├── parent-dashboard/       ← React web dashboard
└── firebase/               ← Firestore schema, rules, indexes, Cloud Functions
```

## Quick start (overview)

1. **Create a Firebase project** — enable Authentication (Email/Password + TOTP MFA),
   Firestore, Cloud Messaging, and Cloud Functions. See `firebase/README.md`.
2. **Deploy the backend** — `firebase deploy` (rules, indexes, functions).
3. **Build & sign the child APK** — see [Building & signing](#building--signing-the-child-apk) below.
4. **Provision the child phone as Device Owner** — factory-reset the phone and enroll
   using the QR method in `PROVISIONING.md` (or `adb dpm set-device-owner` for testing).
5. **Run the parent dashboard** — `npm run dev` locally, or deploy to Firebase Hosting.
6. **Pair** — open the dashboard, generate a pairing QR, scan it in the child app.

Each module has its own README with exact commands.

## Building & signing the child APK

The child app is **never** published to the Play Store; it is **sideloaded**. You must
sign it with your own keystore so updates install over the top and so Device-Owner
provisioning can verify the package checksum.

```bash
# 1. Generate a keystore ONCE and keep it safe (losing it means you can't update the app).
keytool -genkey -v -keystore family-guardian.keystore \
  -alias guardian -keyalg RSA -keysize 4096 -validity 10000

# 2. Put the keystore details in child-app/keystore.properties (git-ignored):
#    storeFile=../family-guardian.keystore
#    storePassword=********
#    keyAlias=guardian
#    keyPassword=********

# 3. Build a signed release APK:
cd child-app
./gradlew assembleRelease
# → app/build/outputs/apk/release/app-release.apk

# 4. Compute the checksum needed for QR provisioning (see PROVISIONING.md):
sha256sum app/build/outputs/apk/release/app-release.apk | cut -d' ' -f1 \
  | xxd -r -p | openssl base64 | tr '+/' '-_' | tr -d '='
```

### Sideloading the signed APK

```bash
adb install -r app-release.apk          # for testing over USB
# or host app-release.apk at an HTTPS URL and download it on the child phone.
```

For a device you intend to make **Device Owner**, do **not** install first — the
provisioning flow installs the app for you during setup (see `PROVISIONING.md`).

## Splitting this into its own GitHub repository

This project is self-contained under `android-parental-control/`. To promote it to its
own standalone repo:

```bash
# from the parent repo root
git subtree split --prefix=android-parental-control -b family-guardian-standalone
cd /path/to/new/clone
git pull /path/to/parent-repo family-guardian-standalone
# or simply copy the android-parental-control/ directory into a fresh repo.
```

## License & responsibility

Provided as-is for personal, non-commercial family use. See the use notice at the top.
No warranty. You are responsible for lawful use and for the safety and privacy of your
child's data.
