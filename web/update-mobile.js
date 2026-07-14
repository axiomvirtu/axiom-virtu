const fs = require('fs');

const files = ['index.html', 'catalog.html', 'settings.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // If already modified, skip
  if (content.includes('id="mobile-menu-btn"')) return;

  // 1. Replace wrapper
  content = content.replace('<div class="flex min-h-screen">', `<div class="flex flex-col md:flex-row min-h-screen">
      <!-- Mobile Top Navbar -->
      <div class="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-40 w-full">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Axiom Admin</h1>
        </div>
        <button id="mobile-menu-btn" class="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <!-- Mobile Backdrop -->
      <div id="mobile-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden md:hidden transition-opacity"></div>`);

  // 2. Replace aside classes
  content = content.replace('w-64 border-r border-gray-200 dark:border-white/5 bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-3xl transition-transform duration-300 hidden md:flex flex-col', 'w-64 border-r border-gray-200 dark:border-white/5 bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-3xl transition-transform duration-300 fixed inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 z-50 flex flex-col h-full');

  // 3. Add close button in sidebar
  content = content.replace(
    '<h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Axiom Admin</h1>\n        </div>',
    `<h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 flex-1">Axiom Admin</h1>
          <button id="mobile-close-btn" class="md:hidden p-2 text-gray-500 hover:text-white">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>`
  );
  
  // 4. Make main scrollable on mobile
  content = content.replace('<main class="flex-1 flex flex-col relative z-10 w-full overflow-hidden p-8">', '<main class="flex-1 flex flex-col relative z-10 w-full overflow-y-auto p-4 md:p-8 h-[calc(100vh-73px)] md:h-screen">');

  fs.writeFileSync(file, content);
});
console.log("HTML files updated for mobile responsiveness.");
