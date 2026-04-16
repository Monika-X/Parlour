const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const clientDir = path.join(__dirname, '..', 'client');

walkDir(clientDir, (filePath) => {
  if (filePath.endsWith('.html')) {
    console.log('Processing:', filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace max-w-7xl with max-w-[1600px]
    // Also check for px-6 and maybe increase it for wider look?
    let newContent = content.replace(/max-w-\[1600px\]/g, 'max-w-[1850px]');
    newContent = newContent.replace(/px-6/g, 'px-5 md:px-10');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
