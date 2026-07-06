# MEGA PROMPT — "Saka Tenje" (Personal & Family Anti-Theft, Self-Hosted)

Private, sideloaded anti-theft and intruder-detection app for phones I own or
manage for my family. Not for Google Play — implement the full feature set
without Play-policy gating. All features free and enabled; no billing, no
paywall.

Build it in **ordered, compiling milestones** (see BUILD ORDER). Do not try to
emit every file in one message — finish a milestone, tell me it builds, then
continue. Correct-and-compiling beats complete-and-broken.

---

## ROLE
Senior Android engineer, expert in Kotlin, Jetpack Compose, CameraX,
foreground services, the Device Administration API, SMS handling, WorkManager,
and OEM background-reliability quirks. Production-quality code: real error
handling, null safety, lifecycle correctness, no leaked cameras or services.
No TODOs or stubs in a milestone you declare "done."

---

## TARGET & STACK (pin these exactly, then confirm they resolve before coding)
- Kotlin, latest stable AGP + Gradle.
- **compileSdk / targetSdk = 35 (Android 15); minSdk = 26.** State the exact
  version of every dependency you use and note anything that behaves
  differently across API 26 → 35.
- UI: Jetpack Compose + Material 3, dark-first, single central theme file.
- Architecture: MVVM, clean data/domain/presentation split. Coroutines + Flow.
- Storage: Room (event log) + DataStore (settings). Camera: CameraX.
  Background: Foreground Service + WorkManager. DI: Hilt.

---

## NON-NEGOTIABLE PRINCIPLE — OWNER-OPERATED, DISCLOSED
This is a tool the **owner installs on a device they own or lawfully manage.**
Bake that in:
- First-run setup is done **by the owner**, who names the device and enters
  where alerts go. No silent/remote provisioning.
- Setup shows a clear one-time notice describing exactly what is captured
  (photos, location, and audio) and where it is sent.
- **Audio capture is ON by default, activated by the theft trigger** (see
  THEFT-RESPONSE CAPTURE) — not a continuous background recording. Include an
  in-app note that recording others can be legally restricted in some
  jurisdictions, so the owner understands what they're enabling.
- All data stays on-device or goes only to the **owner's own** email/Drive —
  never to any third-party server.
- Add a short in-app "Responsible use" screen: this is for your own and your
  family's devices, with the family member's awareness where they're an adult.

The stealth features below exist so a **thief** can't find and kill the app —
not to hide it from a device's rightful, informed user.

---

## CORE MECHANISM — FAILED-UNLOCK DETECTION
Use the **Device Administration API**: a `DeviceAdminReceiver` overriding
`onPasswordFailed()` and `onPasswordSucceeded()`. On failures past a
configurable threshold (default 1), start a foreground service (service types
`camera` + `location` + `microphone`) that runs the theft-response capture
bundle below.

Comment clearly: background camera and microphone **require** a running
foreground service on API 28+ — never capture from a bare receiver.

---

## THEFT-RESPONSE CAPTURE
On the failed-unlock threshold (default 1), the foreground service captures, as
**one bundle**:
1. A front-camera **photo burst** (configurable count, no shutter sound, no
   preview) + optional back-camera shot for surroundings.
2. An **audio clip — default ON, configurable length (e.g. 20–60s)**. Use
   CameraX `VideoCapture` audio track or `MediaRecorder`; save compressed
   (m4a/AAC) sized for email/Drive upload; handle mic-in-use and
   permission-revoked cases gracefully.
3. A fused-provider **GPS fix** + reverse-geocoded address (timeout → last-known
   fallback).
4. The **device tag**, timestamp, and file paths.

All of it is written to Room and pushed through the alert pipeline **together**.
Also capture one photo on `onPasswordSucceeded()` if it followed N failures.

Settings for this bundle: audio on/off (default on), clip length, photo burst
count, back-camera on/off, and whether to attach audio to email vs. Drive-only
(audio files are larger).

---

## FEATURES (all enabled by default)

**Intruder detection** — the theft-response bundle above; on-device event log
with thumbnails, audio playback, time, map, and device tag.

**Alerts**
- Email: photos, audio clip, timestamp, location, map link, device name;
  customisable subject/body; option to keep the on-device alert notification
  silent.
- Auto-upload captures to the **owner's Google Drive** (Drive REST + OAuth),
  queued via WorkManager with retry/backoff.

**Theft defence**
- **SIM-change detection:** on SIM removal/swap, send the new number +
  location to the owner. (Compare against a stored subscriber id; note
  `READ_PHONE_STATE`/`getSubscriberId` restrictions on recent Android and
  implement the best available signal.)
- **SMS remote commands:** owner texts a secret code word to trigger:
  - `LOCATE` → current GPS + map link
  - `ALARM` → loud siren at full volume even if silent
  - `LOCK` → lock the device immediately
  - `PHOTO` → capture and email a fresh photo
  - `RECORD` → capture a fresh audio clip on demand and email it
  - `WIPE` → factory reset; **require the code word twice** to confirm
  Commands work from any SIM. Consume the matching SMS so it doesn't hit the
  inbox.
- **Low-battery last stand:** one final location ping below a battery threshold.

**Stealth (so a thief can't disable it)**
- Optional decoy/warning screen shown on repeated failures.
- App disguise via `<activity-alias>` + `setComponentEnabledSetting`.
- Lock the app itself behind its own PIN/pattern.
- **Be honest in comments about OS limits:** on Android 10+ you generally
  cannot fully hide the launcher icon, and recents-hiding is restricted.
  Implement the best available approach and document exactly what does and
  doesn't work per API level rather than pretending it's fully hidden.

**Family fleet** — per-install device name; all devices alert to one owner
inbox tagged by name; settings export/import as JSON to replicate config.

**Battery model** — event-driven only, no polling; service dormant until a
trigger fires. Document how Doze and OEM battery managers (MIUI, EMUI, OneUI,
etc.) can kill background work, and add the standard mitigations
(battery-optimisation exemption prompt, foreground-service justification).

---

## PERMISSIONS — with rationale screens
`BIND_DEVICE_ADMIN`, `CAMERA`, `RECORD_AUDIO`, `ACCESS_FINE/COARSE_LOCATION`,
`FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_CAMERA` +
`FOREGROUND_SERVICE_LOCATION` + `FOREGROUND_SERVICE_MICROPHONE`,
`RECEIVE_SMS`/`SEND_SMS`, `READ_PHONE_STATE`, `POST_NOTIFICATIONS`, `INTERNET`.
Handle denials and "don't ask again" with a Settings deep-link fallback.

---

## TECHNICAL GUIDANCE FOR THE HARD PARTS
- **Email:** a pluggable `AlertSender` with two implementations:
  (1) **Direct SMTP** — owner enters their own address + app-password.
  Comment loudly that these credentials sit on-device, so a thief who roots
  the phone could read that mailbox; recommend a **dedicated throwaway sender
  account**, never the owner's primary email.
  (2) **Relay endpoint** — owner supplies a URL + key; no mail creds on device.
  Document the request/response JSON contract. **Prefer this as the default.**
- **Camera:** CameraX `ImageCapture` inside the foreground service, no visible
  preview.
- **Audio:** `MediaRecorder` (or CameraX `VideoCapture` audio track); AAC/m4a,
  bounded clip length, released cleanly to avoid leaking the mic.
- **GPS:** `FusedLocationProviderClient`, single high-accuracy request with
  timeout → last-known fallback; `Geocoder` with graceful failure.
- **SMS commands:** `BroadcastReceiver` matching the code word, executing, then
  aborting/consuming the broadcast.
- **Decoy/siren/lock:** full-screen Activity with `setShowWhenLocked` /
  `setTurnScreenOn`; `DevicePolicyManager.lockNow()`; max-volume ringtone loop.

---

## UI / UX
Onboarding/permissions → Dashboard (per-device status + recent events) →
Event detail (photos + audio playback + map) → Remote-command reference →
Settings → Family setup. Persistent "protecting this device" status while
active. Colours and fonts in one theme file for easy re-skin (e.g. navy + gold
later).

---

## BUILD ORDER (each milestone must compile and run before the next)
1. Project skeleton: Gradle files, manifest, Hilt, theme, empty Dashboard.
2. Device Admin receiver + foreground service + failed-unlock → Room log.
3. CameraX capture inside the service; event detail with photos.
4. Audio capture added to the theft-response bundle; playback in event detail.
5. Location + reverse-geocode; map link in events.
6. Alert pipeline: relay `AlertSender` first, then SMTP; then Drive upload.
7. Theft defence: SMS commands (incl. `RECORD`), SIM change, low-battery ping.
8. Stealth: app-lock, decoy, disguise (with the honest OS-limit notes).
9. Family: device naming, settings export/import.
After each, print what to test on a **real device** (emulators can't do
lock-screen failures, SMS, SIM events, or real mic/camera capture).

---

## DELIVERABLES
1. Project structure tree.
2. `build.gradle` (project + app) with pinned versions.
3. Full `AndroidManifest.xml`.
4. Every Kotlin file, delivered milestone by milestone.
5. `README.md`: setup, how to replicate config across family phones, the two
   email options and their trade-offs, and which features need a real device.

## CONSTRAINTS
- No placeholders or truncation *within a delivered milestone*.
- Flag any feature that's impossible/limited on a given API level and implement
  the closest working alternative rather than skipping silently.
- Comment non-obvious Android-specific decisions.
- Production-quality: error handling, null safety, lifecycle correctness, no
  leaked cameras/mics/services.

**Begin with the project structure tree, then work through the build order.**
