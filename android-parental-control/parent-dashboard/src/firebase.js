import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging, isSupported } from "firebase/messaging";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const messagingPromise = isSupported().then((ok) => (ok ? getMessaging(app) : null));
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Requests notification permission and returns the FCM web-push token for this browser,
 * or null if unsupported/denied. Stored in parentUsers/{uid}.fcmTokens so alerts reach it.
 */
export async function getWebPushToken() {
  const messaging = await messagingPromise;
  if (!messaging || !VAPID_KEY) return null;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;
  const { getToken } = await import("firebase/messaging");
  return getToken(messaging, { vapidKey: VAPID_KEY }).catch(() => null);
}
