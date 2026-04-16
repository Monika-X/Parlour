const fs = require('fs');
const path = require('path');

const rootNav = `  <!-- ══ NAVBAR ══════════════════════════════════════════════ -->
  <nav id="navbar">
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <!-- Logo -->
      <a href="__PREFIX__index.html" class="flex items-center gap-3 text-decoration-none">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
          <i class="fa-solid fa-scissors text-dark text-sm"></i>
        </div>
        <span class="font-serif text-2xl gold-text font-semibold tracking-wide">Parlour</span>
      </a>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-8">
        <a href="__PREFIX__index.html" class="nav-link">Home</a>
        <a href="__PREFIX__home-2.html" class="nav-link">Home 2</a>
        <a href="__PAGE_PREFIX__about.html" class="nav-link">About Us</a>
        <a href="__PAGE_PREFIX__services.html" class="nav-link">Services</a>
        <a href="__PAGE_PREFIX__staff.html" class="nav-link">Our Team</a>
        <a href="__PAGE_PREFIX__booking.html" class="nav-link">Book Now</a>
        <a href="__PAGE_PREFIX__contact.html" class="nav-link">Contact</a>
      </div>

      <!-- Auth Buttons -->
      <div class="hidden md:flex items-center gap-3">
        <span id="nav-username" class="text-gold-light text-sm font-medium"></span>
        <a id="nav-login" href="__PAGE_PREFIX__login.html" class="btn-outline py-2 px-5 text-xs">
          <i class="fa-solid fa-user"></i> Login
        </a>
        <button id="nav-logout" class="btn-outline py-2 px-5 text-xs hidden">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
        </button>
        <a href="__PAGE_PREFIX__booking.html" class="btn-gold py-2 px-5 text-xs">
          <i class="fa-solid fa-calendar-check"></i> Book Appointment
        </a>
      </div>

      <!-- Hamburger -->
      <button id="menu-btn" class="md:hidden text-gold-light text-xl p-2">
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>
  </nav>

  <!-- ══ MOBILE MENU ═════════════════════════════════════════ -->
  <div id="mobile-menu">
    <button id="menu-close" class="absolute top-6 right-6 text-gold-light text-2xl">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <a href="__PREFIX__index.html" class="nav-link">Home</a>
    <a href="__PREFIX__home-2.html" class="nav-link">Home 2</a>
    <a href="__PAGE_PREFIX__about.html" class="nav-link">About Us</a>
    <a href="__PAGE_PREFIX__services.html" class="nav-link">Services</a>
    <a href="__PAGE_PREFIX__staff.html" class="nav-link">Our Team</a>
    <a href="__PAGE_PREFIX__booking.html" class="nav-link">Book Now</a>
    <a href="__PAGE_PREFIX__contact.html" class="nav-link">Contact</a>
    <a href="__PAGE_PREFIX__login.html" class="btn-gold mt-4">Login / Register</a>
  </div>`;

const rootFooter = `  <!-- ══ FOOTER ══════════════════════════════════════════════ -->
  <footer class="pt-16 pb-8 border-t border-white/5 mt-auto w-full">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-4 gap-10 mb-12">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <i class="fa-solid fa-scissors text-dark text-sm"></i>
            </div>
            <span class="font-serif text-2xl gold-text font-semibold tracking-wide">Parlour</span>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">
            Where beauty meets luxury. Premium salon and spa services crafted to perfection.
          </p>
          <div class="flex gap-3">
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" class="social-icon hover:text-gold transition-colors"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" class="social-icon hover:text-gold transition-colors"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="https://wa.me/919000000000" target="_blank" rel="noopener noreferrer" class="social-icon hover:text-gold transition-colors"><i class="fa-brands fa-whatsapp"></i></a>
            <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" class="social-icon hover:text-gold transition-colors"><i class="fa-brands fa-youtube"></i></a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Quick Links</h4>
          <ul class="space-y-2">
            <li><a href="__PREFIX__index.html" class="footer-link">Home</a></li>
            <li><a href="__PREFIX__home-2.html" class="footer-link">Home 2</a></li>
            <li><a href="__PAGE_PREFIX__about.html" class="footer-link">About Us</a></li>
            <li><a href="__PAGE_PREFIX__services.html" class="footer-link">Services</a></li>
            <li><a href="__PAGE_PREFIX__staff.html" class="footer-link">Our Team</a></li>
            <li><a href="__PAGE_PREFIX__booking.html" class="footer-link">Book Appointment</a></li>
            <li><a href="__PAGE_PREFIX__contact.html" class="footer-link">Contact Us</a></li>
            <li><a href="__PAGE_PREFIX__login.html" class="footer-link">Login / Register</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Contact</h4>
          <ul class="space-y-3 text-sm text-gray-500">
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-location-dot text-gold mt-1"></i>
              <a href="https://maps.google.com/?q=123+Luxury+Lane,+Mumbai,+Maharashtra+400001" target="_blank" rel="noopener noreferrer" class="footer-link">123 Luxury Lane, Mumbai, Maharashtra 400001</a>
            </li>
            <li class="flex items-center gap-2">
              <i class="fa-solid fa-phone text-gold"></i>
              <a href="tel:+919000000000" class="footer-link">+91 90000 00000</a>
            </li>
            <li class="flex items-center gap-2">
              <i class="fa-solid fa-envelope text-gold"></i>
              <a href="mailto:hello@parlour.com" class="footer-link">hello@parlour.com</a>
            </li>
            <li class="flex items-center gap-2">
              <i class="fa-solid fa-clock text-gold"></i>
              <span>Mon–Sun: 9:00 AM – 8:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600">
        <p>&copy; 2024 Parlour Salon & Spa. All rights reserved.</p>
        <div class="flex gap-4">
          <a href="__PAGE_PREFIX__maintenance.html" class="footer-link">Site Map</a>
          <a href="__PAGE_PREFIX__privacy.html" class="footer-link">Privacy Policy</a>
          <a href="__PAGE_PREFIX__terms.html" class="footer-link">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>`;

function updateFile(filePath, isRoot) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const prefix = isRoot ? '' : '../';
  const pagePrefix = isRoot ? 'pages/' : '';
  
  // Set active class dynamically
  let filename = path.basename(filePath);
  let navWithActive = rootNav.replace(/__PREFIX__/g, prefix).replace(/__PAGE_PREFIX__/g, pagePrefix);
  
  // Clean up any duplicated tags the user might have accidentally left
  content = content.replace(/<!-- ══ NAVBAR ══(?:═)*\s*-->(?:\s*<!-- ══ NAVBAR ══(?:═)*\s*-->)+/g, '<!-- ══ NAVBAR ══════════════════════════════════════════════ -->');
  content = content.replace(/<!-- ══ FOOTER ══(?:═)*\s*-->(?:\s*<!-- ══ FOOTER ══(?:═)*\s*-->)+/g, '<!-- ══ FOOTER ══════════════════════════════════════════════ -->');

  const prevContentLength = content.length;

  const navWithMobileRegex = /<!-- ══ NAVBAR ══════════════════════════════════════════════ -->[\s\S]*?<\/nav>\s*<!-- ══ MOBILE MENU ═════════════════════════════════════════ -->\s*<div id="mobile-menu">[\s\S]*?<\/div>/;
  const oldNavWithMobileRegex = /<nav[^>]*>[\s\S]*?<\/nav>\s*(?:<!--[^>]*-->\s*)?<div id="mobile-menu">[\s\S]*?<\/div>/;
  const navOnlyRegex = /<nav[^>]*>[\s\S]*?<\/nav>/;
  
  if (navWithMobileRegex.test(content)) {
    content = content.replace(navWithMobileRegex, navWithActive);
  } else if (oldNavWithMobileRegex.test(content)) {
    content = content.replace(oldNavWithMobileRegex, navWithActive);
  } else if (navOnlyRegex.test(content)) {
    content = content.replace(navOnlyRegex, navWithActive);
  } else if (filePath.includes('404.html') || filePath.includes('maintenance.html')) {
    content = content.replace(/<body[^>]*>/, match => match + '\\n' + navWithActive);
  }

  const footerRegex = /<!-- ══ FOOTER ══════════════════════════════════════════════ -->[\s\S]*?<\/footer>/;
  const genericFooterRegex = /<footer[^>]*>[\s\S]*?<\/footer>/;
  
  const ftContent = rootFooter.replace(/__PREFIX__/g, prefix).replace(/__PAGE_PREFIX__/g, pagePrefix);

  if(footerRegex.test(content)) {
    content = content.replace(footerRegex, ftContent);
  } else if (genericFooterRegex.test(content)) {
    content = content.replace(genericFooterRegex, ftContent);
  } else {
    if (content.includes('<script')) {
       content = content.replace(/<script/, ftContent + '\\n  <script');
    } else {
       content = content.replace(/<\/body>/, ftContent + '\\n</body>');
    }
  }

  fs.writeFileSync(filePath, content);
  console.log("Updated", filePath);
}

const clientDir = path.join(__dirname, 'client');
const pagesDir = path.join(clientDir, 'pages');

updateFile(path.join(clientDir, 'home-2.html'), true);
updateFile(path.join(clientDir, 'index.html'), true);

const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html') && f !== 'dashboard.html');
pages.forEach(p => {
  updateFile(path.join(pagesDir, p), false);
});
