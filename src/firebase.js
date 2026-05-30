import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD21DDdWgQF864d3_UIjbGZJEhhKDhS5E4",
  authDomain: "iglesia-el-aposento-alto.firebaseapp.com",
  projectId: "iglesia-el-aposento-alto",
  storageBucket: "iglesia-el-aposento-alto.firebasestorage.app",
  messagingSenderId: "813599094842",
  appId: "1:813599094842:web:85c8f1eccfdc46661b5d03",
  measurementId: "G-4Y294Q3J7V",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export const messagingPromise = isSupported().then((supported) =>
  supported ? getMessaging(app) : null
);

export default app;