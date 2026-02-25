const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Skeleton loader: brief shimmer for reviews
window.addEventListener("load", () => {
  setTimeout(() => document.body.classList.remove("loading"), 650);
});

/* =====================================================
   MOBILE NAV (UPDATED):
   - ☰ swaps to ✕ when open
   - adds dim + blur backdrop
   - auto closes on link click
   - closes on backdrop click, ESC, and desktop resize
   ===================================================== */
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("[data-nav]");

// create backdrop once (no HTML needed)
let backdrop = document.querySelector(".nav-backdrop");
if (!backdrop) {
  backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  document.body.appendChild(backdrop);
}

function openMenu() {
  if (!nav || !toggle) return;
  nav.classList.add("open");
  document.body.classList.add("menu-open");

  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", "Close menu");
  toggle.textContent = "✕";
}

function closeMenu() {
  if (!nav || !toggle) return;
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");

  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
  toggle.textContent = "☰";
}

if (toggle && nav) {
  // initial icon
  toggle.textContent = "☰";

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });

  // Auto-close when clicking any nav link
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeMenu();
  });

  // Close when clicking outside (backdrop)
  backdrop.addEventListener("click", closeMenu);

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // If resized to desktop, force close
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

// FAQ: keep only one open at a time
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
  });
});

// Button click: flash blue briefly
document.querySelectorAll(".btn").forEach((b) => {
  b.addEventListener("click", () => {
    b.classList.add("clicked");
    setTimeout(() => b.classList.remove("clicked"), 220);
  });
});

// Pricing micro-interaction + preselect service + scroll to booking
const planButtons = document.querySelectorAll(".plan-btn");
const priceCards = document.querySelectorAll(".price");
const serviceSelect = document.getElementById("serviceSelect");

function selectPlan(planName) {
  priceCards.forEach(c => c.classList.remove("selected"));
  const card = document.querySelector(`.price[data-plan="${planName}"]`);
  if (card) {
    card.classList.add("selected");
    // little “pulse” feel
    card.animate(
      [{ transform: "translateY(-2px)" }, { transform: "translateY(-6px)" }, { transform: "translateY(-4px)" }],
      { duration: 260, easing: "ease-out" }
    );
  }
}

planButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const plan = btn.dataset.plan;
    const service = btn.dataset.service;
    if (plan) selectPlan(plan);

    if (serviceSelect && service) {
      // set service if option exists
      const options = Array.from(serviceSelect.options).map(o => o.textContent.trim());
      const idx = options.indexOf(service);
      if (idx !== -1) serviceSelect.selectedIndex = idx;
    }
  });
});

// Also allow selecting by clicking the whole card (nice UX)
priceCards.forEach(card => {
  card.addEventListener("click", (e) => {
    // avoid double-trigger when clicking the button itself
    if (e.target.closest(".plan-btn")) return;
    const plan = card.dataset.plan;
    if (plan) selectPlan(plan);
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Booking modal (replaces alert)
const form = document.querySelector("#booking");
const modal = document.getElementById("successModal");
const summary = document.getElementById("modalSummary");
let lastFocusedEl = null;

function openModal(data) {
  if (!modal || !summary) return;

  summary.innerHTML = `
    <div class="summary-item"><strong>Name</strong><span>${escapeHtml(data.name || "")}</span></div>
    <div class="summary-item"><strong>Phone</strong><span>${escapeHtml(data.phone || "")}</span></div>
    <div class="summary-item"><strong>Pickup date</strong><span>${escapeHtml(data.date || "")}</span></div>
    <div class="summary-item"><strong>Service</strong><span>${escapeHtml(data.service || "")}</span></div>
  `;

  lastFocusedEl = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  // focus close button
  const closeBtn = modal.querySelector("[data-close]");
  closeBtn?.focus();

  // lock scroll
  document.documentElement.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  document.documentElement.style.overflow = "";

  if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
    lastFocusedEl.focus();
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    openModal(data);
    form.reset();
    // keep service selection reset to default
    if (serviceSelect) serviceSelect.selectedIndex = 0;
  });
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll(
  ".card, .price, .cta-box, .faq-item, .stat, .review-card, .strip-item, .hero-card"
);
revealEls.forEach(el => el.classList.add("reveal"));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));
