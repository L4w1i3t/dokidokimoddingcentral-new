document.addEventListener("DOMContentLoaded", function () {
  const menuLinks = document.querySelectorAll("#main-menu ul li a");
  const sprite = document.querySelector(".matsu-sprite");
  const tooltip = document.querySelector("#tooltip");
  const bubbleContainer = document.querySelector(".bubble-container");
  const column1 = document.getElementById("column1");
  const column2 = document.getElementById("column2");
  const rerollButton = document.getElementById("reroll-mods");

  if (sprite && tooltip && bubbleContainer) {
    const originalSrc = "assets/sprites/matsu1.webp";
    const hoverSrc = "assets/sprites/matsu2.webp";
    const preloadedImage = new Image();
    preloadedImage.src = hoverSrc;

    // Tooltip content for menu items
    const tooltipTexts = {
      Mods: "Discover a variety of mods for your enjoyment!",
      Assets: "Browse and download assets for your projects!",
      Submissions:
        "Submit your own mods and assets, and share them with the community!",
      Classroom: "Learn about RenPy, DDLC, and modding techniques!",
      About: "Learn more about Doki Doki Modding Central!",
      FAQ: "Find answers to frequently asked questions!",
    };

    // Natural bubble animation system
    function initBubbles() {
      // Keep track of the number of active bubbles
      let activeBubbles = 0;
      const maxBubbles = 25; // Maximum number of bubbles allowed at once

      // Create a new bubble at random intervals
      function createBubble() {
        // Only create a new bubble if we're under the maximum
        if (activeBubbles < maxBubbles) {
          // Create bubble element
          const bubble = document.createElement("div");
          bubble.classList.add("bubble");

          // Random size between 15px and 45px
          const size = Math.random() * 30 + 15;
          bubble.style.width = `${size}px`;
          bubble.style.height = `${size}px`;

          // Random horizontal position within the column
          const columnWidth = column2.offsetWidth;
          const left = Math.random() * (columnWidth - size);
          bubble.style.left = `${left}px`;

          // Start from below the visible area
          bubble.style.bottom = `-${size}px`;

          // Random opacity between 0.7 and 1
          const opacity = Math.random() * 0.3 + 0.7;
          bubble.style.opacity = opacity;

          // Add to container
          bubbleContainer.appendChild(bubble);
          activeBubbles++;

          // Calculate animation properties
          const speed = Math.random() * 8 + 12; // Speed in seconds (12-20s)
          const columnHeight = column2.offsetHeight;

          // Animate the bubble rising
          const startTime = performance.now();
          const totalDistance = columnHeight + size * 2; // Total distance to travel

          function animateBubble(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = elapsedTime / (speed * 1000); // Convert to seconds

            if (progress < 1) {
              // Move bubble upward
              const currentPos = totalDistance * progress;
              bubble.style.transform = `translateY(-${currentPos}px)`;

              // Fade out near the end
              if (progress > 0.7) {
                const fadeOutProgress = (progress - 0.7) / 0.3;
                bubble.style.opacity = opacity * (1 - fadeOutProgress);
              }

              // Continue animation
              requestAnimationFrame(animateBubble);
            } else {
              // Remove bubble when animation completes
              if (bubble && bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
                activeBubbles--;
              }
            }
          }

          // Start the animation
          requestAnimationFrame(animateBubble);
        }

        // Schedule next bubble creation with random timing
        const nextBubbleTime = Math.random() * 800 + 200; // 200-1000ms
        setTimeout(createBubble, nextBubbleTime);
      }

      // Start creating bubbles
      createBubble();
    }

    // Initialize natural bubble system
    initBubbles();

    // Logo subtle interactive movement
    const logo = document.getElementById("site-logo");
    if (logo) {
      document.addEventListener("mousemove", (e) => {
        const xPos = (e.clientX / window.innerWidth - 0.5) * 8;
        const yPos = (e.clientY / window.innerHeight - 0.5) * 8;
        logo.style.transform = `rotate(${xPos}deg) translateX(${xPos}px) translateY(${yPos}px)`;
      });
    }

    // Menu hover effects
    menuLinks.forEach((link) => {
      const linkText = link.textContent;

      link.addEventListener("mouseenter", () => {
        // Update tooltip content
        tooltip.textContent = tooltipTexts[linkText];

        // Position tooltip above Matsuda's head based on current viewport
        const columnRect = column1.getBoundingClientRect();
        tooltip.style.left = `${columnRect.width / 2}px`;
        tooltip.style.top = `${columnRect.height * 0.15}px`;

        // Show tooltip
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translateX(-50%) translateY(0)";

        // Change sprite image on hover
        sprite.src = hoverSrc;
      });

      link.addEventListener("mouseleave", () => {
        // Hide tooltip
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translateX(-50%) translateY(20px)";

        // Change sprite image back to original
        sprite.src = originalSrc;
      });
    });

    // Handle mod reroll functionality
    if (rerollButton) {
      rerollButton.addEventListener("click", function () {
        // Add spinning animation class
        rerollButton.classList.add("spinning");

        // Call the loadRandomMods function to refresh mods
        loadRandomMods();

        // Remove spinning class after animation completes
        setTimeout(() => {
          rerollButton.classList.remove("spinning");
        }, 800);
      });
    }
  }

  // Initialize the randomized mod showcase
  loadRandomMods();
});

/**
 * Loads random mods from the JSON data and displays them in the showcase
 */
function loadRandomMods() {
  const showcaseElement = document.getElementById("showcase");

  if (!showcaseElement) return;

  // Preload all images before showing them, with fallback to placeholder
  const preloadImages = (imageUrls) => {
    return Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ url, success: true });
          img.onerror = () => resolve({ url, success: false });
          img.src = url;
        });
      }),
    );
  };

  fetch("data/mods_exp.json")
    .then((response) => response.json())
    .then((data) => {
      // Combine mods from different categories
      let allMods = [];

      // Include all five categories and add category identifier to each mod
      if (data.standard) {
        data.standard.forEach((mod) => (mod._cat = "standard"));
        allMods = allMods.concat(data.standard);
      }
      if (data.android) {
        data.android.forEach((mod) => (mod._cat = "android"));
        allMods = allMods.concat(data.android);
      }
      if (data.demos) {
        data.demos.forEach((mod) => (mod._cat = "demos"));
        allMods = allMods.concat(data.demos);
      }
      if (data.videos) {
        data.videos.forEach((mod) => (mod._cat = "videos"));
        allMods = allMods.concat(data.videos);
      }
      if (data.archive) {
        data.archive.forEach((mod) => (mod._cat = "archive"));
        allMods = allMods.concat(data.archive);
      }

      // If no mods available, show message
      if (allMods.length === 0) {
        showcaseElement.innerHTML = '<p class="no-mods">No mods available</p>';
        showcaseElement.classList.add("loaded");
        return;
      }

      // Shuffle mods for randomization
      const shuffledMods = shuffleArray(allMods);

      // Take 8 random mods (or fewer if not enough) for 2x4 grid
      const modsToShow = shuffledMods.slice(0, 8);

      // Get all image URLs for preloading
      const imageUrls = modsToShow.map(
        (mod) => mod.imageUrl || "assets/gui/default_mod.webp",
      );

      // Preload images then show the grid
      preloadImages(imageUrls)
        .then((results) => {
          // Clear existing content
          showcaseElement.innerHTML = "";

          // Add mods to showcase
          modsToShow.forEach((mod, index) => {
            const showcaseItem = document.createElement("a");
            // Get the category from the mod or use default
            const category = mod._cat || "standard";
            const route = mod.route || "";

            // Only create links for mods with valid routes
            if (route) {
              showcaseItem.href = `pages/mods/mod.html?cat=${category}&route=${route}`;
              showcaseItem.classList.add("showcase-item");

              const imageUrl = mod.imageUrl || "assets/gui/default_mod.webp";
              const imageLoadSuccess = results[index]?.success;
              
              // Use placeholder if image failed to load
              const finalImageUrl = imageLoadSuccess ? imageUrl : "assets/images/mod-placeholder.svg";
              
              // Show image and title underneath
              showcaseItem.innerHTML = `
                <img src="${finalImageUrl}" alt="${mod.title}" class="showcase-img" onerror="this.src='assets/images/mod-placeholder.svg'">
                <span class="showcase-title">${mod.title}</span>
              `;

              showcaseElement.appendChild(showcaseItem);

              // Add animation class with delay after element is added to DOM
              setTimeout(() => {
                showcaseItem.classList.add("animate-in");
              }, 100 + (index * 50)); // Stagger the animation
            }
          });

          // Show the grid after all items are added
          setTimeout(() => {
            showcaseElement.classList.add("loaded");
          }, 50);
        })
        .catch((error) => {
          console.error("Error loading showcase:", error);
          showcaseElement.innerHTML =
            '<p class="no-mods">Failed to load mods</p>';
          showcaseElement.classList.add("loaded");
        });
    })
    .catch((error) => {
      console.error("Error loading mods for showcase:", error);
      showcaseElement.innerHTML = '<p class="no-mods">Failed to load mods</p>';
      showcaseElement.classList.add("loaded");
    });
}

/**
 * Shuffles an array using the Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
