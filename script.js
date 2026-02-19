// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.innerHTML = navLinks.classList.contains('open')
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.innerHTML = '<i class="fas fa-bars"></i>';
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stat-card, .service-card, .why-item, .contact-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Phone validation per country
function getMaxDigits() {
  const select = document.getElementById('countryCode');
  return parseInt(select.selectedOptions[0].dataset.max);
}

function enforcePhoneLimit(input) {
  input.value = input.value.replace(/[^0-9]/g, '');
  const max = getMaxDigits();
  if (input.value.length > max) {
    input.value = input.value.slice(0, max);
  }
}

function updatePhoneLimit() {
  const phoneInput = document.getElementById('phoneInput');
  const max = getMaxDigits();
  phoneInput.maxlength = max;
  phoneInput.placeholder = `${max}-digit Phone Number`;
  phoneInput.value = '';
}

// Cookie consent
function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  document.getElementById('cookieBanner').style.display = 'none';
}

function declineCookies() {
  localStorage.setItem('cookieConsent', 'declined');
  document.getElementById('cookieBanner').style.display = 'none';
}

// Check if already responded
window.addEventListener('load', () => {
  const consent = localStorage.getItem('cookieConsent');
  if (consent) {
    document.getElementById('cookieBanner').style.display = 'none';
  }
});

// Page loader
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('pageLoader').classList.add('hidden');
  }, 1500);
});