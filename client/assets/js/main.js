/* =============================================
   main.js – Global utilities & navbar behaviour
   ============================================= */

// ── Page Loader ──────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
  // Trigger reveal animations
  initReveal();
});

// ── Navbar scroll effect ─────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Logo scroll to top if on home
  const logo = navbar.querySelector('a[href*="index.html"]');
  logo?.addEventListener('click', (e) => {
    const isCurrentlyHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || !window.location.pathname.includes('.html');
    if (isCurrentlyHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// ── Mobile menu ──────────────────────────────
const menuBtn   = document.getElementById('menu-btn');
const menuClose = document.getElementById('menu-close');
const mobileMenu= document.getElementById('mobile-menu');

if (menuBtn)   menuBtn.addEventListener('click',   () => mobileMenu.classList.add('open'));
if (menuClose) menuClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    const isHomeLink = href === 'index.html' || href === './' || href === '../index.html';
    const isCurrentlyHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || !window.location.pathname.includes('.html');

    if (isHomeLink && isCurrentlyHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setTimeout(() => mobileMenu.classList.remove('open'), 150);
  });
});

// ── Auth nav state ────────────────────────────
function updateAuthNav() {
  const user  = api?.getUser?.();
  const login = document.getElementById('nav-login');
  const logout= document.getElementById('nav-logout');
  const name  = document.getElementById('nav-username');
  
  // Mobile elements
  const loginMob = document.getElementById('nav-login-mob');
  const userMob  = document.getElementById('nav-user-mob');
  const nameMob  = document.getElementById('nav-username-mob');

  if (user) {
    login?.classList.add('hidden');
    loginMob?.classList.add('hidden');
    logout?.classList.remove('hidden');
    userMob?.classList.remove('hidden');

    const isPagesDir = window.location.pathname.includes('/pages/');
    const link = isPagesDir ? 'user-dashboard.html' : 'pages/user-dashboard.html';
    
    if (name) {
      name.innerHTML = `<a href="${link}" class="hover:text-white transition-colors cursor-pointer flex items-center gap-2" title="My Profile"><i class="fa-solid fa-user-circle text-lg"></i> <span class="hidden md:inline">${user.name.split(' ')[0]}</span></a>`;
    }
    if (nameMob) {
      nameMob.textContent = `My Account (${user.name.split(' ')[0]})`;
      nameMob.href = link;
    }
  } else {
    login?.classList.remove('hidden');
    loginMob?.classList.remove('hidden');
    logout?.classList.add('hidden');
    userMob?.classList.add('hidden');
  }
}
document.addEventListener('DOMContentLoaded', updateAuthNav);

const handleLogout = () => {
  api.clearToken();
  showToast('Logged out successfully.', 'info');
  const isPagesDir = window.location.pathname.includes('/pages/');
  setTimeout(() => window.location.href = isPagesDir ? 'login.html' : 'pages/login.html', 900);
};

document.getElementById('nav-logout')?.addEventListener('click', handleLogout);
document.getElementById('nav-logout-mob')?.addEventListener('click', handleLogout);

// ── Toast Notifications ───────────────────────
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  toast.addEventListener('click', () => toast.remove());
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(60px)'; toast.style.transition = '0.4s'; setTimeout(() => toast.remove(), 400); }, duration);
}
window.showToast = showToast;

// ── Scroll Reveal ─────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Animated Counters ─────────────────────────
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const tick = () => {
    start += step;
    if (start < target) { el.textContent = Math.floor(start).toLocaleString(); requestAnimationFrame(tick); }
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(tick);
}
window.animateCounter = animateCounter;

// ── Particle generator ────────────────────────
function createParticles(containerId, count = 20) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 1;
    p.className = 'particle';
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 20}%;
      opacity: ${Math.random() * 0.6 + 0.1};
      animation-duration: ${Math.random() * 8 + 6}s;
      animation-delay: ${Math.random() * 5}s;
    `;
    container.appendChild(p);
  }
}
window.createParticles = createParticles;

// ── Format currency (INR) ─────────────────────
function formatPrice(v) {
  return '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}
window.formatPrice = formatPrice;

// ── Format date ───────────────────────────────
function formatDate(d) {
  if (typeof d === 'string' && d.length >= 10 && d.includes('-')) {
    const [y, m, day] = d.substring(0, 10).split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
  }
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
window.formatDate = formatDate;

// ── Status badge helper ───────────────────────
function statusBadge(status) {
  const map = {
    pending:     'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    confirmed:   'bg-blue-500/20   text-blue-300   border border-blue-500/30',
    in_progress: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    completed:   'bg-green-500/20  text-green-300  border border-green-500/30',
    cancelled:   'bg-red-500/20    text-red-300    border border-red-500/30',
    no_show:     'bg-gray-500/20   text-gray-300   border border-gray-500/30',
  };
  return `<span class="px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || ''}">${status.replace('_',' ')}</span>`;
}
window.statusBadge = statusBadge;

// ── Active Nav Link Highlighter ──────────────
function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const fileName = currentPath.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const hrefFileName = href.split('/').pop();
    if (fileName === hrefFileName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
document.addEventListener('DOMContentLoaded', highlightActiveLink);
