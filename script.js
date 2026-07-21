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

function getSubmitLabel(button) {
  if (!button) return "";
  return button.tagName === "BUTTON" ? button.textContent : button.value;
}

function setSubmitLabel(button, label) {
  if (!button) return;
  if (button.tagName === "BUTTON") button.textContent = label;
  else button.value = label;
}

document.querySelectorAll('form[action*="formspree.io"]').forEach((form) => {
  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

  let status = form.querySelector(".form-status");
  if (!status) {
    status = document.createElement("div");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (typeof form.reportValidity === "function" && !form.reportValidity()) return;
    if (submitButton && submitButton.disabled) return;

    const originalLabel = getSubmitLabel(submitButton) || "Send Message";
    form.classList.add("is-submitting");
    status.className = "form-status";
    status.textContent = "";
    if (submitButton) {
      submitButton.disabled = true;
      setSubmitLabel(submitButton, "Sending...");
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        status.className = "form-status form-status-success is-visible";
        status.innerHTML =
          '<i class="fas fa-circle-check"></i><span>Thank you for reaching out — your message has been sent. We\'ll respond within 24 hours.</span>';
      } else {
        let message =
          "Something went wrong. Please try again, or email us directly at contact@equilynx.in.";
        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors.length) {
            message = data.errors.map((err) => err.message).join(" ");
          }
        } catch (parseError) {
          /* keep default message */
        }
        status.className = "form-status form-status-error is-visible";
        status.innerHTML = '<i class="fas fa-triangle-exclamation"></i><span>' + message + "</span>";
      }
    } catch (networkError) {
      status.className = "form-status form-status-error is-visible";
      status.innerHTML =
        '<i class="fas fa-triangle-exclamation"></i><span>Network error. Please check your connection, or email us at contact@equilynx.in.</span>';
    } finally {
      form.classList.remove("is-submitting");
      if (submitButton) {
        submitButton.disabled = false;
        setSubmitLabel(submitButton, originalLabel);
      }
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

  // On pages without the star canvas (e.g. the chooser page), skip the
  // star-field animation entirely and just reveal the hero content right away.
  if (!canvas) {
    const heroTitle = document.getElementById("heroTitle");
    const heroLine = document.getElementById("heroLine");
    const heroButtons = document.getElementById("heroBtns");
    const heroSub = document.getElementById("heroSub");
    const typingElement = document.getElementById("typingText");

    if (heroTitle) {
      heroTitle.classList.add("visible");
      decodeEffect(heroTitle);
    }
    if (heroLine) heroLine.classList.add("visible");
    if (heroButtons) heroButtons.classList.add("visible");
    if (heroSub) heroSub.classList.add("visible");

    if (typingElement) {
      const typingText = typingElement.dataset.typing || "WHERE INNOVATION TAKES SHAPE";
      let index = 0;
      (function type() {
        if (index >= typingText.length) return;
        typingElement.textContent += typingText[index];
        index += 1;
        setTimeout(type, 75);
      })();
    }
    return;
  }

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
    const typingText = typingElement.dataset.typing || "WHERE INNOVATION TAKES SHAPE";
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

// =====================================================
// HOW EQUILYNX R&D WORKS — animated canvas explainer
// Self-contained scene storyboard with captions, play/pause,
// and optional browser (Web Speech API) voice narration.
// =====================================================
function initExplainer() {
  const canvas = document.getElementById("explainer-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const stage = canvas.parentElement;
  const kickerEl = document.getElementById("explainerKicker");
  const textEl = document.getElementById("explainerText");
  const captionEl = document.getElementById("explainerCaption");
  const playBtn = document.getElementById("explainerPlay");
  const narrateBtn = document.getElementById("explainerNarrate");
  const replayBtn = document.getElementById("explainerReplay");
  const progressEl = document.getElementById("explainerProgress");

  const ACC = "79,195,247";
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0;
  let H = 0;
  let dpr = 1;
  let voices = [];

  function populateVoices() {
    if (typeof speechSynthesis === "undefined") return;
    voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  }

  populateVoices();
  if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---- drawing helpers -------------------------------------------------
  function glowDot(x, y, r, inner, outer) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ---- scene painters (p = 0..1 within the scene, t = ms) --------------
  function sceneThreat(p, t) {
    const cx = W / 2;
    const cy = H * 0.46;
    // faint qubit grid pulsing behind
    ctx.save();
    for (let gx = 0; gx < 6; gx += 1) {
      for (let gy = 0; gy < 3; gy += 1) {
        const x = W * 0.2 + gx * (W * 0.6 / 5);
        const y = H * 0.2 + gy * (H * 0.28);
        const a = 0.05 + 0.05 * Math.sin(t * 0.004 + gx + gy);
        ctx.fillStyle = `rgba(${ACC},${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // lock body -> shifts from cyan to warning amber as the "threat" grows
    const warn = Math.min(1, p * 1.4);
    const col = `rgba(${lerp(79, 255, warn).toFixed(0)},${lerp(195, 170, warn).toFixed(0)},${lerp(247, 70, warn).toFixed(0)},0.95)`;
    const bw = 96;
    const bh = 74;
    const bx = cx - bw / 2;
    const by = cy - 6;
    glowDot(cx, cy + bh / 2 - 6, 90, `rgba(${ACC},0.12)`, `rgba(${ACC},0)`);
    ctx.lineWidth = 3;
    ctx.strokeStyle = col;
    // shackle
    ctx.beginPath();
    ctx.arc(cx, by, 26, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 26, by);
    ctx.lineTo(cx - 26, by + 8);
    ctx.moveTo(cx + 26, by);
    ctx.lineTo(cx + 26, by + 8);
    ctx.stroke();
    // body
    ctx.beginPath();
    ctx.roundRect(bx, by + 6, bw, bh, 10);
    ctx.stroke();
    // keyhole
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(cx, by + 6 + bh * 0.42, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 2.5, by + 6 + bh * 0.42, 5, 20);
    // crack grows
    if (p > 0.3) {
      const cp = (p - 0.3) / 0.7;
      ctx.strokeStyle = `rgba(255,90,70,${0.85 * cp})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, by + 12);
      ctx.lineTo(cx - 10 * cp, by + 30);
      ctx.lineTo(cx + 8 * cp, by + 48);
      ctx.lineTo(cx - 6 * cp, by + 66);
      ctx.stroke();
    }
  }

  function drawAtomMotif(cx, cy, scale, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    glowDot(0, 0, 22, `rgba(${ACC},0.35)`, `rgba(${ACC},0)`);
    ctx.fillStyle = "rgba(200,240,255,0.95)";
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    for (let o = 0; o < 3; o += 1) {
      const rot = (t * 0.0009) * (o % 2 ? -1 : 1) + o * (Math.PI / 3);
      ctx.save();
      ctx.rotate(rot);
      ctx.strokeStyle = `rgba(${ACC},0.4)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 46, 17, 0, 0, Math.PI * 2);
      ctx.stroke();
      const ea = t * 0.003 * (o % 2 ? -1 : 1) + o;
      const ex = Math.cos(ea) * 46;
      const ey = Math.sin(ea) * 17;
      glowDot(ex, ey, 6, "rgba(180,235,255,0.95)", `rgba(${ACC},0)`);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawNeuralMotif(cx, cy, t) {
    const layers = [3, 4, 3];
    const spanX = 120;
    const nodes = [];
    layers.forEach((n, li) => {
      const col = [];
      const x = cx - spanX / 2 + (spanX * li) / (layers.length - 1);
      for (let i = 0; i < n; i += 1) {
        const y = cy - ((n - 1) * 26) / 2 + i * 26;
        col.push({ x, y });
      }
      nodes.push(col);
    });
    for (let li = 0; li < nodes.length - 1; li += 1) {
      nodes[li].forEach((a) => {
        nodes[li + 1].forEach((b) => {
          const pulse = 0.06 + 0.06 * Math.sin(t * 0.005 + a.y + b.x);
          ctx.strokeStyle = `rgba(${ACC},${pulse})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
      });
    }
    nodes.forEach((col, li) => {
      col.forEach((nd, i) => {
        const fire = 0.5 + 0.5 * Math.sin(t * 0.004 + li * 1.3 + i);
        glowDot(nd.x, nd.y, 7, `rgba(180,235,255,${0.5 + 0.4 * fire})`, `rgba(${ACC},0)`);
      });
    });
  }

  function sceneResearch(p, t) {
    drawAtomMotif(W * 0.31, H * 0.46, 1, t);
    drawNeuralMotif(W * 0.68, H * 0.46, t);
    // link the two disciplines
    ctx.strokeStyle = `rgba(${ACC},${0.18 * Math.min(1, p * 2)})`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(W * 0.31 + 60, H * 0.46);
    ctx.lineTo(W * 0.68 - 80, H * 0.46);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function scenePQC(p, t) {
    const cx = W / 2;
    const cy = H * 0.46;
    // lattice grid assembling
    const cols = 7;
    const rows = 5;
    const gw = 220;
    const gh = 150;
    ctx.save();
    ctx.translate(cx, cy);
    const build = Math.min(1, p * 1.3);
    for (let i = 0; i <= cols; i += 1) {
      const x = -gw / 2 + (gw * i) / cols;
      ctx.strokeStyle = `rgba(${ACC},${0.16 * build})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, -gh / 2);
      ctx.lineTo(x, gh / 2);
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j += 1) {
      const y = -gh / 2 + (gh * j) / rows;
      ctx.strokeStyle = `rgba(${ACC},${0.16 * build})`;
      ctx.beginPath();
      ctx.moveTo(-gw / 2, y);
      ctx.lineTo(gw / 2, y);
      ctx.stroke();
    }
    for (let i = 0; i <= cols; i += 1) {
      for (let j = 0; j <= rows; j += 1) {
        const x = -gw / 2 + (gw * i) / cols;
        const y = -gh / 2 + (gh * j) / rows;
        const a = 0.25 * build + 0.15 * Math.sin(t * 0.004 + i + j);
        ctx.fillStyle = `rgba(${ACC},${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // shield outline forming over the lattice
    const s = Math.max(0, (p - 0.35) / 0.65);
    if (s > 0) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = `rgba(160,225,255,${0.9 * s})`;
      ctx.lineWidth = 3;
      const sw = 96;
      const sh = 120;
      ctx.beginPath();
      ctx.moveTo(0, -sh / 2);
      ctx.lineTo(sw / 2, -sh / 2 + 26);
      ctx.lineTo(sw / 2, 12);
      ctx.quadraticCurveTo(sw / 2, sh / 2, 0, sh / 2 + 6);
      ctx.quadraticCurveTo(-sw / 2, sh / 2, -sw / 2, 12);
      ctx.lineTo(-sw / 2, -sh / 2 + 26);
      ctx.closePath();
      ctx.stroke();
      if (s > 0.6) {
        const cc = (s - 0.6) / 0.4;
        ctx.strokeStyle = `rgba(160,235,255,${cc})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-20, 2);
        ctx.lineTo(-6, 20);
        ctx.lineTo(26, -20);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function sceneProduct(p, t) {
    const cx = W / 2;
    const cy = H * 0.46;
    // left: rotating gears (research/engineering)
    const gearX = W * 0.3;
    drawGear(gearX, cy, 30, 9, t * 0.0012, 0.35 + 0.2 * (1 - p));
    drawGear(gearX + 44, cy + 30, 20, 7, -t * 0.0018, 0.3 * (1 - p) + 0.1);

    // arrow research -> product
    ctx.strokeStyle = `rgba(${ACC},${0.4})`;
    ctx.lineWidth = 2;
    const ax = W * 0.46;
    const bx = W * 0.56;
    ctx.beginPath();
    ctx.moveTo(ax, cy);
    ctx.lineTo(bx, cy);
    ctx.lineTo(bx - 8, cy - 6);
    ctx.moveTo(bx, cy);
    ctx.lineTo(bx - 8, cy + 6);
    ctx.stroke();

    // right: a deployable product cube locking in
    const px = W * 0.7;
    const appear = Math.min(1, p * 1.4);
    ctx.save();
    ctx.translate(px, cy);
    ctx.globalAlpha = appear;
    const r = 40;
    // isometric-ish cube
    ctx.strokeStyle = `rgba(160,225,255,0.9)`;
    ctx.fillStyle = `rgba(${ACC},0.12)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, -r / 2);
    ctx.lineTo(r, r / 2);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, r / 2);
    ctx.lineTo(-r, -r / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, 0);
    ctx.moveTo(-r, -r / 2);
    ctx.lineTo(0, 0);
    ctx.lineTo(r, -r / 2);
    ctx.stroke();
    // "Rust" tag pulse
    glowDot(0, 0, 6 + 2 * Math.sin(t * 0.006), "rgba(180,235,255,0.9)", `rgba(${ACC},0)`);
    ctx.restore();
  }

  function drawGear(cx, cy, radius, teeth, rot, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = `rgba(${ACC},${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < teeth; i += 1) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.5) / teeth) * Math.PI * 2;
      ctx.lineTo(Math.cos(a0) * radius, Math.sin(a0) * radius);
      ctx.lineTo(Math.cos(a0) * (radius + 6), Math.sin(a0) * (radius + 6));
      ctx.lineTo(Math.cos(a1) * (radius + 6), Math.sin(a1) * (radius + 6));
      ctx.lineTo(Math.cos(a1) * radius, Math.sin(a1) * radius);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function sceneSovereign(p, t) {
    const cx = W / 2;
    const cy = H * 0.46;
    // boundary ring = sovereign data staying inside India
    const R = 92;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = `rgba(${ACC},0.5)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = -t * 0.02;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // tricolour pulse bars (saffron / white / green) — larger representation
    const barW = 85;
    const barH = 10;
    const barYStep = 15;
    const cols = ["255,153,51", "255,255,255", "19,136,8"];
    cols.forEach((c, i) => {
      const y = -barYStep + i * barYStep;
      ctx.fillStyle = `rgba(${c},${0.18 + 0.12 * Math.sin(t * 0.004 + i)})`;
      ctx.fillRect(-barW / 2, y, barW, barH);
    });

    // data packets orbiting but contained inside the ring
    for (let k = 0; k < 6; k += 1) {
      const a = t * 0.0016 + k * (Math.PI / 3);
      const rr = R - 16 - (k % 2) * 20;
      glowDot(Math.cos(a) * rr, Math.sin(a) * rr, 4, "rgba(180,235,255,0.9)", `rgba(${ACC},0)`);
    }
    ctx.restore();
  }

  function sceneFinale(p, t) {
    const cx = W / 2;
    const cy = H * 0.44;
    // particles converge into a glowing core
    const n = 40;
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2 + t * 0.0006;
      const spread = lerp(180, 26, Math.min(1, p * 1.2));
      const x = cx + Math.cos(a) * spread * (0.6 + 0.4 * Math.sin(i));
      const y = cy + Math.sin(a) * spread * 0.5 * (0.6 + 0.4 * Math.cos(i));
      glowDot(x, y, 3, `rgba(${ACC},0.8)`, `rgba(${ACC},0)`);
    }
    glowDot(cx, cy, 30 + 6 * Math.sin(t * 0.005), `rgba(180,235,255,${0.4 + 0.2 * p})`, `rgba(${ACC},0)`);
    // wordmark E
    ctx.fillStyle = `rgba(230,248,255,${Math.min(1, p * 1.5)})`;
    ctx.font = "300 46px 'Raleway', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("EQUILYNX", cx, cy);
  }

  // ---- scene timeline --------------------------------------------------
  const scenes = [
    {
      kicker: "The Challenge",
      text: "Tomorrow's quantum computers can break the encryption that protects the world today.",
      narration: "Tomorrow's quantum computers can break the encryption that protects the world today.",
      dur: 6500,
      draw: sceneThreat
    },
    {
      kicker: "Our Research",
      text: "So we research at the frontier — Quantum Computing and Artificial Intelligence.",
      narration: "So we research at the frontier, combining quantum computing and artificial intelligence.",
      dur: 6500,
      draw: sceneResearch
    },
    {
      kicker: "Quantum-Safe Cryptography",
      text: "We engineer Post-Quantum Cryptography — NIST-aligned, lattice-based ML-KEM & ML-DSA.",
      narration: "We engineer post-quantum cryptography: NIST aligned, lattice based algorithms like M L KEM and M L D S A.",
      dur: 7000,
      draw: scenePQC
    },
    {
      kicker: "Research To Product",
      text: "Built in Rust as deployable, high-performance middleware — not just papers.",
      narration: "It's built in Rust as deployable, high performance middleware. Real products, not just papers.",
      dur: 6500,
      draw: sceneProduct
    },
    {
      kicker: "Sovereign & Aligned",
      text: "Hosted in India and aligned with the National Quantum Mission for sovereign resilience.",
      narration: "Everything is hosted in India and aligned with the National Quantum Mission for sovereign resilience.",
      dur: 6800,
      draw: sceneSovereign
    },
    {
      kicker: "Equilynx R&D",
      text: "Engineering the quantum frontier — from research to real-world resilience.",
      narration: "Equilynx. Engineering the quantum frontier, from research to real world resilience.",
      dur: 6000,
      draw: sceneFinale
    }
  ];

  // progress segments
  const segFills = [];
  scenes.forEach((_, i) => {
    const seg = document.createElement("div");
    seg.className = "explainer-seg";
    const fill = document.createElement("i");
    seg.appendChild(fill);
    seg.addEventListener("click", () => {
      sceneIndex = i;
      sceneStart = performance.now();
      applyCaption();
    });
    progressEl.appendChild(seg);
    segFills.push(fill);
  });

  let sceneIndex = 0;
  let sceneStart = 0;
  let playing = false;
  let rafId = null;
  let narrate = false;
  let lastSpoken = -1;

  function applyCaption() {
    const s = scenes[sceneIndex];
    kickerEl.textContent = s.kicker;
    textEl.textContent = s.text;
    if (narrate) speak(sceneIndex);
    else lastSpoken = sceneIndex;
  }

  function speak(i) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(scenes[i].narration);

      // --- Voice Selection Logic ---
      // Attempt to select a higher-quality, non-default female voice for a better experience.
      // The available voices depend on the user's OS and browser.
      const preferredVoiceNames = [
        "Google UK English Female",
        "Microsoft Zira Desktop - English (United States)",
        "Samantha", // Common on macOS
      ];
      const selectedVoice = voices.find(v => preferredVoiceNames.includes(v.name)) 
                           || voices.find(v => v.name.includes('Female')) 
                           || voices[0];
      if (selectedVoice) u.voice = selectedVoice;

      u.rate = 0.98;
      u.pitch = 1;
      u.volume = 0.95; // Slightly reduce volume to be less jarring
      window.speechSynthesis.speak(u);
      lastSpoken = i;
    } catch (e) {
      /* narration unavailable */
    }
  }

  function frame(now) {
    if (!sceneStart) sceneStart = now;
    const s = scenes[sceneIndex];
    let p = (now - sceneStart) / s.dur;

    if (p >= 1) {
      sceneIndex = (sceneIndex + 1) % scenes.length;
      sceneStart = now;
      p = 0;
      applyCaption();
    }

    // per-scene fade in/out
    let fade = 1;
    if (p < 0.1) fade = p / 0.1;
    else if (p > 0.9) fade = (1 - p) / 0.1;
    captionEl.style.opacity = fade.toFixed(2);

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = fade;
    s.draw(p, now);
    ctx.restore();

    // progress bars
    segFills.forEach((f, i) => {
      let w = 0;
      if (i < sceneIndex) w = 100;
      else if (i === sceneIndex) w = Math.min(100, p * 100);
      f.style.width = w + "%";
    });

    if (playing) rafId = requestAnimationFrame(frame);
  }

  function play() {
    if (playing) return;
    playing = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    sceneStart = 0;
    if (narrate && lastSpoken !== sceneIndex) speak(sceneIndex);
    rafId = requestAnimationFrame(frame);
  }

  function pause() {
    playing = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    if (rafId) cancelAnimationFrame(rafId);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  playBtn.addEventListener("click", () => {
    if (playing) pause();
    else play();
  });

  replayBtn.addEventListener("click", () => {
    sceneIndex = 0;
    sceneStart = 0;
    lastSpoken = -1;
    applyCaption();
    if (!playing) play();
  });

  narrateBtn.addEventListener("click", () => {
    narrate = !narrate;
    narrateBtn.setAttribute("aria-pressed", narrate ? "true" : "false");
    narrateBtn.innerHTML = narrate
      ? '<i class="fas fa-volume-high"></i>'
      : '<i class="fas fa-volume-xmark"></i>';
    if (narrate) speak(sceneIndex);
    else if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  resize();
  window.addEventListener("resize", resize);
  applyCaption();

  // draw a first static frame immediately
  ctx.clearRect(0, 0, W, H);
  scenes[0].draw(0.5, performance.now());

  if (reduce) return; // respect reduced motion: leave the static frame

  // auto play/pause when the section enters/leaves the viewport
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) play();
          else pause();
        });
      },
      { threshold: 0.35 }
    );
    io.observe(stage);
  } else {
    play();
  }

  // stop narration if the user navigates away
  window.addEventListener("beforeunload", () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });
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

function initExperienceToggle() {
  const toggle = document.querySelector(".experience-toggle");
  if (!toggle) return;

  const options = toggle.querySelectorAll(".toggle-option");
  options.forEach(option => {
    // Do not add a click listener to the active/current page link
    if (option.classList.contains('active') || option.getAttribute('aria-current') === 'page') {
      return;
    }

    option.addEventListener("click", (event) => {
      event.preventDefault();
      const track = option.dataset.track;
      if (track) {
        chooseExperience(track);
      }
    });
  });
}

window.addEventListener("load", () => {
  updateScrollState();

  initHeroAnimation();
  initExplainer();
  initFeaturesGallery();
  initInteractiveDiagram();
  initExperienceToggle();
});

// =====================================================
// EXPERIENCE SELECTOR (Startup vs Enterprise IT Consulting)
// =====================================================

function switchExperience(event) {
  if (event) event.preventDefault();
  window.location.href = "/";
}
window.switchExperience = switchExperience;

function chooseExperience(track) {
  window.location.href = track === "consulting" ? "/consulting/" : "/";
}
window.chooseExperience = chooseExperience;


// =====================================================
// EVA — Equilynx Virtual Assistant (client-side, no backend/API key)
// Answers questions using a knowledge base built from the site content.
// =====================================================
(function () {
  "use strict";

  const BOT_NAME = "EVA";

  // Each entry: keys are matched against the query. `weight` boosts specific
  // topics so a specific term (e.g. "director") beats a generic one (e.g. "company").
  const KB = [
    {
      id: "contact",
      weight: 1,
      keys: ["contact", "email", "e-mail", "mail", "phone", "call", "number", "reach", "reach out", "get in touch", "touch", "whatsapp", "address", "located", "location", "where are you", "where is", "map", "office", "talk to", "speak", "enquire", "inquiry", "enquiry", "connect"],
      answer:
        "You can reach Equilynx here:<br>" +
        "&bull; Email: <a href=\"mailto:contact@equilynx.in\">contact@equilynx.in</a><br>" +
        "&bull; Phone: <a href=\"tel:+917337418969\">+91 7337418969</a><br>" +
        "&bull; WhatsApp: <a href=\"https://wa.me/917337418969\" target=\"_blank\" rel=\"noopener\">Chat with us</a><br>" +
        "&bull; Office: Hyderabad, Telangana, India<br>" +
        "Or use the form on our <a href=\"/contact/\">Contact page</a>.",
    },
    {
      id: "leadership",
      weight: 3,
      keys: ["director", "directors", "founder", "founders", "co-founder", "ceo", "chief executive", "managing director", "md", "leader", "leadership", "team", "charan", "srikanth", "management", "who runs", "who leads", "who owns", "owner", "who is the", "who are the", "boss", "head of", "people behind", "operations head"],
      answer:
        "Equilynx is led by two directors:<br>" +
        "&bull; <a href=\"/leadership/charan.html\">Mannem Venkata Sai Charan</a> — Founder &amp; Chief Executive Officer<br>" +
        "&bull; <a href=\"/leadership/srikanth.html\">Mannem Venkata Srikanth</a> — Managing Director &amp; Operations Head<br>" +
        "More on the <a href=\"/about/\">About page</a>.",
    },
    {
      id: "careers",
      weight: 2,
      keys: ["career", "careers", "job", "jobs", "intern", "interns", "internship", "internships", "hiring", "hire", "apply", "application", "vacancy", "vacancies", "work with", "work at", "join", "opening", "openings", "role", "roles", "position", "positions", "recruit", "employment"],
      answer:
        "We currently offer two basic internships per division:<br>" +
        "&bull; Startup: Research Intern &amp; Software Engineering Intern &rarr; <a href=\"/startup/careers/\">Startup Careers</a><br>" +
        "&bull; Consulting: IT Consulting Intern &amp; Cloud &amp; Security Intern &rarr; <a href=\"/consulting/careers/\">Consulting Careers</a>",
    },
    {
      id: "research",
      weight: 2,
      keys: ["research", "quantum", "qubit", "pqc", "post-quantum", "post quantum", "cryptography", "crypto", "encryption", "ai research", "machine learning", "ml", "artificial intelligence", "pillars", "science", "lab", "laboratory", "nqm", "national quantum mission", "ml-kem", "ml-dsa", "lattice"],
      answer:
        "Our Quantum R&amp;D division works across four research pillars: Quantum Computing, Artificial Intelligence, Post-Quantum Cryptography (NIST/FIPS-aligned lattice primitives like ML-KEM &amp; ML-DSA, built in Rust), and Emerging Technologies &amp; Distributed Systems — aligned with India's National Quantum Mission. See <a href=\"/startup/research/\">Research</a>.",
    },
    {
      id: "products",
      weight: 2,
      keys: ["product", "products", "middleware", "shipped", "pqc middleware", "offering", "offerings", "what do you build", "what do you sell", "software", "tool", "platform"],
      answer:
        "Our first research line to reach production maturity is a Post-Quantum Cryptography (PQC) middleware — quantum-safe, Rust-native, and sovereign-hosted. Explore <a href=\"/startup/products/\">Products</a>.",
    },
    {
      id: "innovation",
      weight: 2,
      keys: ["innovation", "roadmap", "research to product", "prototype", "prototypes", "how do you deploy", "process"],
      answer:
        "Equilynx follows a research-to-product path: open-ended research &rarr; hardened prototypes &rarr; deployed innovation (like our PQC middleware). See <a href=\"/startup/innovation/\">Innovation</a>.",
    },
    {
      id: "partnerships",
      weight: 2,
      keys: ["partnership", "partnerships", "partner", "collaborate", "collaboration", "academic", "research collaboration", "university", "institute"],
      answer:
        "We welcome research collaborations and academic partnerships through our Startup division. Learn more on <a href=\"/startup/partnerships/\">Partnerships</a> or reach us via <a href=\"/contact/\">Contact</a>.",
    },
    {
      id: "services",
      weight: 2,
      keys: ["service", "services", "consulting", "consultancy", "consult", "digital transformation", "cloud", "aws", "azure", "gcp", "infrastructure", "cybersecurity", "cyber security", "security", "data analytics", "analytics", "automation", "managed it", "managed services", "modernization", "modernisation", "it services"],
      answer:
        "Our IT Consultancy division delivers across four service pillars: Digital Transformation, Cloud &amp; Infrastructure (AWS/Azure/GCP), Cybersecurity (including post-quantum), and AI, Data &amp; Automation. See <a href=\"/consulting/services/\">Services</a> or the <a href=\"/consulting/\">Consulting home</a>.",
    },
    {
      id: "industries",
      weight: 2,
      keys: ["industry", "industries", "sector", "sectors", "clients", "customers", "who do you work with", "who do you serve", "verticals served"],
      answer:
        "Our consulting practice serves enterprises across multiple industries with full-lifecycle delivery. See <a href=\"/consulting/industries/\">Industries</a>.",
    },
    {
      id: "solutions",
      weight: 2,
      keys: ["solution", "solutions", "how you help", "how do you help", "capability", "capabilities"],
      answer:
        "Explore our enterprise <a href=\"/consulting/solutions/\">Solutions</a>, or tell me the problem you're solving and I'll point you to the right page.",
    },
    {
      id: "divisions",
      weight: 2,
      keys: ["division", "divisions", "two divisions", "quantum r&d", "quantum rd", "it consultancy", "branches", "verticals", "both sides", "what do you do", "areas"],
      answer:
        "Equilynx has two divisions:<br>" +
        "&bull; <a href=\"/\">Quantum R&amp;D</a> — deep-tech research in Quantum Computing, AI &amp; Post-Quantum Cryptography.<br>" +
        "&bull; <a href=\"/consulting/\">IT Consultancy</a> — enterprise digital transformation, cloud, cybersecurity and AI delivery.",
    },
    {
      id: "location",
      weight: 1,
      keys: ["hyderabad", "india", "based in", "headquarter", "headquarters", "hq", "which country", "which city", "telangana"],
      answer:
        "Equilynx is based in Hyderabad, Telangana, India — with all research, data, and IP kept within Indian infrastructure (data sovereignty).",
    },
    {
      id: "about",
      weight: 1,
      keys: ["about", "who are you", "who is equilynx", "what is equilynx", "company", "overview", "incorporated", "incorporation", "founded", "established", "history", "mission", "vision", "story", "background", "tell me about"],
      answer:
        "Equilynx Private Limited is a Hyderabad-based deep-tech company, incorporated in 2025. It operates two divisions — a Quantum, AI &amp; Post-Quantum Cryptography research startup, and an Enterprise IT Consulting practice — united by the same engineering rigor and aligned with India's National Quantum Mission. Read more on the <a href=\"/about/\">About page</a>.",
    },
    {
      id: "privacy",
      weight: 1,
      keys: ["privacy", "cookie", "cookies", "data protection", "gdpr", "policy", "terms", "how do you use my data"],
      answer:
        "You can read how we handle data on our <a href=\"/privacy/\">Privacy Policy</a> page.",
    },
  ];

  const GREETINGS = ["hi", "hello", "hey", "hii", "heya", "yo", "hola", "namaste"];
  const THANKS = ["thanks", "thank", "thx", "ty", "great", "awesome", "cool", "helpful"];
  const BYES = ["bye", "goodbye", "cya"];

  const SUGGESTIONS = [
    { label: "About Equilynx", q: "about equilynx" },
    { label: "Services", q: "services" },
    { label: "Research", q: "research" },
    { label: "Careers", q: "careers" },
    { label: "Who are the directors?", q: "who are the directors" },
    { label: "Contact", q: "contact" },
  ];

  // Words too generic to be meaningful on their own.
  const STOP = new Set(["the", "a", "an", "of", "is", "are", "to", "for", "in", "on", "at", "and", "or", "your", "you", "we", "our", "me", "my", "do", "does", "can", "i", "what", "who", "how", "tell", "about", "please", "with", "any", "there", "give"]);

  function normalize(s) {
    return " " + s.toLowerCase().replace(/[^a-z0-9&\s-]/g, " ").replace(/\s+/g, " ").trim() + " ";
  }

  function scoreEntry(entry, q) {
    let score = 0;
    for (const k of entry.keys) {
      const key = k.toLowerCase();
      if (q.indexOf(key) !== -1) {
        const isPhrase = key.indexOf(" ") !== -1;
        score += (isPhrase ? 3 : 1) * (entry.weight || 1);
      }
    }
    return score;
  }

  function answerFor(rawText) {
    const q = normalize(rawText);
    const words = q.trim().split(" ").filter(Boolean);
    const meaningful = words.filter((w) => !STOP.has(w));

    if (words.length && words.every((w) => GREETINGS.includes(w))) {
      return "Hi! I'm " + BOT_NAME + ", the Equilynx assistant. Ask me about our divisions, research, services, careers, leadership, or how to get in touch.";
    }
    if (!meaningful.length && THANKS.some((t) => words.includes(t))) {
      return "You're welcome! Anything else you'd like to know about Equilynx?";
    }
    if (BYES.some((b) => words.includes(b))) {
      return "Thanks for visiting Equilynx. Reach us anytime at <a href=\"mailto:contact@equilynx.in\">contact@equilynx.in</a>.";
    }

    let best = null;
    let bestScore = 0;
    for (const entry of KB) {
      const s = scoreEntry(entry, q);
      if (s > bestScore) {
        bestScore = s;
        best = entry;
      }
    }
    if (best && bestScore > 0) return best.answer;

    return (
      "I'm not sure about that one, but I can help with Equilynx's divisions, research, services, careers, leadership, or contact details. " +
      "You can also email <a href=\"mailto:contact@equilynx.in\">contact@equilynx.in</a> or use the <a href=\"/contact/\">Contact page</a>."
    );
  }

  function buildWidget() {
    if (document.querySelector(".eqx-bot-launch")) return;

    const launch = document.createElement("button");
    launch.className = "eqx-bot-launch";
    launch.type = "button";
    launch.setAttribute("aria-label", "Open " + BOT_NAME + ", the Equilynx assistant");
    launch.setAttribute("title", "Ask " + BOT_NAME);
    launch.innerHTML =
      '<span class="eqx-launch-ring"></span>' +
      '<span class="eqx-launch-core">' +
      '<i class="fas fa-comment-dots eqx-icon-open"></i>' +
      '<i class="fas fa-chevron-down eqx-icon-close"></i>' +
      '<span class="eqx-launch-spark"></span>' +
      "</span>" +
      '<span class="eqx-launch-label">Ask ' + BOT_NAME + "</span>";

    const panel = document.createElement("div");
    panel.className = "eqx-bot-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", BOT_NAME + ", the Equilynx assistant");
    panel.innerHTML =
      '<div class="eqx-bot-header">' +
      '<div class="eqx-bot-title"><span class="eqx-bot-avatar">' + BOT_NAME.charAt(0) + "</span>" +
      "<div><strong>" + BOT_NAME + '</strong><span>Equilynx Virtual Assistant</span></div></div>' +
      '<button class="eqx-bot-close" type="button" aria-label="Close chat"><i class="fas fa-times"></i></button>' +
      "</div>" +
      '<div class="eqx-bot-messages" id="eqxBotMessages"></div>' +
      '<form class="eqx-bot-input" id="eqxBotForm">' +
      '<input type="text" id="eqxBotText" autocomplete="off" placeholder="Ask ' + BOT_NAME + ' anything..." aria-label="Type your question" />' +
      '<button type="submit" aria-label="Send"><i class="fas fa-paper-plane"></i></button>' +
      "</form>";

    document.body.appendChild(launch);
    document.body.appendChild(panel);

    const messages = panel.querySelector("#eqxBotMessages");
    const form = panel.querySelector("#eqxBotForm");
    const input = panel.querySelector("#eqxBotText");

    function addMessage(html, who) {
      const el = document.createElement("div");
      el.className = "eqx-msg eqx-msg-" + who;
      el.innerHTML = html;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }

    function addSuggestions(items) {
      const wrap = document.createElement("div");
      wrap.className = "eqx-suggestions";
      items.forEach(function (s) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "eqx-chip";
        chip.textContent = s.label;
        chip.addEventListener("click", function () {
          handleQuery(s.q);
        });
        wrap.appendChild(chip);
      });
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
    }

    function botReply(text) {
      const typing = document.createElement("div");
      typing.className = "eqx-msg eqx-msg-bot eqx-typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;
      setTimeout(function () {
        typing.remove();
        addMessage(answerFor(text), "bot");
      }, 450);
    }

    function handleQuery(text) {
      const clean = (text || "").trim();
      if (!clean) return;
      addMessage(clean.replace(/</g, "&lt;").replace(/>/g, "&gt;"), "user");
      botReply(clean);
    }

    let greeted = false;
    function openPanel() {
      panel.classList.add("open");
      launch.classList.add("active");
      if (!greeted) {
        greeted = true;
        addMessage("Hi! I'm <strong>" + BOT_NAME + "</strong>, the Equilynx assistant. Ask me anything about our company, research, consulting services, careers, or how to reach us — or tap a topic below.", "bot");
        addSuggestions(SUGGESTIONS);
      }
      setTimeout(function () {
        input.focus();
      }, 200);
    }
    function closePanel() {
      panel.classList.remove("open");
      launch.classList.remove("active");
    }

    launch.addEventListener("click", function () {
      if (panel.classList.contains("open")) closePanel();
      else openPanel();
    });
    panel.querySelector(".eqx-bot-close").addEventListener("click", closePanel);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleQuery(input.value);
      input.value = "";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
