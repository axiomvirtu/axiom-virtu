import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyD4wj4zCKJ-D40HtmO5M3kL5iWzOaOQAbM",
  authDomain: "axiom-virtu.firebaseapp.com",
  projectId: "axiom-virtu",
  storageBucket: "axiom-virtu.firebasestorage.app",
  messagingSenderId: "25455158859",
  appId: "1:25455158859:web:64e5796a82c85593748fce",
  measurementId: "G-FJJ557WXYR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
