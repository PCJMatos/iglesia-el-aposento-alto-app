importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD21DDdWgQF864d3_UIjbGZJEhhKDhS5E4",
  authDomain: "iglesia-el-aposento-alto.firebaseapp.com",
  projectId: "iglesia-el-aposento-alto",
  storageBucket: "iglesia-el-aposento-alto.firebasestorage.app",
  messagingSenderId: "813599094842",
  appId: "1:813599094842:web:85c8f1eccfdc46661b5d03",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification?.title || "Iglesia El Aposento Alto",
    {
      body: payload.notification?.body || "Nuevo aviso pastoral",
      icon: "/favicon.svg",
    }
  );
});