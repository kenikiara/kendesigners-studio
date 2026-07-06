import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

/**
 * Screen-time budget, bedtime window, safe-zone geofences, and content filter. All write
 * to settings/current. Geofences are added by lat/lng/radius (a map-pick UI can be layered
 * on later; the data shape matches the child app's Geofence model).
 */
export default function RulesPanel({ familyId, device, settings }) {
  const s = settings || {};
  const [zoneName, setZoneName] = useState("");
  const [zoneLat, setZoneLat] = useState("");
  const [zoneLng, setZoneLng] = useState("");
  const [zoneRadius, setZoneRadius] = useState(150);

  const ref = doc(db, `families/${familyId}/childDevices/${device.id}/settings/current`);
  const save = (patch) => setDoc(ref, patch, { merge: true });

  function addZone() {
    if (!zoneName || !zoneLat || !zoneLng) return;
    const zone = {
      id: crypto.randomUUID(),
      name: zoneName,
      latitude: Number(zoneLat),
      longitude: Number(zoneLng),
      radiusMeters: Number(zoneRadius),
      notifyOnEnter: true,
      notifyOnExit: true,
    };
    save({ geofences: [...(s.geofences || []), zone] });
    setZoneName(""); setZoneLat(""); setZoneLng("");
  }

  function removeZone(id) {
    save({ geofences: (s.geofences || []).filter((z) => z.id !== id) });
  }

  const bedtime = s.bedtime || { startHour: 21, startMinute: 0, endHour: 7, endMinute: 0, enabled: true };
  const setBedtime = (patch) => save({ bedtime: { ...bedtime, ...patch } });

  return (
    <div className="rules">
      <section>
        <h3>Screen-time budget</h3>
        <label>Daily minutes:
          <input type="number" min="0" defaultValue={s.screenTimeBudgetMin ?? 120}
            onBlur={(e) => save({ screenTimeBudgetMin: Number(e.target.value) })} />
        </label>
        <label>Location report interval (min):
          <input type="number" min="1" defaultValue={s.locationIntervalMin ?? 15}
            onBlur={(e) => save({ locationIntervalMin: Number(e.target.value) })} />
        </label>
      </section>

      <section>
        <h3>Bedtime / downtime</h3>
        <label><input type="checkbox" checked={bedtime.enabled}
          onChange={(e) => setBedtime({ enabled: e.target.checked })} /> Enabled</label>
        <label>Start:
          <input type="time" defaultValue={hhmm(bedtime.startHour, bedtime.startMinute)}
            onBlur={(e) => setBedtime(parseHHMM(e.target.value, "start"))} />
        </label>
        <label>End:
          <input type="time" defaultValue={hhmm(bedtime.endHour, bedtime.endMinute)}
            onBlur={(e) => setBedtime(parseHHMM(e.target.value, "end"))} />
        </label>
      </section>

      <section>
        <h3>Safe zones (geofences)</h3>
        <ul>
          {(s.geofences || []).map((z) => (
            <li key={z.id}>
              {z.name} — {z.latitude.toFixed(4)}, {z.longitude.toFixed(4)} (r {z.radiusMeters}m)
              <button className="link" onClick={() => removeZone(z.id)}>remove</button>
            </li>
          ))}
        </ul>
        <div className="row">
          <input placeholder="Name (Home)" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
          <input placeholder="Lat" value={zoneLat} onChange={(e) => setZoneLat(e.target.value)} />
          <input placeholder="Lng" value={zoneLng} onChange={(e) => setZoneLng(e.target.value)} />
          <input type="number" placeholder="Radius m" value={zoneRadius}
            onChange={(e) => setZoneRadius(e.target.value)} />
          <button onClick={addZone}>Add zone</button>
        </div>
      </section>

      <section>
        <h3>Content filter</h3>
        <label>Filtering Private DNS host (Device Owner):
          <input placeholder="family-filter.dns.example.org"
            defaultValue={s.contentFilter?.privateDnsHost || ""}
            onBlur={(e) => save({ contentFilter: { ...(s.contentFilter || {}), privateDnsHost: e.target.value } })} />
        </label>
        <label><input type="checkbox" checked={s.contentFilter?.useLocalVpn || false}
          onChange={(e) => save({ contentFilter: { ...(s.contentFilter || {}), useLocalVpn: e.target.checked } })} />
          Also use local VPN blocklist
        </label>
        <label>Blocked domains (comma-separated):
          <input defaultValue={(s.contentFilter?.blockedDomains || []).join(", ")}
            onBlur={(e) => save({ contentFilter: { ...(s.contentFilter || {}),
              blockedDomains: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } })} />
        </label>
      </section>
    </div>
  );
}

const hhmm = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
function parseHHMM(v, which) {
  const [h, m] = v.split(":").map(Number);
  return which === "start" ? { startHour: h, startMinute: m } : { endHour: h, endMinute: m };
}
