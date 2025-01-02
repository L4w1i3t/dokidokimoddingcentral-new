// header.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("header.js has loaded successfully.");
  
    // Grab references to the hamburger & nav
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
  
    // Sanity checks
    if (!hamburgerBtn) {
      console.warn("Could not find element with ID 'hamburgerBtn'.");
      return;
    }
    if (!navLinks) {
      console.warn("Could not find element with ID 'navLinks'.");
      return;
    }
  
    // Attach the click event
    hamburgerBtn.addEventListener('click', () => {
      console.log("Hamburger button clicked!");
      navLinks.classList.toggle('nav-open');
    });
  });
  