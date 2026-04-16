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
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Identify if it has a mobile menu
    if (content.includes('id="mobile-menu"')) {
      console.log('Fixing mobile menu in:', filePath);
      
      const isPagesDir = filePath.includes(path.sep + 'pages' + path.sep);
      const loginPath = isPagesDir ? 'login.html' : 'pages/login.html';
      const profilePath = isPagesDir ? 'user-dashboard.html' : 'pages/user-dashboard.html';
      
      // Replace the old login link with a dynamic structure
      const oldLoginRegex = /<a href="[^"]*login\.html" class="btn-gold mt-4">Login \/ Register<\/a>/;
      
      const newMobiles = `
    <div id="nav-auth-mob" class="flex flex-col items-center gap-3 w-full px-10">
      <a id="nav-login-mob" href="${loginPath}" class="btn-gold w-full justify-center">Login / Register</a>
      <div id="nav-user-mob" class="hidden flex flex-col items-center gap-3 w-full">
        <a id="nav-username-mob" href="${profilePath}" class="nav-link !text-gold-light">My Account</a>
        <button id="nav-logout-mob" class="text-rose text-sm font-medium uppercase tracking-widest mt-2">Logout</button>
      </div>
    </div>`;
      
      let newContent = content.replace(oldLoginRegex, newMobiles);
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated mobile menu in:', filePath);
      }
    }
  }
});
