// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8YBSZiH--p2ipJt6JfYgBkuMzyVo78tio",
  authDomain: "lactiapp.firebaseapp.com",
  projectId: "lactiapp",
  storageBucket: "lactiapp.appspot.com",
  messagingSenderId: "670894439866",
  appId: "1:670894439866:web:7367d0840665679bb7b183",
  measurementId: "G-V6Q5M9FYIZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
