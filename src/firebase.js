import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBSf6lc2Pk6mquI67Hq_AoueN2FFI4p028",
  authDomain: "remione-ltd.firebaseapp.com",
  projectId: "remione-ltd",
  storageBucket: "remione-ltd.firebasestorage.app",
  messagingSenderId: "361707000237",
  appId: "1:361707000237:web:ccaa2c60e7e85a62db5124",
  measurementId: "G-XJ4SDBWPE8"
};

export const app = initializeApp(firebaseConfig);

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {});
}
