// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqIAmHRpmfiaYoFCHvNmwEiWNkSUO47cw",
    authDomain: "cwm-2024-2-m-p.firebaseapp.com",
    projectId: "cwm-2024-2-m-p",
    storageBucket: "cwm-2024-2-m-p.appspot.com",
    messagingSenderId: "404430809689",
    appId: "1:404430809689:web:953cfc506a40d6f3469f48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicia la conexión con Firestore, y exporta la referencia a la base.
export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);