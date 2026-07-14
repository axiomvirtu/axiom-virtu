const fs = require('fs');

const files = ['index.html', 'catalog.html', 'settings.html'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove overflow-hidden from body so native scroll works
  content = content.replace(/<body([^>]*)overflow-hidden([^>]*)>/g, '<body$1$2>');
  // clean up multiple spaces
  content = content.replace(/<body([^>]+)>/, (match) => match.replace(/\s+/g, ' '));

  // 2. Fix main classes (remove strict heights and local scrolling)
  content = content.replace(/<main([^>]+)>/, (match, p1) => {
      let newClasses = p1.replace(/overflow-y-auto/g, '')
                         .replace(/h-\[calc\(100vh-73px\)\]/g, '')
                         .replace(/md:h-screen/g, '')
                         .replace(/overflow-hidden/g, '')
                         .replace(/\s+/g, ' ');
      return `<main${newClasses}>`;
  });

  // 3. Fix aside classes to use sticky on desktop
  content = content.replace(/<aside id="sidebar" class="([^"]+)"/, (match, classes) => {
      let newClasses = classes.replace(/md:relative/g, 'md:sticky md:top-0 md:h-screen flex-shrink-0');
      // Ensure we don't have multiple flex-shrink-0
      newClasses = newClasses.replace(/flex-shrink-0\s+flex-shrink-0/g, 'flex-shrink-0');
      return `<aside id="sidebar" class="${newClasses}"`;
  });
  
  // 4. Move modal out of main so z-index works properly, and add max-height
  if (file === 'catalog.html') {
      const modalRegex = /(<div id="modal-overlay"[\s\S]*?<!-- Modal Content -->[\s\S]*?<\/form>\s*<\/div>\s*<\/div>)/;
      const modalMatch = content.match(modalRegex);
      if (modalMatch) {
          content = content.replace(modalMatch[1], ''); // remove from original place
          
          let modalHTML = modalMatch[1];
          // Make modal content scrollable if it exceeds screen height
          modalHTML = modalHTML.replace('class="bg-[#121215] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"', 'class="bg-[#121215] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"');
          
          // Inject before script tags or body closing
          content = content.replace('    <script type="module" src="/src/js/catalog.js"></script>', `${modalHTML}\n    <script type="module" src="/src/js/catalog.js"></script>`);
      }
  }

  fs.writeFileSync(file, content);
});
console.log("Scroll and modal issues fixed.");
