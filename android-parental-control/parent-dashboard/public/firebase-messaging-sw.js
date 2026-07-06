/* Firebase Cloud Messaging service worker for background web-push alerts.
 * Fill in the same config values as src/firebase.js (env vars aren't available here). */
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  appId: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "Family Guardian", { body: body || "" });
});
