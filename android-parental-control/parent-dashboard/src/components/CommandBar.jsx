import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase.js";

/** Sends remote commands to the child device via the relayCommand Cloud Function. */
export default function CommandBar({ familyId, device }) {
  const relay = httpsCallable(functions, "relayCommand");

  const send = (verb, arg) =>
    relay({ familyId, deviceId: device.id, verb, arg })
      .catch((e) => alert("Command failed: " + e.message));

  return (
    <div className="commandbar">
      <button onClick={() => send("LOCATE_NOW")}>📍 Locate now</button>
      <button onClick={() => send("RING")}>🔔 Ring</button>
      <button onClick={() => send("LOCK_NOW")}>🔒 Lock</button>
      <button onClick={() => send("UNLOCK")}>🔓 Unlock</button>
      <button onClick={() => send("BEDTIME_NOW")}>🌙 Bedtime now</button>
      <button onClick={() => send("REFRESH_SETTINGS")}>🔄 Push settings</button>
    </div>
  );
}
