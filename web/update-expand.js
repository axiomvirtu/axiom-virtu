const fs = require('fs');

const files = ['index.html', 'catalog.html', 'settings.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already has expand button
  if (content.includes('desktop-menu-btn')) return;

  // Add sidebar-header class to the logo container
  content = content.replace('<div class="p-8 flex items-center gap-3">', '<div class="sidebar-header p-8 flex items-center gap-3 relative">');

  // Add the desktop toggle button inside the sidebar header
  content = content.replace('<h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 flex-1">Axiom Admin</h1>', 
    `<h1 class="sidebar-text text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 flex-1 whitespace-nowrap">Axiom Admin</h1>
          <button id="desktop-menu-btn" class="hidden md:flex absolute -right-3 top-8 bg-gray-100 dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-full p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white z-50 transition-transform">
            <svg class="w-4 h-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>`
  );

  // Add sidebar-text to all navigation spans
  content = content.replace(/<span class="font-medium text-sm">/g, '<span class="sidebar-text font-medium text-sm whitespace-nowrap">');

  // Add SVG to logout button and sidebar-text class to its text
  content = content.replace('Logout\n          </button>', 
    `<svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="sidebar-text whitespace-nowrap">Logout</span>
          </button>`
  );

  // Add relative positioning to aside so the absolute button works
  content = content.replace('<aside id="sidebar" class="w-64 border-r', '<aside id="sidebar" class="relative w-64 border-r');

  fs.writeFileSync(file, content);
});
console.log("HTML files updated for sidebar expand/collapse.");
