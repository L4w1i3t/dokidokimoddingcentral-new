// Header functionality
function initializeHeader() {
  console.log("Initializing header JS...");

  // Elements
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const body = document.body;

  console.log("Menu toggle element:", mobileMenuToggle); // Debug log

  if (!mobileMenuToggle || !mainNav) {
    console.error("Header elements not found!");
    return;
  }

  // Create overlay element for mobile menu
  const menuOverlay = document.createElement("div");
  menuOverlay.className = "menu-overlay";
  body.appendChild(menuOverlay);

  // Toggle mobile menu
  mobileMenuToggle.addEventListener("click", function () {
    console.log("Mobile menu clicked"); // Debug log
    mobileMenuToggle.classList.toggle("active");
    mainNav.classList.toggle("active");
    menuOverlay.classList.toggle("active");

    // Prevent scrolling when menu is open
    if (mainNav.classList.contains("active")) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
    }
  });

  // Close mobile menu when clicking overlay
  menuOverlay.addEventListener("click", function () {
    mobileMenuToggle.classList.remove("active");
    mainNav.classList.remove("active");
    menuOverlay.classList.remove("active");
    body.style.overflow = "";
  });

  // Close mobile menu when clicking a nav link
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      mobileMenuToggle.classList.remove("active");
      mainNav.classList.remove("active");
      menuOverlay.classList.remove("active");
      body.style.overflow = "";
    });
  });

  // Add active class to current page link
  const currentLocation = window.location.pathname;
  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");
    if (
      currentLocation === linkPath ||
      (currentLocation.includes(linkPath) && linkPath !== "/")
    ) {
      link.classList.add("current-page");
    }
  });

  // Header scroll effect - add background color on scroll
  function handleScroll() {
    const header = document.querySelector(".site-header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll);

  // Initialize scroll state
  handleScroll();

  console.log("Header initialization complete");
}

// Call the initialization function immediately
initializeHeader();

// Also handle DOMContentLoaded in case this script is loaded in the <head>
document.addEventListener("DOMContentLoaded", initializeHeader);

// Make the function available globally so it can be explicitly called
window.initializeHeader = initializeHeader;
