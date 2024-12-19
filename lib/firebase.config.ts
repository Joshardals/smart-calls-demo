import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBU2srS2w87ifHedntKsrJ4MiblCVyz64s",
  authDomain: "smart-calls-c5889.firebaseapp.com",
  projectId: "smart-calls-c5889",
  storageBucket: "smart-calls-c5889.firebasestorage.app",
  messagingSenderId: "230382965812",
  appId: "1:230382965812:web:3f4d002d6f191f6f2a6661",
  measurementId: "G-G1TTM7M3K7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
