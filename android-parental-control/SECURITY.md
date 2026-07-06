# Security & privacy model

This tool collects sensitive data about a **minor child** — location, app usage, and
device state. That data is protected as follows, and the design deliberately minimizes
what is collected and how long it is kept.

## Principles

- **Purpose limitation.** Data is used only to let a parent keep their own child safe.
  No third-party ad or analytics SDKs are included anywhere in the project.
- **Transparency.** The child app is visible and shows the child what is monitored.
- **Data minimization.** Only what the features need is collected. Location history is
  kept **7 days** by default and then deleted by a scheduled Cloud Function.
- **Parent control.** The parent can delete any child's data, or the whole family, from
  the dashboard; deletion cascades in a Cloud Function.

## In transit

- All client ↔ Firebase traffic uses **TLS** (Firestore/HTTPS/FCM are TLS-only).
- FCM command payloads carry only a command id and minimal args; the child app fetches
  full command detail from Firestore over TLS and authenticates as the device.

## At rest

- Firestore encrypts all data at rest (Google-managed keys).
- On the child device, secrets (pairing token, device credentials) are stored with
  **Jetpack Security `EncryptedSharedPreferences`** (AES-256, keys in the Android
  Keystore / StrongBox where available). See `util/SecureStore.kt`.
- No raw location or usage data is written to app logs.

## Authentication & authorization

- Parents authenticate with **Firebase Auth** (email/password) and are **strongly
  encouraged to enable TOTP 2FA (MFA)**, which the dashboard supports and prompts for.
- The child device authenticates with its own Firebase identity (custom token minted at
  pairing) scoped to a single family/device document.
- **Firestore Security Rules** (`firebase/firestore.rules`) enforce that a parent can
  read/write **only their own family's** documents, and that a child device can write
  only its own telemetry and read only its own settings/commands. Rules are the
  authoritative boundary — the apps are not trusted.

## Retention & deletion

| Data | Retention | Mechanism |
| --- | --- | --- |
| Location history | 7 days (configurable) | `cleanupLocationHistory` scheduled function |
| Usage stats | 30 days rolling | `cleanupUsageStats` scheduled function |
| Alerts | 90 days | `cleanupAlerts` scheduled function |
| Commands | deleted on ack | child app deletes after execution |
| Everything for a child/family | on demand | `deleteChildData` / `deleteFamily` callable |

## Threat model notes

- This is **not** anti-forensic or covert software; the child can see it is running.
- Device Owner makes the app hard for the child to remove, which is the intended
  tamper-resistance for a minor — **not** a mechanism for hiding from an adult.
- The parent account is the highest-value credential; 2FA and a strong password matter.
- If you lose the signing keystore you cannot ship updates — back it up securely.
