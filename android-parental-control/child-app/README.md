# Child app (Android)

Kotlin + Jetpack Compose, min SDK 31 (Android 12+). This is the app installed on the
**child's** phone. It is deliberately **visible** — see the transparency screen in
`ui/MainActivity.kt`.

## Prerequisites

1. **`google-services.json`** — download it from your Firebase project (Project settings →
   Your apps → Android app with package `com.family.guardian`) and place it at
   `app/google-services.json`. It is git-ignored; a template is at
   `app/google-services.json.example`.
2. **Signing keystore** — see the root README "Building & signing". Put credentials in
   `keystore.properties` (git-ignored).
3. **Gradle wrapper jar** — run `gradle wrapper --gradle-version 8.9` once (or use your
   IDE) to generate `gradle/wrapper/gradle-wrapper.jar`; only the `.properties` is checked in.

## Build

```bash
./gradlew assembleRelease      # signed release APK (needs keystore.properties)
./gradlew assembleDebug        # unsigned debug build for local testing
```

## Provisioning as Device Owner

The strong controls require Device Owner. Do **not** just `adb install` on the target
device — follow `../PROVISIONING.md`. For a test device:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell dpm set-device-owner com.family.guardian/.admin.GuardianDeviceAdminReceiver
```

## Source map

| Area | Package | Key files |
| --- | --- | --- |
| Location & geofencing | `location` | `LocationReporter`, `GeofenceManager`, `GeofenceBroadcastReceiver` |
| Usage & app inventory | `usage` | `UsageStatsReporter` |
| Blocking & time limits | `blocking` | `DevicePolicyController` (DO), `AppBlockAccessibilityService` (fallback), `BlockPolicy` |
| Screen time & bedtime | `screentime` | `ScreenTimeManager`, `BedtimeEnforcer`, `BedtimeScheduler` |
| Content filtering | `content` | `ContentFilterController`, `FilterVpnService` |
| Remote commands | `fcm` | `GuardianFcmService`, `CommandExecutor` |
| Reliability | `service`, `boot`, `work` | `GuardianForegroundService`, `BootReceiver`, `GuardianWatchdogWorker` |
| Pairing & UI | `ui`, `data` | `MainActivity`, `PairingActivity`, `PairingManager` |
| Security storage | `util` | `SecureStore` (EncryptedSharedPreferences) |

## Testing without Device Owner

The app runs fine without DO: blocking falls back to the accessibility overlay, and the
Private-DNS and uninstall-protection features become no-ops (logged). This is useful for
quickly exercising location, usage, geofencing, and commands on a normal debug install.
