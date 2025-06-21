// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8YSZiH_-p2ipJT6JfYgBkuMzyVo78tio",
  authDomain: "lactiapp.firebaseapp.com",
  projectId: "lactiapp",
  storageBucket: "lactiapp.firebasestorage.app",
  messagingSenderId: "670894439866",
  appId: "1:670894439866:web:7367d0840665679bb7b183",
  measurementId: "G-VG05M9F1YZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
