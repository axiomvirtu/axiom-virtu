import { auth } from './firebase.js';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = '/index.html';
    }
  });

  const loginBtn = document.getElementById('google-login-btn');
  const errorMsg = document.getElementById('error-msg');

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        window.location.href = '/index.html';
      } catch (error) {
        errorMsg.classList.remove('hidden');
        errorMsg.innerText = 'Login gagal: ' + error.message;
      }
    });
  }
});
