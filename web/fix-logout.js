const fs = require('fs');
const files = ['index.html', 'catalog.html', 'settings.html'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix logout button alignment to match nav links when expanded
  content = content.replace('justify-center gap-2 px-4 py-3 bg-red-500/10', 'gap-3 px-4 py-3 bg-red-500/10');

  fs.writeFileSync(file, content);
});
console.log("Logout button alignment fixed.");
