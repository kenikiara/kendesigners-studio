import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import QRCode from "qrcode";
import { functions } from "../firebase.js";
import { useTotpEnrollment } from "../auth.jsx";
import { auth } from "../firebase.js";

/**
 * Devices tab: pair a new child device (QR), see each device's health, enable 2FA, and
 * delete a child's data. Pairing calls createPairingCode and renders the returned payload
 * as a QR the child app scans.
 */
export default function DevicesPanel({ family, devices, user }) {
  const [qr, setQr] = useState(null);
  const [label, setLabel] = useState("");
  const totp = useTotpEnrollment();
  const [otp, setOtp] = useState("");

  async function pairNew() {
    const create = httpsCallable(functions, "createPairingCode");
    const res = await create({ familyId: family.id, deviceLabel: label || "Child device" });
    // The child app's PairingManager.parseQr expects exactly these fields.
    const payload = JSON.stringify({
      familyId: res.data.familyId,
      pairingCode: res.data.pairingCode,
      customToken: res.data.customToken,
    });
    setQr(await QRCode.toDataURL(payload));
  }

  async function deleteDevice(deviceId) {
    if (!confirm("Delete this child's data and unlink the device? This cannot be undone.")) return;
    const del = httpsCallable(functions, "deleteChildData");
    await del({ familyId: family.id, deviceId });
  }

  const hasMfa = auth.currentUser?.multiFactor?.enrolledFactors?.length > 0;

  return (
    <div className="devices">
      <section>
        <h3>Two-factor authentication</h3>
        {hasMfa ? (
          <p>✅ 2FA is enabled on your account.</p>
        ) : totp.state ? (
          <div>
            <p>Scan this in your authenticator app, then enter the 6-digit code:</p>
            <img src={totp.state.qrDataUrl} alt="TOTP QR" />
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
            <button onClick={() => totp.finalize(otp)}>Enable 2FA</button>
          </div>
        ) : (
          <button onClick={totp.begin}>Enable 2FA (recommended)</button>
        )}
      </section>

      <section>
        <h3>Pair a child device</h3>
        <input placeholder="Device label (Emma's phone)" value={label}
          onChange={(e) => setLabel(e.target.value)} />
        <button onClick={pairNew}>Generate pairing QR</button>
        {qr && (
          <div className="qr">
            <img src={qr} alt="Pairing QR" />
            <p>Open Family Guardian on the child phone → Scan pairing code. Valid 15 minutes.</p>
          </div>
        )}
      </section>

      <section>
        <h3>Paired devices</h3>
        {devices.length === 0 && <p className="empty">None yet.</p>}
        {devices.map((d) => (
          <div className="device-card" key={d.id}>
            <strong>{d.label || d.id}</strong>
            <DeviceHealth health={d.health} lastLocation={d.lastLocation} />
            <button className="link danger" onClick={() => deleteDevice(d.id)}>Delete data</button>
          </div>
        ))}
      </section>
    </div>
  );
}

function DeviceHealth({ health, lastLocation }) {
  if (!health) return <p className="hint">No health report yet.</p>;
  const stale = Date.now() - (health.lastSeen || 0) > 60 * 60 * 1000;
  const ok = (b) => (b ? "✅" : "❌");
  return (
    <ul className="health">
      <li className={stale ? "urgent" : ""}>
        Last seen {health.lastSeen ? new Date(health.lastSeen).toLocaleString() : "—"}
        {stale && " (stale — check battery settings)"}
      </li>
      <li>{ok(health.foregroundServiceRunning)} Service running</li>
      <li>{ok(health.isDeviceOwner)} Device Owner</li>
      <li>{ok(health.batteryUnrestricted)} Battery unrestricted</li>
      <li>{ok(health.backgroundLocationGranted)} Background location</li>
      <li>{ok(health.usageAccessGranted)} Usage access</li>
      {lastLocation && <li>Battery {lastLocation.batteryPct}%</li>}
    </ul>
  );
}
