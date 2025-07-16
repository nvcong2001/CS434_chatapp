import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // apiKey: import.meta.env.API_KEY,
  apiKey: "AIzaSyACwxfYXHIWZYj-DmOK7c-pLsZdpnszLIQ",
  authDomain: "chat-app-909e6.firebaseapp.com",
  projectId: "chat-app-909e6",
  storageBucket: "chat-app-909e6.firebasestorage.app",
  messagingSenderId: "109413819561",
  appId: "1:109413819561:web:dfc5f184e61b9338fa35b8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
