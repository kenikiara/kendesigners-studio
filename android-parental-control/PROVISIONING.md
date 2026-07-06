# Device Owner provisioning

The child app's strongest controls (silent app hide/suspend, uninstall protection,
factory-reset protection, Private DNS policy, forced `lockNow()`) require the app to be
the device's **Device Owner (DO)**. A device can only have a Device Owner set on a
**fresh / factory-reset device with no accounts added yet**.

This guide covers two paths:

1. **QR-code / `afw#` enrollment** — the real setup you use on the child's phone.
2. **`adb dpm set-device-owner`** — a fast path for a test device on your bench.

> The app still runs **without** Device Owner. In that mode it falls back to an
> `AccessibilityService` overlay for blocking and cannot enforce uninstall/factory-reset
> protection or Private DNS. See the fallback notes in the child app source.

---

## Prerequisites

- A signed release APK (`app-release.apk`) hosted at an **HTTPS URL** the child phone
  can reach during setup.
- The **base64url SHA-256 checksum** of that exact APK (see README build step 4).
- The phone **factory reset** (or brand new, before adding any Google account).

---

## Path A — QR-code provisioning (recommended)

Android's setup wizard can enroll a Device Owner from a QR code that points at your APK.

### 1. Build the provisioning JSON

Create `provisioning.json`:

```json
{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME":
    "com.family.guardian/.admin.GuardianDeviceAdminReceiver",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION":
    "https://your-host.example.com/app-release.apk",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM":
    "PUT_BASE64URL_SHA256_OF_APK_HERE",
  "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
  "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": false,
  "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
    "com.family.guardian.PAIRING_HINT": "open-app-to-scan-parent-qr"
  }
}
```

### 2. Turn the JSON into a QR code

Any offline QR generator works; the payload is the raw JSON string. Keep it offline —
the JSON contains your APK download URL.

### 3. Enroll the phone

1. Factory reset the child phone.
2. On the **very first "Hi there" welcome screen**, tap the screen **6 times** in the
   same spot. This opens the QR reader (downloads a QR scanner if needed over Wi-Fi).
3. Connect to Wi-Fi when prompted.
4. Scan your `provisioning.json` QR code.
5. Android downloads the APK, verifies the checksum, installs it, and sets it as
   Device Owner. Finish the setup wizard.
6. Open **Family Guardian** on the phone and scan the **pairing QR** from the parent
   dashboard to link this device to your family.

### Alternative: `afw#` shortcut

If you distribute through a managed setup, on the Google account screen you can type
`afw#setup` to trigger Android for Work enrollment and point it at your DPC. For a
private, single-family install the QR path above is simpler and needs no Google account.

---

## Path B — `adb dpm set-device-owner` (test bench only)

Fastest for development on a device/emulator you control.

```bash
# 1. Factory reset (or fresh emulator). Do NOT add a Google account.
# 2. Install the signed APK:
adb install -r app-release.apk

# 3. Make it Device Owner:
adb shell dpm set-device-owner com.family.guardian/.admin.GuardianDeviceAdminReceiver
```

Expected output: `Success: Device owner set to package com.family.guardian`.

If it fails with `Not allowed to set the device owner because there are already some
accounts on the device`, remove all accounts (Settings → Accounts) or factory reset,
then retry.

### Removing Device Owner (cleanup)

```bash
adb shell dpm remove-active-admin com.family.guardian/.admin.GuardianDeviceAdminReceiver
```

Or, in the app itself, use **Settings → Unenroll** (requires the parent account
confirmation the app enforces).

---

## What Device Owner unlocks in this app

| Capability | API used | Fallback without DO |
| --- | --- | --- |
| Silently hide/suspend apps | `setApplicationHidden`, `setPackagesSuspended` | Accessibility overlay |
| Block uninstall of Guardian | `setUninstallBlocked` | none (child can uninstall) |
| Factory-reset protection | `setFactoryResetProtectionPolicy` / DISALLOW_FACTORY_RESET | none |
| Force lock | `lockNow()` | Accessibility overlay + keyguard prompt |
| Filtering Private DNS | `setGlobalPrivateDnsModeSpecificHost` | optional VpnService |
| Prevent DO removal | user restriction `DISALLOW_ADD_USER`, `DISALLOW_FACTORY_RESET` | none |

See `child-app/.../blocking/DevicePolicyController.kt` for the exact calls and comments.
