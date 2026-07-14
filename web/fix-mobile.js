const fs = require('fs');

const files = ['index.html', 'catalog.html', 'settings.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix catalog.html which might have <aside class="relative z-50 w-64...
  content = content.replace('<aside class="relative z-50 w-64 border-r', '<aside id="sidebar" class="w-64 border-r');
  
  // Fix others which might have <aside id="sidebar" class="relative w-64...
  content = content.replace('class="relative w-64 border-r', 'class="w-64 border-r');

  fs.writeFileSync(file, content);
});
console.log("Fixed relative class issue on aside.");
