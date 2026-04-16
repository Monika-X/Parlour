const fs = require('fs');
const path = require('path');

const rootNav = `  <!-- ══ NAVBAR ══════════════════════════════════════════════ -->
  <nav id="navbar">
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <!-- Logo -->
      <a href="../index.html" class="flex items-center gap-3 text-decoration-none">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
          <i class="fa-solid fa-scissors text-dark text-sm"></i>
        </div>
        <span class="font-serif text-2xl gold-text font-semibold tracking-wide">Parlour</span>
      </a>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-8">
        <a href="../index.html" class="nav-link">Home</a>
        <a href="../home-2.html" class="nav-link">Home 2</a>
        <a href="about.html" class="nav-link">About Us</a>
        <a href="services.html" class="nav-link">Services</a>
        <a href="staff.html" class="nav-link">Our Team</a>
        <a href="booking.html" class="nav-link">Book Now</a>
        <a href="contact.html" class="nav-link">Contact</a>
      </div>

      <!-- Auth Buttons -->
      <div class="hidden md:flex items-center gap-3">
        <span id="nav-username" class="text-gold-light text-sm font-medium"></span>
        <a id="nav-login" href="login.html" class="btn-outline py-2 px-5 text-xs">
          <i class="fa-solid fa-user"></i> Login
        </a>
        <button id="nav-logout" class="btn-outline py-2 px-5 text-xs hidden">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
        </button>
        <a href="booking.html" class="btn-gold py-2 px-5 text-xs">
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
    <a href="../index.html" class="nav-link">Home</a>
    <a href="../home-2.html" class="nav-link">Home 2</a>
    <a href="about.html" class="nav-link">About Us</a>
    <a href="services.html" class="nav-link">Services</a>
    <a href="staff.html" class="nav-link">Our Team</a>
    <a href="booking.html" class="nav-link">Book Now</a>
    <a href="contact.html" class="nav-link">Contact</a>
    <a href="login.html" class="btn-gold mt-4">Login / Register</a>
  </div>`;

const rootFooter = `  <!-- ══ FOOTER ══════════════════════════════════════════════ -->
  <footer class="pt-16 pb-8 border-t border-white/5 mt-auto w-full relative z-20 bg-dark">
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
            <li><a href="../index.html" class="footer-link">Home</a></li>
            <li><a href="../home-2.html" class="footer-link">Home 2</a></li>
            <li><a href="about.html" class="footer-link">About Us</a></li>
            <li><a href="services.html" class="footer-link">Services</a></li>
            <li><a href="staff.html" class="footer-link">Our Team</a></li>
            <li><a href="booking.html" class="footer-link">Book Appointment</a></li>
            <li><a href="contact.html" class="footer-link">Contact Us</a></li>
            <li><a href="login.html" class="footer-link">Login / Register</a></li>
            <li><a href="maintenance.html" class="footer-link">Maintenance Page</a></li>
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
          <a href="#" class="footer-link">Site Map</a>
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>`;

const baseTemplate = (title, mainContent, scriptsContent) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} – Parlour Salon & Spa</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            gold: { DEFAULT: '#c9a05a', light: '#e8c98a', dark: '#a07a38' },
            rose: { DEFAULT: '#d4829a' },
            dark: { DEFAULT: '#0f0d1a', 2: '#1a1626', 3: '#241f35', 4: '#2e2845' }
          },
          fontFamily: {
            serif: ['"Cormorant Garamond"', 'serif'],
            sans: ['Inter', 'sans-serif']
          }
        }
      }
    };
  </script>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body class="bg-dark text-gray-100 flex flex-col min-h-screen relative overflow-x-hidden">
${rootNav}

  <!-- BACKGROUND ORBS -->
  <div class="fixed inset-0 pointer-events-none z-0">
    <div class="orb w-96 h-96 bg-gold/10 top-0 -left-20"></div>
    <div class="orb w-72 h-72 bg-rose/10 bottom-0 right-0" style="animation-delay:4s"></div>
  </div>

  <main class="flex-1 flex flex-col justify-center relative z-10 w-full pt-20 pb-16">
${mainContent}
  </main>

${rootFooter}

  <script src="../assets/js/api.js"></script>
  <script src="../assets/js/main.js"></script>
${scriptsContent || ''}
</body>
</html>`;

const maintenanceHtml = baseTemplate('Under Maintenance', `
    <div class="max-w-7xl mx-auto px-6 w-full">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Side: Text Content -->
        <div class="reveal">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mb-8 shadow-lg shadow-gold/20">
            <i class="fa-solid fa-scissors text-dark text-2xl"></i>
          </div>
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 text-gold-light text-xs font-medium tracking-widest uppercase mb-6">
            <span class="w-2 h-2 rounded-full bg-gold animate-pulse"></span> App Upgrade
          </div>
          <h1 class="font-serif text-5xl md:text-6xl text-white leading-tight mb-6">
            We're adding a little <span class="gold-text">extra shine</span>
          </h1>
          <p class="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
            Parlour is currently undergoing scheduled maintenance to improve your boutique booking experience. We'll be back online looking sharper than ever before.
          </p>
          <div class="glass-card p-6 inline-block">
            <h3 class="text-white font-medium mb-2 w-full"><i class="fa-solid fa-phone text-gold mr-2"></i> Need urgent assistance?</h3>
            <p class="text-gray-400 text-sm">Call us straight away at <a href="tel:+919000000000" class="text-gold-light hover:underline">+91 90000 00000</a></p>
          </div>
        </div>

        <!-- Right Side: Vector Image & Countdown -->
        <div class="reveal flex flex-col items-center lg:items-end" style="transition-delay:0.2s">
          <!-- Vector Image -->
          <div class="w-full max-w-md relative mb-8">
            <img src="../assets/images/maintenance.png" alt="Stylist chair under maintenance" class="w-full h-auto drop-shadow-[0_0_30px_rgba(201,160,90,0.15)] rounded-2xl" />
          </div>

          <!-- Countdown Timer -->
          <div class="glass-card p-6 w-full max-w-md backdrop-blur-md bg-dark-2/60 border border-white/10">
            <h3 class="text-center font-serif text-xl text-gold-light mb-4">Estimated Return</h3>
            <div class="grid grid-cols-4 gap-4 text-center" id="countdown">
              <div>
                <div class="text-3xl font-serif text-white mb-1" id="cd-hours">02</div>
                <div class="text-[10px] text-gray-500 uppercase tracking-widest">Hours</div>
              </div>
              <div>
                <div class="text-3xl font-serif text-white mb-1" id="cd-minutes">45</div>
                <div class="text-[10px] text-gray-500 uppercase tracking-widest">Minutes</div>
              </div>
              <div>
                <div class="text-3xl font-serif text-white mb-1" id="cd-seconds">12</div>
                <div class="text-[10px] text-gray-500 uppercase tracking-widest">Seconds</div>
              </div>
              <div>
                <div class="text-3xl font-serif text-gold mb-1"><i class="fa-solid fa-clock"></i></div>
                <div class="text-[10px] text-gray-500 uppercase tracking-widest">Wait</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`, `
  <script>
    let totalSeconds = (2 * 3600) + (45 * 60) + 12;
    setInterval(() => {
      if(totalSeconds > 0) totalSeconds--;
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
      document.getElementById('cd-minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('cd-seconds').textContent = String(s).padStart(2, '0');
    }, 1000);
  </script>
`);

const p404Html = baseTemplate('Page Not Found', `
    <div class="max-w-2xl mx-auto px-6 text-center">
      <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mb-6">
        <i class="fa-solid fa-scissors text-dark text-3xl"></i>
      </div>
      <h1 class="font-serif text-8xl md:text-9xl text-white mb-2 font-bold opacity-80">404</h1>
      <h2 class="font-serif text-3xl md:text-4xl text-gold-light mb-4">Page Not Found</h2>
      <p class="text-gray-400 mb-8 max-w-md mx-auto relative z-10">
        The beautifully styled page you are looking for seems to have been clipped away. Let's get you back to the salon.
      </p>
      <a href="../index.html" class="btn-gold inline-flex items-center px-8 py-3 relative z-10">
        <i class="fa-solid fa-arrow-left mr-2"></i> Return to Homepage
      </a>
    </div>`);


const loginHtml = baseTemplate('Login / Register', `
    <!-- AUTH CARD -->
    <div class="flex items-center justify-center px-6 w-full">
      <div class="w-full max-w-md">
        <!-- TABS -->
        <div class="flex glass-card p-1 rounded-2xl mb-6">
          <button id="tab-login" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-br from-gold to-gold-dark text-dark">Login</button>
          <button id="tab-register" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-400 hover:text-gold-light">Register</button>
        </div>

        <!-- LOGIN FORM -->
        <div id="form-login" class="glass-card p-8">
          <div class="text-center mb-6">
            <div class="text-4xl mb-2">🌸</div>
            <h2 class="font-serif text-3xl text-white">Welcome Back</h2>
            <p class="text-gray-400 text-sm mt-1">Sign in to your Parlour account</p>
          </div>
          <form id="login-form" class="space-y-4">
            <div>
              <label class="form-label">Email Address</label>
              <div class="relative">
                <i class="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                <input id="l-email" type="email" class="form-input pl-9" placeholder="you@example.com" required/>
              </div>
            </div>
            <div>
              <label class="form-label">Password</label>
              <div class="relative">
                <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                <input id="l-password" type="password" class="form-input pl-9 pr-10" placeholder="••••••••" required/>
                <button type="button" id="toggle-lpass" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-light text-sm"><i class="fa-solid fa-eye"></i></button>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <label class="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" class="w-3.5 h-3.5 accent-gold"/> Remember me
              </label>
              <button type="button" class="text-gold-light hover:text-gold transition-colors">Forgot Password?</button>
            </div>
            <button type="submit" id="login-btn" class="btn-gold w-full justify-center py-3">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
            </button>
          </form>
          <div class="mt-4 text-center text-xs text-gray-500">
            Demo admin: <span class="text-gold-light">admin@parlour.com</span> / <span class="text-gold-light">Admin@123</span>
          </div>
        </div>

        <!-- REGISTER FORM -->
        <div id="form-register" class="glass-card p-8 hidden">
          <div class="text-center mb-6">
            <div class="text-4xl mb-2">✨</div>
            <h2 class="font-serif text-3xl text-white">Create Account</h2>
            <p class="text-gray-400 text-sm mt-1">Join Parlour to book your first appointment</p>
          </div>
          <form id="register-form" class="space-y-4">
            <div>
              <label class="form-label">Full Name</label>
              <div class="relative">
                <i class="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                <input id="r-name" type="text" class="form-input pl-9" placeholder="Priya Sharma" required/>
              </div>
            </div>
            <div>
              <label class="form-label">Email Address</label>
              <div class="relative">
                <i class="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                <input id="r-email" type="email" class="form-input pl-9" placeholder="priya@example.com" required/>
              </div>
            </div>
            <div>
              <label class="form-label">Phone Number</label>
              <div class="relative">
                <i class="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                <input id="r-phone" type="tel" class="form-input pl-9" placeholder="+91 98765 43210"/>
              </div>
            </div>
            <div>
              <label class="form-label">Password</label>
              <div class="relative">
                <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                <input id="r-password" type="password" class="form-input pl-9 pr-10" placeholder="Min. 6 characters" required minlength="6"/>
                <button type="button" id="toggle-rpass" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-light text-sm"><i class="fa-solid fa-eye"></i></button>
              </div>
            </div>
            <div id="pwd-strength" class="hidden">
              <div class="h-1.5 bg-dark-3 rounded-full overflow-hidden">
                <div id="strength-bar" class="h-full rounded-full transition-all duration-500" style="width:0%"></div>
              </div>
              <div id="strength-label" class="text-xs text-gray-500 mt-1"></div>
            </div>
            <div class="flex items-start gap-2 text-xs text-gray-400">
              <input id="terms" type="checkbox" class="mt-0.5 w-3.5 h-3.5 accent-gold flex-shrink-0" required/>
              <label for="terms">I agree to the <a href="#" class="text-gold-light underline">Terms of Service</a> and <a href="#" class="text-gold-light underline">Privacy Policy</a></label>
            </div>
            <button type="submit" id="register-btn" class="btn-gold w-full justify-center py-3">
              <i class="fa-solid fa-user-plus"></i> Create Account
            </button>
          </form>
        </div>

        <p class="text-center text-gray-600 text-xs mt-4">
          Protected with 256-bit SSL encryption <i class="fa-solid fa-shield-halved text-gold/50 ml-1"></i>
        </p>
      </div>
    </div>`, `
  <script>
    // ── Tabs ──────────────────────────────────────────────────
    const tabLogin    = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin   = document.getElementById('form-login');
    const formReg     = document.getElementById('form-register');

    function switchTab(mode) {
      const isLogin = mode === 'login';
      formLogin.classList.toggle('hidden', !isLogin);
      formReg.classList.toggle('hidden',   isLogin);
      tabLogin.className    = \`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all \${isLogin    ? 'bg-gradient-to-br from-gold to-gold-dark text-dark' : 'text-gray-400 hover:text-gold-light'}\`;
      tabRegister.className = \`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all \${!isLogin   ? 'bg-gradient-to-br from-gold to-gold-dark text-dark' : 'text-gray-400 hover:text-gold-light'}\`;
    }
    tabLogin.addEventListener('click',    () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

    // ── Password Toggle ───────────────────────────────────────
    function setupToggle(btnId, inputId) {
      document.getElementById(btnId).addEventListener('click', () => {
        const inp = document.getElementById(inputId);
        const icon = document.getElementById(btnId).querySelector('i');
        inp.type = inp.type === 'password' ? 'text' : 'password';
        icon.className = inp.type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
      });
    }
    setupToggle('toggle-lpass', 'l-password');
    setupToggle('toggle-rpass', 'r-password');

    // ── Password Strength ─────────────────────────────────────
    document.getElementById('r-password').addEventListener('input', function() {
      const v = this.value;
      const bar   = document.getElementById('strength-bar');
      const label = document.getElementById('strength-label');
      document.getElementById('pwd-strength').classList.toggle('hidden', !v);
      let score = 0;
      if (v.length >= 6)  score++;
      if (v.length >= 10) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const levels = [
        { w:'20%',  color:'#ef4444', text:'Very Weak' },
        { w:'40%',  color:'#f97316', text:'Weak' },
        { w:'60%',  color:'#eab308', text:'Fair' },
        { w:'80%',  color:'#22c55e', text:'Strong' },
        { w:'100%', color:'#10b981', text:'Very Strong' },
      ];
      const l = levels[Math.min(score, 4)];
      bar.style.width = l.w; bar.style.background = l.color;
      label.textContent = l.text; label.style.color = l.color;
    });

    // ── Login ─────────────────────────────────────────────────
    document.getElementById('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      btn.innerHTML = '<span class="loader"></span> Signing in…'; btn.disabled = true;
      try {
        const emailStr = document.getElementById('l-email').value;
        const data = await api.auth.login({ email: emailStr, password: document.getElementById('l-password').value });
        
        if (emailStr === 'admin@parlour.com' || data.user.email === 'admin@parlour.com' || data.user.role === 'admin') {
          data.user.role = 'admin';
        } else {
          data.user.role = 'user';
        }

        localStorage.setItem('token', data.token);
        api.setToken(data.token);
        api.setUser(data.user);
        showToast(\`Welcome back, \${data.user.name.split(' ')[0]}! 🌸\`, 'success');
        setTimeout(() => {
          window.location.href = data.user.role === 'admin' ? 'dashboard.html' : 'user-dashboard.html';
        }, 1200);
      } catch(err) {
        showToast(err.message, 'error');
        btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In'; btn.disabled = false;
      }
    });

    // ── Register ──────────────────────────────────────────────
    document.getElementById('register-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('register-btn');
      btn.innerHTML = '<span class="loader"></span> Creating account…'; btn.disabled = true;
      try {
        const emailStr = document.getElementById('r-email').value;
        const data = await api.auth.register({
          name: document.getElementById('r-name').value,
          email: emailStr,
          phone: document.getElementById('r-phone').value,
          password: document.getElementById('r-password').value,
        });

        if (emailStr === 'admin@parlour.com' || data.user.email === 'admin@parlour.com' || data.user.role === 'admin') {
          data.user.role = 'admin';
        } else {
          data.user.role = 'user';
        }

        localStorage.setItem('token', data.token);
        api.setToken(data.token);
        api.setUser(data.user);
        showToast('Account created successfully! Welcome 🌸', 'success');
        setTimeout(() => {
          window.location.href = data.user.role === 'admin' ? 'dashboard.html' : 'user-dashboard.html';
        }, 1200);
      } catch(err) {
        showToast(err.message, 'error');
        btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account'; btn.disabled = false;
      }
    });

    // Redirect if already logged in
    if (api.isLoggedIn()) {
      const user = api.getUser();
      if (user?.role === 'admin' || user?.email === 'admin@parlour.com') window.location.href = 'dashboard.html';
      else window.location.href = 'user-dashboard.html';
    }
  </script>
`);

const clientDir = path.join(__dirname, 'client');
fs.writeFileSync(path.join(clientDir, 'pages', 'maintenance.html'), maintenanceHtml);
fs.writeFileSync(path.join(clientDir, 'pages', '404.html'), p404Html);
fs.writeFileSync(path.join(clientDir, 'pages', 'login.html'), loginHtml);

console.log("Re-wrote 404, maintenance, and login HTML to fix layouts properly.");
