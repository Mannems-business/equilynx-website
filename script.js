const navbar = document.getElementById("navbar");
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

// --- Scroll Handling ---
let lastScrollY = window.scrollY;
let scrollDelta = 0; // Used for hero parallax effect
let ticking = false;

function updateScrollState() {
  const currentScrollY = window.scrollY;
  scrollDelta = currentScrollY - lastScrollY;
  lastScrollY = currentScrollY;

  if (navbar) {
    navbar.classList.toggle("scrolled", currentScrollY > 50);
  }
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollState);
    ticking = true;
  }
}

window.addEventListener("scroll", onScroll, { passive: true });


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

function decodeEffect(element, onComplete) {
  if (!element) return;
  const chars = "!<>-_\\/[]{}—=+*^?#";
  const originalText = element.dataset.originalText || element.textContent;
  if (!element.dataset.originalText) {
    element.dataset.originalText = originalText;
  }
  
  let iteration = 0;
  const interval = setInterval(() => {
    element.textContent = originalText
      .split('')
      .map((letter, index) => {
        if (index < iteration) {
          return originalText[index];
        }
        if (letter === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');

    if (iteration >= originalText.length) {
      clearInterval(interval);
      element.textContent = originalText;
      if (onComplete) {
        onComplete();
      }
    }

    iteration += 1 / 3;
  }, 30);
}

function initInteractiveDiagram() {
  const diagram = document.getElementById("interactiveDiagram");
  if (!diagram) return;

  const diagramObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      diagram.classList.add("animate");
    }
  }, { threshold: 0.5 });

  diagramObserver.observe(diagram);
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
  
  // Check if canvas exists, if not (e.g., on pages without hero canvas), return early
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Optional: Get these elements if they exist (for old hero structure)
  const heroTitle = document.getElementById("heroTitle");
  const heroLine = document.getElementById("heroLine");
  const heroButtons = document.getElementById("heroBtns");
  const heroSub = document.getElementById("heroSub");
  const typingElement = document.getElementById("typingText");

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

  function getLinePoints(count = stars.length) {
    const points = [];
    const centerX = width() / 2;
    const centerY = height() / 2;

    for (let i = 0; i < count; i += 1) {
      points.push({
        x: centerX + (Math.random() - 0.5) * 5,
        y: centerY + (Math.random() - 0.5) * 5
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
    if (!typingElement) return;
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

      if (frame === 45) {
        const points = shuffle(getLinePoints(stars.length));
        for (let i = 0; i < stars.length; i += 1) {
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
      const duration = 40;
      const progress = Math.min(frame / duration, 1);
      const eased = easeInOut(progress);

      stars.forEach((star) => {
        if (star.targeted) {
          star.x = star.ox + (star.tx - star.ox) * eased;
          star.y = star.oy + (star.ty - star.oy) * eased;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          // Fade the stars out as they gather
          ctx.fillStyle = `rgba(79,195,247,${star.op * (1 - eased)})`;
          ctx.fill();
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
        // Skip the 'hold' phase and go directly to 'scatter'
        phase = "scatter";
        frame = 0;
        if (heroTitle) {
          heroTitle.classList.add("visible");
          decodeEffect(heroTitle);
          if (heroLine) heroLine.classList.add("visible");
        }
      }
    } else if (phase === "scatter") {
      const duration = 35;
      const progress = Math.min(frame / duration, 1);
      const eased = easeOut(progress);

      stars.forEach((star) => {
        if (frame === 1) {
          star.ox = star.x;
          star.oy = star.y;
          star.tx = Math.random() * width();
          star.ty = Math.random() * height();
        }
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
        if (heroButtons) {
          heroButtons.classList.add("visible");
          if (heroSub) heroSub.classList.add("visible");
          startTyping();
        }
      }
    } else if (phase === "float2") {
      stars.forEach((star) => {
        // Apply parallax effect from scrolling, making stars move up when scrolling down
        star.y -= scrollDelta * 0.3;

        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0 || star.x > width()) star.vx *= -1;
        if (star.y < 0 || star.y > height()) star.vy *= -1;
      });
      drawFloating();

      // Reset scroll delta after it has been applied in this frame
      scrollDelta = 0;
    }

    requestAnimationFrame(heroLoop);
  }

  makeStars();
  heroLoop();
}

function initFeaturesGallery() {
  const galleryWrapper = document.querySelector(".features-gallery-wrapper");
  if (!galleryWrapper) return;
  
  const viewport = galleryWrapper.querySelector(".features-gallery-viewport");
  const featuresGrid = viewport.querySelector(".features-grid");
  const prevButton = galleryWrapper.querySelector(".gallery-nav.prev");
  const nextButton = galleryWrapper.querySelector(".gallery-nav.next");
  const paginationContainer = galleryWrapper.querySelector(".gallery-pagination");
  const cards = featuresGrid.querySelectorAll(".feature-card");
  if (!featuresGrid || !prevButton || !nextButton || !paginationContainer || cards.length === 0) return;
  let currentIndex = 0;
  const totalCards = cards.length;

  // Create pagination dots
  for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement("button");
    dot.classList.add("gallery-dot");
    dot.setAttribute("aria-label", `Go to feature ${i + 1}`);
    dot.addEventListener("click", () => {
      currentIndex = i;
      updateGallery();
    });
    paginationContainer.appendChild(dot);
  }

  const dots = paginationContainer.querySelectorAll(".gallery-dot");

  function updateGallery() {
    const offset = -currentIndex * (100 / totalCards);
    featuresGrid.style.transform = `translateX(${offset}%)`;

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === totalCards - 1;

    // Update pagination dots
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateGallery();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentIndex < totalCards - 1) {
      currentIndex++;
      updateGallery();
    }
  });

  window.addEventListener("resize", updateGallery);
  updateGallery(); // Initial call
}

window.addEventListener("load", () => {
  updateScrollState();

  initHeroAnimation();
  initFeaturesGallery();
  initInteractiveDiagram();
});
