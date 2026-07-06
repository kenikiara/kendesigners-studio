# Troubleshooting — keeping monitoring alive on OEM "battery killers"

Many Android OEMs ship aggressive background-process managers that kill or freeze
apps to save battery. These will silently stop location reporting and command
handling unless the child phone is configured to exempt Family Guardian. Because the
app is a **Device Owner**, most of these can be set programmatically, but some require
a one-time manual toggle per OEM.

## Symptoms

- Location stops updating after the phone sits idle for a while.
- Remote commands (lock, locate now) don't arrive until the child opens the app.
- The persistent notification disappears.
- Alerts stop after a reboot.

## Universal fixes (the app does these automatically)

1. **Foreground service** with a persistent notification (`GuardianForegroundService`).
2. **Battery-optimization exemption** requested at setup
   (`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`); as Device Owner the app also adds itself to
   the power-save whitelist via `setApplicationRestriction` where supported.
3. **Restart on boot** via `BOOT_COMPLETED` + `LOCKED_BOOT_COMPLETED`.
4. **WorkManager** periodic watchdog re-arms the service and geofences if killed.
5. **FCM high-priority** data messages wake the app for on-demand commands.

## Per-OEM manual steps (do these once during setup)

| OEM | Where to look | What to enable |
| --- | --- | --- |
| **Xiaomi / MIUI / HyperOS** | Settings → Apps → Family Guardian → **Autostart** ON; Battery saver → **No restrictions**; lock the app in Recents | Autostart, no battery restriction |
| **Samsung / One UI** | Settings → Battery → Background usage limits → **Never sleeping apps** → add Guardian; Settings → Apps → Guardian → Battery → **Unrestricted** | Never-sleeping, Unrestricted |
| **Huawei / EMUI** | Settings → Battery → App launch → Guardian → **Manage manually** → Auto-launch, Secondary launch, Run in background all ON | Manual launch, all ON |
| **OPPO / realme / ColorOS** | Settings → Battery → Guardian → **Allow background activity**; Settings → App management → Auto startup ON | Background activity, Auto startup |
| **Vivo / Funtouch/OriginOS** | Settings → Battery → High background power consumption → allow Guardian; Autostart manager ON | High-power background, Autostart |
| **OnePlus / OxygenOS** | Settings → Battery → Battery optimization → Guardian → **Don't optimize**; Advanced optimization OFF for Guardian | Don't optimize |
| **Stock Android / Pixel** | Settings → Apps → Guardian → Battery → **Unrestricted** | Unrestricted |

The child app's onboarding screen deep-links to these settings pages where the OEM
exposes them (see `util/OemBatteryHelper.kt`) and shows a checklist the parent can
verify remotely (the app reports its own restriction status to Firestore).

## Verifying reliability

- In the parent dashboard, the child device card shows **"last seen"** and a
  **health status** (foreground service running, battery unrestricted, permissions
  granted). If "last seen" is stale, walk through the OEM table above.
- `adb shell dumpsys deviceidle whitelist | grep guardian` should list the package.
- `adb shell dumpsys activity services com.family.guardian` should show the foreground
  service running.

## If monitoring is disabled or a permission is revoked

The app watches its own permission and admin state. If Device Owner is removed, an
accessibility service is turned off, background location is revoked, or the foreground
service is killed and can't restart, it writes a `monitoring_disabled` alert to
Firestore (best-effort, before it loses the ability to). The parent dashboard surfaces
this at the top of the activity feed.
