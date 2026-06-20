import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyCx4kgSOFQYwnZuZP_wtsUi870cgIsFweI",
  authDomain: "genai-330c2-458107.firebaseapp.com",
  projectId: "genai-330c2-458107",
  storageBucket: "genai-330c2-458107.firebasestorage.app",
  messagingSenderId: "1043219669586",
  appId: "1:1043219669586:web:82c192d18bbd49102ab58b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "ai-studio-9b2ecffd-34c4-4a95-8a36-1fad38ff9f31");

export { app, auth, db };
