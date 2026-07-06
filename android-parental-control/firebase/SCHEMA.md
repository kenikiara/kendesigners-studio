# Firestore schema

All data lives under a single `families/{familyId}` document tree so that a Security
Rule can scope every read/write to one family. The parent owns the family; each child
device is a subdocument.

```
families/{familyId}
  ├─ ownerUid: string            # parent's Firebase Auth uid (the only full-access user)
  ├─ memberUids: string[]        # additional guardians (optional)
  ├─ createdAt: number
  │
  ├─ childDevices/{deviceId}     # deviceId == the child device's Auth uid
  │    ├─ label: string          # "Emma's Pixel"
  │    ├─ platform: "android"
  │    ├─ pairedAt: number
  │    ├─ fcmToken: string       # for command relay
  │    ├─ lastLocation: {lat,lng,accuracy,batteryPct,timestamp,onDemand}
  │    ├─ installedApps: InstalledApp[]
  │    ├─ health: DeviceHealth
  │    │
  │    ├─ settings/current        # parent-writable, device read-only
  │    │    ├─ locationIntervalMin, screenTimeBudgetMin
  │    │    ├─ bedtime: {startHour,startMinute,endHour,endMinute,enabled}
  │    │    ├─ blockedApps[], flaggedApps[], appTimeLimits{pkg:min}
  │    │    ├─ geofences: Geofence[]
  │    │    ├─ contentFilter: {privateDnsHost, useLocalVpn, blockedDomains[]}
  │    │    └─ monitoringEnabled: bool
  │    │
  │    ├─ locationHistory/{auto}  # device append-only; 7-day TTL (cleanup function)
  │    ├─ usageStats/{epochDay_pkg}   # per-app daily foreground time
  │    └─ commands/{commandId}    # parent creates; device acks by deleting
  │         └─ {verb, arg, createdAt, ackAt}
  │
  ├─ alerts/{auto}               # device creates; parent reads; 90-day TTL
  │    └─ {type, message, deviceId, createdAt, extra}
  │
  └─ pairingCodes/{code}         # short-lived; created by callable, consumed at pairing
       └─ {deviceIdReserved, expiresAt, used}
```

## Auth model

- **Parent**: normal Firebase Auth user (email/password + optional TOTP MFA). uid stored
  as `families/{familyId}.ownerUid`.
- **Child device**: signs in with a **custom token** minted by the `createPairingCode`
  callable, carrying a claim `{ familyId, role: "child" }`. The device's uid becomes its
  `deviceId`, so rules can match `request.auth.uid == deviceId`.

## Retention (enforced by scheduled functions)

| Path | TTL |
| --- | --- |
| `locationHistory` | 7 days |
| `usageStats` | 30 days |
| `alerts` | 90 days |
| `pairingCodes` | 15 minutes |
| `commands` | deleted by device on ack |
