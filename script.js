const progressBar = document.getElementById("progress-bar");
const navbar = document.getElementById("navbar");
const pageLoader = document.getElementById("pageLoader");
const cookieBanner = document.getElementById("cookieBanner");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

function isPinchZoom(event) {
  if (typeof event.scale === "number") {
    return event.scale !== 1;
  }

  return Boolean(event.touches && event.touches.length > 1);
}

// Only block pinch gestures. Preventing every touchmove can suppress
// taps on mobile, which makes the menu button feel unresponsive.
document.addEventListener("touchmove", (event) => {
  if (isPinchZoom(event)) {
    event.preventDefault();
  }
}, { passive: false });

// Optimize scroll performance on mobile
let lastScrollY = 0;
let ticking = false;

function updateScrollState() {
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  }

  if (progressBar) {
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const scrolled = (window.scrollY / maxScroll) * 100;
    progressBar.style.width = `${scrolled}%`;
  }
}

function updateCookieBannerState() {
  if (!cookieBanner) return;
  const isHidden = window.getComputedStyle(cookieBanner).display === "none";
  document.body.classList.toggle("cookie-visible", !isHidden);
}

function onScroll() {
  lastScrollY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(updateScrollState);
    ticking = true;
  }
  ticking = false;
}

window.addEventListener("scroll", onScroll, { passive: true });


window.addEventListener("load", () => {
  const consent = localStorage.getItem("cookieConsent");
  if (consent && cookieBanner) {
    cookieBanner.style.display = "none";
  }

  if (pageLoader) {
    setTimeout(() => {
      pageLoader.classList.add("hidden");
    }, 1600);
  }

  updateScrollState();
  updateCookieBannerState();
});

function setMenuState(isOpen) {
  if (!navLinks || !hamburger) return;

  navLinks.classList.toggle("open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  hamburger.innerHTML = isOpen
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
}

if (hamburger) {
  hamburger.type = "button";
  hamburger.setAttribute("aria-controls", "navLinks");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-label", "Open menu");
}

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    setMenuState(!navLinks.classList.contains("open"));
  });
}

function closeMenu() {
  setMenuState(false);
}

// Close menu on link click (mobile optimization)
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Close menu when clicking outside (mobile optimization)
document.addEventListener("click", (event) => {
  if (navLinks && navLinks.classList.contains("open")) {
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
      closeMenu();
    }
  }
});

window.closeMenu = closeMenu;

function acceptCookies() {
  localStorage.setItem("cookieConsent", "accepted");
  if (cookieBanner) cookieBanner.style.display = "none";
  updateCookieBannerState();
}

function declineCookies() {
  localStorage.setItem("cookieConsent", "declined");
  if (cookieBanner) cookieBanner.style.display = "none";
  updateCookieBannerState();
}

window.acceptCookies = acceptCookies;
window.declineCookies = declineCookies;

function getMaxDigits() {
  const select = document.getElementById("countryCode");
  if (!select) return 10;
  return parseInt(select.selectedOptions[0].dataset.max, 10);
}

function enforcePhoneLimit(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
  const max = getMaxDigits();
  if (input.value.length > max) {
    input.value = input.value.slice(0, max);
  }
}

function updatePhoneLimit() {
  const phoneInput = document.getElementById("phoneInput");
  if (!phoneInput) return;
  const max = getMaxDigits();
  phoneInput.maxLength = max;
  phoneInput.placeholder = `${max}-digit Phone Number`;
  phoneInput.value = "";
}

window.enforcePhoneLimit = enforcePhoneLimit;
window.updatePhoneLimit = updatePhoneLimit;

const careerRoleSelect = document.querySelector("[data-career-role]");
const careerSubjectInput = document.querySelector("[data-career-subject]");

function syncCareerSubject(role = "") {
  if (!careerSubjectInput) return;
  careerSubjectInput.value = role
    ? `Equilynx Career Application - ${role}`
    : "Equilynx Career Application";
}

function setCareerRole(role) {
  if (!careerRoleSelect) return;
  careerRoleSelect.value = role;
  careerRoleSelect.dispatchEvent(new Event("change"));
}

window.setCareerRole = setCareerRole;

if (careerRoleSelect) {
  syncCareerSubject(careerRoleSelect.value);
  careerRoleSelect.addEventListener("change", () => {
    syncCareerSubject(careerRoleSelect.value);
  });
}

document.querySelectorAll('form[action*="formspree.io"]').forEach((form) => {
  form.addEventListener("submit", () => {
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!submitButton || submitButton.disabled) return;

    form.classList.add("is-submitting");
    submitButton.disabled = true;

    if (submitButton.tagName === "BUTTON") {
      submitButton.dataset.originalLabel = submitButton.textContent;
      submitButton.textContent = "Submitting...";
    } else {
      submitButton.dataset.originalLabel = submitButton.value;
      submitButton.value = "Submitting...";
    }
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (event) {
    const href = this.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

const revealTargets = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
if (revealTargets.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.08 });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

let countersRan = false;
const statsRow = document.querySelector(".stats-row");

function jumpCounter(el, target) {
  if (!el) return;
  const jumps = [0, 500, 1000, 1500, 1800, 2000, 2020, 2024, target];
  let index = 0;

  function next() {
    if (index >= jumps.length) return;
    el.textContent = jumps[index];
    index += 1;
    setTimeout(next, index < 6 ? 80 : 120);
  }

  next();
}

function smoothCounter(el, target, suffix = "") {
  if (!el) return;
  let value = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    value += step;
    if (value >= target) {
      el.textContent = `${target}${suffix}`;
      clearInterval(timer);
      return;
    }
    el.textContent = `${Math.floor(value)}${suffix}`;
  }, 20);
}

if (statsRow) {
  const counterObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || countersRan) return;
    countersRan = true;
    jumpCounter(document.getElementById("counter-founded"), 2025);
    smoothCounter(document.getElementById("counter-directors"), 2);
    smoothCounter(document.getElementById("counter-employees"), 25, "+");
  }, { threshold: 0.3 });

  counterObserver.observe(statsRow);
}

document.querySelectorAll(".service-card").forEach((card) => {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  
  if (!isMobile) {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      card.style.transform =
        `perspective(700px) rotateX(${((y - cy) / cy) * -7}deg) rotateY(${((x - cx) / cx) * 7}deg) translateY(-5px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
      card.style.transition = "transform 0.4s ease";
    });

    card.addEventListener("mouseenter", () => {
      card.style.transition = "transform 0.1s ease";
    });
  } else {
    // Mobile: Simple tap animation
    card.addEventListener("touchstart", () => {
      card.style.transform = "scale(0.98)";
      card.style.transition = "transform 0.2s ease";
    });
    
    card.addEventListener("touchend", () => {
      card.style.transform = "scale(1)";
    });
  }
});

function initHeroAnimation() {
  const canvas = document.getElementById("hero-canvas");
  const heroTitle = document.getElementById("heroTitle");
  const heroLine = document.getElementById("heroLine");
  const heroButtons = document.getElementById("heroBtns");
  const typingElement = document.getElementById("typingText");

  if (!canvas || !heroTitle || !heroLine || !heroButtons || !typingElement) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Ensure the hero canvas remains visible on smaller screens and mobile
  canvas.style.display = "block";

  function width() {
    return canvas.width;
  }

  function height() {
    return canvas.height;
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  let stars = [];
  let phase = "float";
  let frame = 0;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function makeStars() {
    stars = [];
    for (let i = 0; i < 160; i += 1) {
      stars.push({
        x: Math.random() * width(),
        y: Math.random() * height(),
        ox: 0,
        oy: 0,
        tx: 0,
        ty: 0,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.3 + 0.3,
        op: Math.random() * 0.5 + 0.2,
        targeted: false
      });
    }
  }

  function getLinePoints() {
    const points = [];
    const lineY = height() / 2;
    const lineXStart = width() / 2 - 140;
    const lineXEnd = width() / 2 + 140;
    const lineLength = lineXEnd - lineXStart;
    const count = 70;

    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      points.push({
        x: lineXStart + t * lineLength + (Math.random() - 0.5) * 1.5,
        y: lineY + (Math.random() - 0.5) * 1.5
      });
    }

    return points;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function drawFloating() {
    stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79,195,247,${star.op})`;
      ctx.fill();
    });

    stars.forEach((star, index) => {
      stars.slice(index + 1).forEach((other) => {
        const distance = Math.hypot(star.x - other.x, star.y - other.y);
        if (distance < 110) {
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(79,195,247,${0.12 * (1 - distance / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
  }

  function startTyping() {
    const typingText = "WHERE QUANTUM MEETS INNOVATION";
    let index = 0;

    function type() {
      if (index >= typingText.length) return;
      typingElement.textContent += typingText[index];
      index += 1;
      setTimeout(type, 75);
    }

    type();
  }

  function heroLoop() {
    ctx.clearRect(0, 0, width(), height());
    frame += 1;

    if (phase === "float") {
      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0 || star.x > width()) star.vx *= -1;
        if (star.y < 0 || star.y > height()) star.vy *= -1;
      });
      drawFloating();

      if (frame === 90) {
        const points = shuffle(getLinePoints());
        const count = Math.min(stars.length, points.length);
        for (let i = 0; i < count; i += 1) {
          stars[i].tx = points[i].x;
          stars[i].ty = points[i].y;
          stars[i].ox = stars[i].x;
          stars[i].oy = stars[i].y;
          stars[i].targeted = true;
        }
        phase = "gather";
        frame = 0;
      }
    } else if (phase === "gather") {
      const duration = 100;
      const progress = Math.min(frame / duration, 1);
      const eased = easeInOut(progress);

      stars.forEach((star) => {
        if (star.targeted) {
          star.x = star.ox + (star.tx - star.ox) * eased;
          star.y = star.oy + (star.ty - star.oy) * eased;
          const glow = Math.max(0, eased - 0.6) / 0.4;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * (1 + glow * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(79,195,247,${0.4 + glow * 0.5})`;
          ctx.fill();

          if (glow > 0.2) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79,195,247,${glow * 0.12})`;
            ctx.fill();
          }
        } else {
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < 0 || star.x > width()) star.vx *= -1;
          if (star.y < 0 || star.y > height()) star.vy *= -1;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(79,195,247,${star.op * (1 - eased * 0.6)})`;
          ctx.fill();
        }
      });

      if (progress >= 1) {
        phase = "hold";
        frame = 0;
      }
    } else if (phase === "hold") {
      stars.forEach((star) => {
        if (!star.targeted) return;
        const pulse = 0.55 + Math.sin(frame * 0.06 + star.tx * 0.02) * 0.2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,195,247,${pulse})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,195,247,${pulse * 0.08})`;
        ctx.fill();
      });

      if (frame === 20) {
        heroTitle.classList.add("visible");
        heroLine.classList.add("visible");
      }

      if (frame > 50) {
        const fadeStars = Math.min((frame - 50) / 40, 1);
        stars.forEach((star) => {
          if (!star.targeted) return;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(79,195,247,${0.6 * (1 - fadeStars)})`;
          ctx.fill();
        });
      }

      if (frame > 110) {
        phase = "scatter";
        frame = 0;
        stars.forEach((star) => {
          star.ox = star.x;
          star.oy = star.y;
          star.tx = Math.random() * width();
          star.ty = Math.random() * height();
        });
      }
    } else if (phase === "scatter") {
      const duration = 80;
      const progress = Math.min(frame / duration, 1);
      const eased = easeOut(progress);

      stars.forEach((star) => {
        if (star.targeted) {
          star.x = star.ox + (star.tx - star.ox) * eased;
          star.y = star.oy + (star.ty - star.oy) * eased;
        } else {
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < 0 || star.x > width()) star.vx *= -1;
          if (star.y < 0 || star.y > height()) star.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        const fade = star.targeted ? eased * star.op : star.op;
        ctx.fillStyle = `rgba(79,195,247,${fade})`;
        ctx.fill();
      });

      if (progress > 0.5) {
        stars.forEach((star, index) => {
          stars.slice(index + 1).forEach((other) => {
            const distance = Math.hypot(star.x - other.x, star.y - other.y);
            if (distance < 110) {
              ctx.beginPath();
              ctx.moveTo(star.x, star.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(79,195,247,${0.12 * (1 - distance / 110) * (progress - 0.5) / 0.5})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });
      }

      if (progress >= 1) {
        stars.forEach((star) => {
          star.targeted = false;
        });
        phase = "float2";
        frame = 0;
        heroButtons.classList.add("visible");
        startTyping();
      }
    } else if (phase === "float2") {
      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0 || star.x > width()) star.vx *= -1;
        if (star.y < 0 || star.y > height()) star.vy *= -1;
      });
      drawFloating();
    }

    requestAnimationFrame(heroLoop);
  }

  makeStars();
  heroLoop();
}

window.addEventListener("load", initHeroAnimation);
