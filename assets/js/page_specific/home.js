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
            }, 10);
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
});
