// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAN0nBeJqxM9ySrMDft2tbICH5k3z8Ejzs",
  authDomain: "yousmart-6b6b4.firebaseapp.com",
  projectId: "yousmart-6b6b4",
  storageBucket: "yousmart-6b6b4.appspot.com",
  messagingSenderId: "1735593571",
  appId: "1:1735593571:web:0c53a12cd7fb6d54bc7256",
  measurementId: "G-FXKE8ENG1Q"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { firestore, storage, auth};