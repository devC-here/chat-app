// firebase-messaging-sw.js
// Place at ROOT of hosted site — same folder as index.html
// Uses the compat SDK (required for service workers — ES modules not supported here)

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyBF8al_v9qG_RTsf_Fd1lg7n0Cy5iqEVvU",
  authDomain:        "chat-app-ac67c.firebaseapp.com",
  databaseURL:       "https://chat-app-ac67c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "chat-app-ac67c",
  storageBucket:     "chat-app-ac67c.firebasestorage.app",
  messagingSenderId: "736652099220",
  appId:             "1:736652099220:web:efa0362564d4bf6556be81",
  measurementId:     "G-EZY8RMTG7L"
});

const messaging = firebase.messaging();

// ─────────────────────────────────────────────────────────────────────────────
// onBackgroundMessage fires ONLY when the app tab is in the background/closed
// AND the payload does NOT have a `notification` field (data-only messages).
//
// If your payload HAS a `notification` field (sent from Firebase Console),
// the browser handles the display automatically — this handler won't fire.
// Use data-only messages from your server/Cloud Functions for full control.
// ─────────────────────────────────────────────────────────────────────────────
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received:', payload);

  const n = payload.notification || {};
  const d = payload.data         || {};

  const title = n.title || d.title || '💕 Love Chat';
  const body  = n.body  || d.body  || 'You have a new message';
  const icon  = n.icon  || d.icon  || '/icon-192.png';

  // If browser already auto-displayed (notification field present), skip manual display
  if (payload.notification) {
    console.log('[SW] Notification payload — browser handles display automatically');
    return;
  }

  return self.registration.showNotification(title, {
    body,
    icon,
    badge:    '/icon-192.png',
    tag:      'love-chat-msg',
    renotify: true,
    vibrate:  [200, 100, 200, 100, 200],
    data:     { url: self.location.origin },
    actions: [
      { action: 'open',  title: '💬 Open Chat' },
      { action: 'close', title: 'Dismiss'      }
    ]
  });
});

// ── Notification click: open/focus the app tab ────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.startsWith(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── Lifecycle: take control immediately ──────────────────────────────────────
self.addEventListener('install',  ()  => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
