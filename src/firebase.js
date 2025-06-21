
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8YSZiH_-p2ipJT6JfYgBkuMzyVo78tio",
  authDomain: "lactiapp.firebaseapp.com",
  projectId: "lactiapp",
  storageBucket: "lactiapp.appspot.com",
  messagingSenderId: "670894439866",
  appId: "1:670894439866:web:7367d0840665679bb7b183",
  measurementId: "G-VG05M9F1YZ"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
