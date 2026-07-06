import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import { collection, doc, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase.js";

/**
 * Live map of the child's location + a short trail from locationHistory (7 days max on
 * the backend). Reads the denormalized lastLocation for the live marker and the history
 * subcollection for the trail. Also draws the configured safe zones.
 */
export default function DeviceMap({ familyId, device, settings }) {
  const [last, setLast] = useState(device.lastLocation || null);
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, `families/${familyId}/childDevices/${device.id}`),
      (d) => setLast(d.data()?.lastLocation || null)
    );
    const q = query(
      collection(db, `families/${familyId}/childDevices/${device.id}/locationHistory`),
      orderBy("timestamp", "desc"), limit(200)
    );
    const unsub2 = onSnapshot(q, (snap) =>
      setTrail(snap.docs.map((x) => x.data()).reverse())
    );
    return () => { unsub(); unsub2(); };
  }, [familyId, device.id]);

  if (!last) return <p className="empty">No location reported yet.</p>;

  const center = [last.latitude, last.longitude];
  const zones = settings?.geofences || [];

  return (
    <div className="map-wrap">
      <MapContainer center={center} zoom={15} style={{ height: "60vh" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            Last seen {new Date(last.timestamp).toLocaleString()}<br />
            Battery {last.batteryPct}% · ±{Math.round(last.accuracy)}m
          </Popup>
        </Marker>
        <Circle center={center} radius={last.accuracy} pathOptions={{ opacity: 0.3 }} />
        {trail.length > 1 && (
          <Polyline positions={trail.map((p) => [p.latitude, p.longitude])} />
        )}
        {zones.map((z) => (
          <Circle key={z.id} center={[z.latitude, z.longitude]} radius={z.radiusMeters}
            pathOptions={{ color: "green" }}>
            <Popup>{z.name}</Popup>
          </Circle>
        ))}
      </MapContainer>
      <p className="hint">Location history is kept for 7 days, then deleted automatically.</p>
    </div>
  );
}
