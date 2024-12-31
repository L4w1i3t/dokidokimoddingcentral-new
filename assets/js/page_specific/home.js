document.addEventListener("DOMContentLoaded", function() {
    const menuLinks = document.querySelectorAll("#main-menu ul li a");
    const sprite = document.querySelector(".matsu-sprite");
    const tooltip = document.querySelector("#tooltip");
    const bubbleContainer = document.querySelector(".bubble-container"); // Select the bubble container
  
    if (sprite && tooltip && bubbleContainer) {
      const originalSrc = "assets/sprites/matsu1.webp";
      const hoverSrc = "assets/sprites/matsu2.webp";
      const preloadedImage = new Image();
      preloadedImage.src = hoverSrc;
  
      const tooltipTexts = {
        "Mods": "Discover a variety of mods to your enjoyment!",
        "Submissions": "Submit your own mods and assets, and share them with the community!",
        "Assets": "Browse and download assets for your projects!",
        "Classroom": "Join our classroom to learn about RenPy, DDLC, and modding!",
        "About": "Learn more about Doki Doki Modding Central!",
        "FAQ": "Find answers to frequently asked questions!"
      };
  
      let typingInterval = null; // Store the interval ID
      let tooltipTimeout = null; // Store the timeout ID for hiding the tooltip
  
      /**
       * Clears any existing typing interval and tooltip timeout.
       */
      const clearExistingTimers = () => {
        if (typingInterval) {
          clearInterval(typingInterval);
          typingInterval = null;
        }
        if (tooltipTimeout) {
          clearTimeout(tooltipTimeout);
          tooltipTimeout = null;
        }
      };
  
      /**
       * Types out the provided text into the tooltip element.
       * @param {string} text - The text to type out.
       */
      const typeText = (text) => {
        clearExistingTimers(); // Ensure no overlapping intervals
        let index = 0;
        tooltip.textContent = '';
        tooltip.style.display = 'block';
        tooltip.classList.remove('hide');
        tooltip.classList.add('show');
  
        typingInterval = setInterval(() => {
          if (index < text.length) {
            tooltip.textContent += text.charAt(index);
            index++;
          } else {
            clearExistingTimers();
          }
        }, 40); // Typing speed
      };
  
      /**
       * Handles the mouse enter and focus events on menu links.
       * @param {Event} event - The event object.
       */
      const handleMouseEnter = (event) => {
        sprite.src = hoverSrc;
        const menuItem = event.target.textContent.trim();
        const tooltipText = tooltipTexts[menuItem] || `Information about ${menuItem}`;
        typeText(tooltipText);
      };
  
      /**
       * Handles the mouse leave and blur events on menu links.
       */
      const handleMouseLeave = () => {
        sprite.src = originalSrc;
        clearExistingTimers(); // Stop typing and clear timeouts
        tooltip.textContent = ''; // Clear the text immediately
        tooltip.classList.remove('show');
        tooltip.classList.add('hide');
  
        // Set a timeout to hide the tooltip after a brief delay
        tooltipTimeout = setTimeout(() => {
          tooltip.style.display = 'none';
        }, 500); // Match the transition duration in CSS
      };
  
      // Attach event listeners to each menu link
      menuLinks.forEach(link => {
        link.addEventListener("mouseenter", handleMouseEnter);
        link.addEventListener("mouseleave", handleMouseLeave);
        link.addEventListener("focus", handleMouseEnter);
        link.addEventListener("blur", handleMouseLeave);
      });
  
      // Bubble Effect Implementation
      const MAX_BUBBLES = 30; // Maximum number of bubbles on screen
  
      const createBubble = () => {
        if (bubbleContainer.children.length >= MAX_BUBBLES) return; // Limit the number of bubbles
  
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
  
        // Random size between 10px and 40px
        const size = Math.random() * 30 + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
  
        // Random horizontal position (0% to 100%)
        const position = Math.random() * 100;
        bubble.style.left = `${position}%`;
  
        // Random animation duration between 8s and 20s
        const duration = Math.random() * 12 + 8;
        bubble.style.animationDuration = `${duration}s`;
  
        // Random opacity between 0.5 and 0.7 for variation
        const opacity = Math.random() * 0.2 + 0.5;
        bubble.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
  
        // Append the bubble to the container
        bubbleContainer.appendChild(bubble);
  
        // Remove the bubble after the animation completes to prevent DOM clutter
        bubble.addEventListener('animationend', () => {
          bubble.remove();
        });
      };
  
      // Create bubbles at intervals
      const bubbleInterval = setInterval(createBubble, 1000); // Generate a bubble every 1 second
    } else {
      console.error("Sprite image with class 'matsu-sprite', tooltip with id 'tooltip', or bubble container not found.");
    }
  
    /**************************************************
     * Showcase logic below
     **************************************************/
    const showcaseContainer = document.getElementById('showcase');
    const itemsToShow = 8; // Number of thumbnails to display
  
    fetch('/data/mods.json')
      .then(response => response.json())
      .then(data => {
        // 1) Merge categories into one array,
        //    but store each item’s category in a custom property:
        const combinedMods = [];
  
        function addCategoryMods(array, catName) {
          array.forEach(mod => {
            // Clone or attach category field:
            combinedMods.push({ ...mod, _cat: catName });
          });
        }
  
        addCategoryMods(data.standard, 'standard');
        addCategoryMods(data.archive, 'archive');
        addCategoryMods(data.android, 'android');
        addCategoryMods(data.demos, 'demos');
        addCategoryMods(data.videos, 'videos');
  
        // 2) Randomly pick N items from combined
        const randomMods = getRandomMods(combinedMods, itemsToShow);
  
        // 3) Display them
        displayShowcase(randomMods);
      })
      .catch(error => console.error('Error loading mods:', error));
  
    /**
     * Returns a random subset of `mods` of size `count`.
     */
    function getRandomMods(mods, count) {
      // Shuffle
      const shuffled = mods.sort(() => 0.5 - Math.random());
      // Return the first N
      return shuffled.slice(0, count);
    }
  
    /**
     * Creates mod cards in the #showcase container.
     */
    function displayShowcase(mods) {
      mods.forEach(mod => {
        const modCard = document.createElement('div');
        modCard.classList.add('mod-card');
        modCard.innerHTML = `
          <!-- Link to the single mod.html with correct cat & route -->
          <a href="/pages/mods/mod.html?cat=${mod._cat}&route=${mod.route}">
            <img src="${mod.imageUrl}" alt="${mod.title}" class="mod-image" />
          </a>
        `;
        showcaseContainer.appendChild(modCard);
      });
    }
  });
  