/**
 * Mods Page JavaScript - Handles dynamic mod counter functionality
 * Fetches mods.json data and displays total counts across all categories
 */

document.addEventListener("DOMContentLoaded", function() {
    const totalModCountElement = document.getElementById('totalModCount');
    const categoryBreakdownElement = document.getElementById('categoryBreakdown');
    
    // Category display names and their JSON keys
    const categories = {
        'standard': 'PC Mods',
        'android': 'Android Mods', 
        'demos': 'Demo Mods',
        'videos': 'Video Mods',
        'archive': 'Archived Mods'
    };    /**
     * Fetches mods data and updates the counter display
     */
    async function loadModCounts() {
        try {
            // Show loading state
            showLoadingState();
            
            // Determine which JSON file to use based on current page
            const isExperimental = window.location.pathname.includes('mods_exp.html');
            const jsonFile = isExperimental ? '../data/mods_exp.json' : '../data/mods.json';
            
            // Fetch the mods data
            const response = await fetch(jsonFile);
            if (!response.ok) {
                throw new Error(`Failed to fetch mods data: ${response.status}`);
            }
            
            const modsData = await response.json();
            
            // Calculate counts for each category
            const categoryCounts = {};
            let totalCount = 0;
            
            // Count mods in each category
            Object.keys(categories).forEach(categoryKey => {
                const categoryMods = modsData[categoryKey] || [];
                const count = categoryMods.length;
                categoryCounts[categoryKey] = count;
                totalCount += count;
            });
            
            // Update the display
            updateModCountDisplay(totalCount, categoryCounts);
            
        } catch (error) {
            console.error('Error loading mod counts:', error);
            showErrorState();
        }
    }
    
    /**
     * Shows loading state in the counter
     */
    function showLoadingState() {
        if (totalModCountElement) {
            const countNumber = totalModCountElement.querySelector('.count-number');
            if (countNumber) {
                countNumber.textContent = 'Loading...';
                countNumber.classList.add('loading');
            }
        }
        
        if (categoryBreakdownElement) {
            categoryBreakdownElement.innerHTML = '<div class="loading-categories">Loading category counts...</div>';
        }
    }
    
    /**
     * Shows error state in the counter
     */
    function showErrorState() {
        if (totalModCountElement) {
            const countNumber = totalModCountElement.querySelector('.count-number');
            if (countNumber) {
                countNumber.textContent = 'Error';
                countNumber.classList.remove('loading');
                countNumber.classList.add('error');
            }
        }
        
        if (categoryBreakdownElement) {
            categoryBreakdownElement.innerHTML = '<div class="error-message">Failed to load mod counts</div>';
        }
    }
    
    /**
     * Updates the mod count display with actual data
     * @param {number} totalCount - Total number of mods across all categories
     * @param {Object} categoryCounts - Object containing count for each category
     */
    function updateModCountDisplay(totalCount, categoryCounts) {
        // Update total count
        if (totalModCountElement) {
            const countNumber = totalModCountElement.querySelector('.count-number');
            if (countNumber) {
                countNumber.classList.remove('loading', 'error');
                
                // Animate the number counting up
                animateCounter(countNumber, totalCount);
            }
        }
        
        // Update category breakdown
        if (categoryBreakdownElement) {
            updateCategoryBreakdown(categoryCounts);
        }
    }
    
    /**
     * Animates the counter from 0 to the target number
     * @param {HTMLElement} element - The element to animate
     * @param {number} targetCount - The target number to count to
     */
    function animateCounter(element, targetCount) {
        const duration = 1500; // Animation duration in milliseconds
        const startTime = performance.now();
        const startCount = 0;
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smooth animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(startCount + (targetCount - startCount) * easeProgress);
            
            element.textContent = currentCount.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = targetCount.toLocaleString();
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    /**
     * Updates the category breakdown section
     * @param {Object} categoryCounts - Object containing count for each category
     */
    function updateCategoryBreakdown(categoryCounts) {
        const breakdownHTML = Object.keys(categories)
            .filter(categoryKey => categoryCounts[categoryKey] > 0) // Only show categories with mods
            .map(categoryKey => {
                const displayName = categories[categoryKey];
                const count = categoryCounts[categoryKey];
                
                return `
                    <div class="category-count-item" data-category="${categoryKey}">
                        <span class="category-name">${displayName}</span>
                        <span class="category-count">${count.toLocaleString()}</span>
                    </div>
                `;
            })
            .join('');
        
        categoryBreakdownElement.innerHTML = `
            <h4>Category Breakdown</h4>
            <div class="category-counts">
                ${breakdownHTML}
            </div>
        `;
        
        // Add animation delay to each category item
        const categoryItems = categoryBreakdownElement.querySelectorAll('.category-count-item');
        categoryItems.forEach((item, index) => {
            item.style.animationDelay = `${0.2 + (index * 0.1)}s`;
            item.classList.add('fade-in');
        });
    }
    
    /**
     * Adds click handlers to category items for navigation
     */
    function addCategoryClickHandlers() {
        if (categoryBreakdownElement) {
            categoryBreakdownElement.addEventListener('click', (event) => {
                const categoryItem = event.target.closest('.category-count-item');
                if (categoryItem) {
                    const category = categoryItem.dataset.category;
                    navigateToCategory(category);
                }
            });
        }
    }
      /**
     * Navigates to the appropriate category page
     * @param {string} category - The category to navigate to
     */
    function navigateToCategory(category) {
        const categoryPages = {
            'standard': 'mods/standard.html',
            'android': 'mods/android.html',
            'demos': 'mods/demos.html',
            'videos': 'mods/videos.html',
            'archive': 'mods/archive.html'
        };
        
        const targetPage = categoryPages[category];
        if (targetPage) {
            // Add experimental parameter if we're on the experimental page
            const isExperimental = window.location.pathname.includes('mods_exp.html');
            const url = isExperimental ? `${targetPage}?exp=true` : targetPage;
            window.location.href = url;
        }
    }
    
    // Initialize the mod counter
    loadModCounts();
    addCategoryClickHandlers();
});
