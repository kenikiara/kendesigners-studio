import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.js";

const LABELS = {
  geofence_enter: "🟢 Entered safe zone",
  geofence_exit: "🟠 Left safe zone",
  flagged_app_opened: "🚩 Flagged app opened",
  screen_time_limit: "⏱️ Screen-time limit",
  monitoring_disabled: "⚠️ Monitoring turned off",
};

/** Clear, chronological activity feed of all alerts for the family. */
export default function ActivityFeed({ familyId }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, `families/${familyId}/alerts`),
      orderBy("createdAt", "desc"), limit(100)
    );
    return onSnapshot(q, (snap) => setAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [familyId]);

  if (alerts.length === 0) return <p className="empty">No activity yet.</p>;

  return (
    <ul className="feed">
      {alerts.map((a) => (
        <li key={a.id} className={a.type === "monitoring_disabled" ? "urgent" : ""}>
          <span className="type">{LABELS[a.type] || a.type}</span>
          <span className="msg">{a.message}</span>
          <span className="time">{new Date(a.createdAt).toLocaleString()}</span>
          <button className="link"
            onClick={() => deleteDoc(doc(db, `families/${familyId}/alerts/${a.id}`))}>dismiss</button>
        </li>
      ))}
    </ul>
  );
}
