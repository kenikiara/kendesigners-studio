import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getMultiFactorResolver,
  multiFactor,
  TotpMultiFactorGenerator,
} from "firebase/auth";
import { auth } from "./firebase.js";
import QRCode from "qrcode";

/**
 * Sign-in screen with TOTP (authenticator-app) 2FA support.
 *  - Normal email/password sign-in.
 *  - If the account has TOTP enrolled, Firebase throws auth/multi-factor-auth-required;
 *    we resolve it by prompting for the 6-digit code.
 *  - After sign-in, a parent without 2FA is offered enrollment (strongly encouraged).
 */
export default function AuthGate({ children, user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mfaResolver, setMfaResolver] = useState(null);
  const [otp, setOtp] = useState("");

  if (user) return children;

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === "auth/multi-factor-auth-required") {
        setMfaResolver(getMultiFactorResolver(auth, err));
      } else {
        setError(err.message);
      }
    }
  }

  async function handleOtp(e) {
    e.preventDefault();
    setError("");
    try {
      const hint = mfaResolver.hints[0];
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, otp);
      await mfaResolver.resolveSignIn(assertion);
    } catch (err) {
      setError("Invalid code. Try again.");
    }
  }

  return (
    <div className="auth">
      <h1>Family Guardian</h1>
      <p className="notice">
        For a parent monitoring their own minor child, on a device the family owns, with the
        child's knowledge. Other uses may be illegal.
      </p>

      {!mfaResolver ? (
        <form onSubmit={handleSignIn}>
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Sign in</button>
        </form>
      ) : (
        <form onSubmit={handleOtp}>
          <p>Enter the 6-digit code from your authenticator app.</p>
          <input inputMode="numeric" placeholder="123456" value={otp}
            onChange={(e) => setOtp(e.target.value)} required />
          <button type="submit">Verify</button>
        </form>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

/**
 * TOTP enrollment flow, shown from Settings for a parent who hasn't set up 2FA.
 * Returns { secret, otpauthUrl, qrDataUrl } to render, then finalize(code) to complete.
 */
export function useTotpEnrollment() {
  const [state, setState] = useState(null);

  async function begin() {
    const session = await multiFactor(auth.currentUser).getSession();
    const secret = await TotpMultiFactorGenerator.generateSecret(session);
    const url = secret.generateQrCodeUrl(auth.currentUser.email, "Family Guardian");
    const qrDataUrl = await QRCode.toDataURL(url);
    setState({ secret, qrDataUrl });
  }

  async function finalize(code) {
    const assertion = TotpMultiFactorGenerator.assertionForEnrollment(state.secret, code);
    await multiFactor(auth.currentUser).enroll(assertion, "Authenticator app");
    setState(null);
  }

  return { state, begin, finalize };
}
