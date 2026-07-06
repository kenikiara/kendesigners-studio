import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

/**
 * Installed apps + usage, with per-app block toggles and daily time limits. Writes to
 * settings/current; the child device picks changes up on its next refresh or via a
 * REFRESH_SETTINGS command.
 */
export default function AppsPanel({ familyId, device, settings }) {
  const apps = device.installedApps || [];
  const blocked = new Set(settings?.blockedApps || []);
  const flagged = new Set(settings?.flaggedApps || []);
  const limits = settings?.appTimeLimits || {};

  async function save(patch) {
    await setDoc(
      doc(db, `families/${familyId}/childDevices/${device.id}/settings/current`),
      patch, { merge: true }
    );
  }

  function toggle(setName, current, pkg) {
    const next = new Set(current);
    next.has(pkg) ? next.delete(pkg) : next.add(pkg);
    save({ [setName]: [...next] });
  }

  function setLimit(pkg, minutes) {
    const next = { ...limits };
    if (minutes > 0) next[pkg] = minutes; else delete next[pkg];
    save({ appTimeLimits: next });
  }

  if (apps.length === 0) return <p className="empty">Waiting for the app list from the device…</p>;

  return (
    <table className="apps">
      <thead>
        <tr><th>App</th><th>Blocked</th><th>Flag on open</th><th>Daily limit (min)</th></tr>
      </thead>
      <tbody>
        {apps.filter((a) => !a.isSystem).map((a) => (
          <tr key={a.packageName}>
            <td title={a.packageName}>{a.label}</td>
            <td>
              <input type="checkbox" checked={blocked.has(a.packageName)}
                onChange={() => toggle("blockedApps", blocked, a.packageName)} />
            </td>
            <td>
              <input type="checkbox" checked={flagged.has(a.packageName)}
                onChange={() => toggle("flaggedApps", flagged, a.packageName)} />
            </td>
            <td>
              <input type="number" min="0" style={{ width: 70 }}
                defaultValue={limits[a.packageName] || ""}
                onBlur={(e) => setLimit(a.packageName, Number(e.target.value))} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
