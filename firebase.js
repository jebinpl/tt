// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1ymv16-dU8psCO-pIY0waY-Gkz3Mix9Q",
  authDomain: "mariahomoeo-it.firebaseapp.com",
  projectId: "mariahomoeo-it",
  storageBucket: "mariahomoeo-it.firebasestorage.app",
  messagingSenderId: "926576264951",
  appId: "1:926576264951:web:fa8db2664622fb31ec75f2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);