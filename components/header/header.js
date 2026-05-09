(function () {
  function initializeHeader() {
    const header = document.querySelector(".site-header");
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (!header || !mobileMenuToggle || !mainNav) {
      return;
    }

    if (header.dataset.initialized === "true") {
      return;
    }
    header.dataset.initialized = "true";

    let menuOverlay = document.querySelector(".menu-overlay");
    if (!menuOverlay) {
      menuOverlay = document.createElement("div");
      menuOverlay.className = "menu-overlay";
      document.body.appendChild(menuOverlay);
    }

    const navLinks = Array.from(document.querySelectorAll(".nav-links a"));

    function setMenuState(isOpen) {
      mobileMenuToggle.classList.toggle("active", isOpen);
      mainNav.classList.toggle("active", isOpen);
      menuOverlay.classList.toggle("active", isOpen);
      document.body.classList.toggle("nav-open", isOpen);
      mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
      mobileMenuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );
    }

    function markCurrentPage() {
      const currentPath = window.location.pathname.replace(
        /\/index\.html$/,
        "/",
      );

      navLinks.forEach((link) => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        const isCurrent =
          currentPath === linkPath ||
          (currentPath.startsWith("/pages/mods/") &&
            linkPath === "/pages/mods.html") ||
          (currentPath.startsWith("/pages/assets/") &&
            linkPath === "/pages/assets.html");

        link.classList.toggle("current-page", isCurrent);
        if (isCurrent) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function handleScroll() {
      header.classList.toggle("scrolled", window.scrollY > 20);
    }

    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenuToggle.addEventListener("click", function () {
      setMenuState(!mainNav.classList.contains("active"));
    });

    menuOverlay.addEventListener("click", function () {
      setMenuState(false);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        setMenuState(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mainNav.classList.contains("active")) {
        setMenuState(false);
        mobileMenuToggle.focus();
      }
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    markCurrentPage();
    handleScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeHeader);
  } else {
    initializeHeader();
  }

  window.initializeHeader = initializeHeader;
})();
