// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔧 Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Auth y proveedor Google
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 🗄️ Firestore (por si lo usas para guardar tomas)
const db = getFirestore(app);

export { auth, googleProvider, db };
