import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import AuthGate from "./auth.jsx";
import { useFamily } from "./useFamily.js";
import DeviceMap from "./components/DeviceMap.jsx";
import AppsPanel from "./components/AppsPanel.jsx";
import RulesPanel from "./components/RulesPanel.jsx";
import ActivityFeed from "./components/ActivityFeed.jsx";
import DevicesPanel from "./components/DevicesPanel.jsx";
import CommandBar from "./components/CommandBar.jsx";

const TABS = ["Map", "Apps & limits", "Rules", "Activity", "Devices"];

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Map");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <AuthGate user={user}>
      {user && <Dashboard user={user} tab={tab} setTab={setTab} />}
    </AuthGate>
  );
}

function Dashboard({ user, tab, setTab }) {
  const { family, devices, selectedDevice, setSelectedDevice, settings } = useFamily(user);

  if (!family) return <div className="loading">Setting up your family…</div>;

  return (
    <div className="app">
      <header>
        <strong>Family Guardian</strong>
        <div className="device-picker">
          <select
            value={selectedDevice?.id || ""}
            onChange={(e) => setSelectedDevice(devices.find((d) => d.id === e.target.value))}
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>{d.label || d.id}</option>
            ))}
          </select>
        </div>
        <button className="link" onClick={() => signOut(auth)}>Sign out</button>
      </header>

      {selectedDevice && (
        <CommandBar familyId={family.id} device={selectedDevice} />
      )}

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>

      <main>
        {!selectedDevice && tab !== "Devices" && (
          <p className="empty">No child device paired yet. Go to <b>Devices</b> to pair one.</p>
        )}
        {selectedDevice && tab === "Map" && (
          <DeviceMap familyId={family.id} device={selectedDevice} settings={settings} />
        )}
        {selectedDevice && tab === "Apps & limits" && (
          <AppsPanel familyId={family.id} device={selectedDevice} settings={settings} />
        )}
        {selectedDevice && tab === "Rules" && (
          <RulesPanel familyId={family.id} device={selectedDevice} settings={settings} />
        )}
        {selectedDevice && tab === "Activity" && <ActivityFeed familyId={family.id} />}
        {tab === "Devices" && <DevicesPanel family={family} devices={devices} user={user} />}
      </main>
    </div>
  );
}
