import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  // Authentication Guard
  onAuthStateChanged(auth, (user) => {
    if (!user && window.location.pathname !== '/login.html') {
      window.location.href = '/login.html';
    }
  });

  // Logout Handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.href = '/login.html';
    });
  }

  // Mobile Sidebar Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileCloseBtn = document.getElementById('mobile-close-btn');
  const sidebar = document.querySelector('aside');
  const mobileBackdrop = document.getElementById('mobile-backdrop');

  const toggleSidebar = () => {
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (mobileBackdrop) mobileBackdrop.classList.toggle('hidden');
  };

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', toggleSidebar);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', toggleSidebar);

  // Desktop Sidebar Collapse Toggle
  const desktopMenuBtn = document.getElementById('desktop-menu-btn');
  const checkSidebarState = () => {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      if (sidebar) sidebar.classList.add('collapsed');
    }
  };
  
  checkSidebarState();

  if (desktopMenuBtn) {
    desktopMenuBtn.addEventListener('click', () => {
      if (!sidebar) return;
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
  }

  // Dashboard specific logic
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const catalogsEl = document.getElementById('stat-catalogs');
    
    // Realtime listener for catalogs
    const qCatalogs = collection(db, 'asset_catalogs');
    const unsub = onSnapshot(qCatalogs, (snapshot) => {
      if (catalogsEl) {
        catalogsEl.innerText = snapshot.size;
      }
    }, (error) => {
      console.error("Gagal mengambil data katalog:", error);
    });
  }
});
