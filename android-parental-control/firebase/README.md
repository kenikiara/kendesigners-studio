# Firebase backend

Firestore schema (`SCHEMA.md`), Security Rules (`firestore.rules`), indexes, and Cloud
Functions (`functions/`) for Family Guardian.

## One-time setup

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # select/create your project, alias it "default"
cd functions && npm install && cd ..
```

In the Firebase console enable:
- **Authentication** → Email/Password, and **Multi-factor (TOTP)** for parents.
- **Firestore** (production mode).
- **Cloud Messaging**.
- **Cloud Functions** (Blaze plan is required for outbound FCM + scheduler).

## Deploy

```bash
firebase deploy --only firestore:rules,firestore:indexes,functions
```

## Local emulation

```bash
firebase emulators:start --only auth,firestore,functions
```

## Functions

| Function | Trigger | Purpose |
| --- | --- | --- |
| `createPairingCode` | callable (parent) | Mint child custom token + QR pairing payload |
| `relayCommand` | callable (parent) | Enqueue command + FCM push to device |
| `onAlertCreated` | Firestore create | Notify parents of any alert via FCM |
| `evaluateGeofences` | Firestore update | Server-side geofence transition backup |
| `cleanupLocationHistory` | schedule 6h | Delete location > 7 days |
| `cleanupUsageStats` | schedule 24h | Delete usage > 30 days |
| `cleanupAlerts` | schedule 24h | Delete alerts > 90 days |
| `cleanupPairingCodes` | schedule 30m | Delete expired pairing codes |
| `deleteChildData` | callable (parent) | Cascade-delete one child + revoke its auth |
| `deleteFamily` | callable (parent) | Cascade-delete the whole family |

## Security Rules summary

- A **guardian** (family `ownerUid` or a `memberUids` entry) has full access to only
  their own `families/{familyId}` tree.
- A **child device** authenticates with a custom token carrying `{ familyId, role:
  "child" }`; rules let it write only its own telemetry and read only its own
  settings/commands. It cannot read other families or other devices.
- `pairingCodes` are admin-only (touched exclusively by Cloud Functions).

See `firestore.rules` for the exact predicates and `SECURITY.md` at the repo root for the
overall privacy model.
