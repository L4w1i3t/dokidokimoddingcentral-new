// filepath: c:\Users\clmel\Desktop\Programming\LARGE SCALE PROJECTS\WEBSITES\Doki-Doki-Modding-Central\DDMC\assets\js\page_specific\gui-assets.js
document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const ITEMS_PER_PAGE = 9;
    const TARGET_ASPECT_RATIO = 16 / 9; // Standard 16:9 aspect ratio

    // State variables
    let guiData = [];
    let filteredGuiData = [];
    let currentGuiPage = 1;
    let totalGuiPages = 1;
    let guiCategories = new Set();
    let currentGuiCategory = 'all'; // Track current GUI category filter selection

    // DOM Elements
    // GUI elements
    const guiSearch = document.getElementById('gui-search');
    const guiSearchBtn = document.getElementById('gui-search-button');
    const guiCategoryFilter = document.getElementById('gui-category-filter');
    const guiGrid = document.getElementById('gui-grid');
    const guiPrevBtn = document.getElementById('gui-prev-page');
    const guiNextBtn = document.getElementById('gui-next-page');
    const guiPageInfo = document.getElementById('gui-page-info');

    // Modal elements
    let previewModal;
    let modalImage;
    let modalCaption;
    let closeModalBtn;

    // Initialize preview modal
    function initPreviewModal() {
        // Create modal if it doesn't exist
        if (!document.querySelector('.preview-modal')) {
            // Create modal container
            previewModal = document.createElement('div');
            previewModal.className = 'preview-modal';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            // Create image element
            modalImage = document.createElement('img');
            modalContent.appendChild(modalImage);
            
            // Create close button
            closeModalBtn = document.createElement('button');
            closeModalBtn.className = 'close-modal';
            closeModalBtn.innerHTML = '×';
            modalContent.appendChild(closeModalBtn);
            
            // Create caption
            modalCaption = document.createElement('div');
            modalCaption.className = 'modal-caption';
            
            // Add elements to modal
            previewModal.appendChild(modalContent);
            previewModal.appendChild(modalCaption);
            
            // Add modal to body
            document.body.appendChild(previewModal);
            
            // Add event listener to close button
            closeModalBtn.addEventListener('click', function() {
                previewModal.classList.remove('active');
            });
            
            // Also close when clicking outside the image
            previewModal.addEventListener('click', function(e) {
                if (e.target === previewModal) {
                    previewModal.classList.remove('active');
                }
            });
            
            // Add keyboard support (Escape key to close)
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && previewModal.classList.contains('active')) {
                    previewModal.classList.remove('active');
                }
            });
        } else {
            // Elements already exist, get references
            previewModal = document.querySelector('.preview-modal');
            modalImage = previewModal.querySelector('img');
            modalCaption = previewModal.querySelector('.modal-caption');
            closeModalBtn = previewModal.querySelector('.close-modal');
        }
    }

    // Function to open preview modal
    function openPreviewModal(imgSrc, caption) {
        modalImage.src = imgSrc;
        modalCaption.textContent = caption;
        previewModal.classList.add('active');
    }

    // Fetch GUI data from JSON file
    async function fetchGuiData() {
        try {
            const response = await fetch('/data/gui.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            guiData = data.gui || [];
            
            // Extract all unique categories for filtering
            guiData.forEach(item => {
                if (item.category) {
                    guiCategories.add(item.category);
                }
                if (item.keywords) {
                    const keywords = typeof item.keywords === 'string' 
                        ? item.keywords.split(',').map(k => k.trim()) 
                        : item.keywords;
                    
                    if (Array.isArray(keywords)) {
                        keywords.forEach(keyword => {
                            if (keyword) guiCategories.add(keyword.trim());
                        });
                    }
                }
            });
            
            // Update category filter options
            updateGuiCategoryOptions();
            
            // Initialize data display
            filteredGuiData = [...guiData];
            updateGuiPagination();
            displayGuiElements(1);
        } catch (error) {
            console.error('Error fetching GUI data:', error);
            guiGrid.innerHTML = '<div class="no-results"><p>Failed to load GUI elements. Please try again later.</p></div>';
        }
    }

    // Update GUI category filter options
    function updateGuiCategoryOptions() {
        // Clear existing options except "All Categories"
        while (guiCategoryFilter.options.length > 1) {
            guiCategoryFilter.remove(1);
        }
        
        // Add options for each category
        Array.from(guiCategories).sort().forEach(category => {
            if (category !== 'all' && category !== '') {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                guiCategoryFilter.appendChild(option);
            }
        });
    }

    // Filter GUI elements based on search term and category
    function filterGuiElements() {
        const searchTerm = guiSearch.value.toLowerCase().trim();
        const selectedCategory = guiCategoryFilter.value;
        
        // Track current selection
        currentGuiCategory = selectedCategory;
        
        filteredGuiData = guiData.filter(item => {
            // Category filter
            let categoryMatch = selectedCategory === 'all';
            
            if (!categoryMatch && item.category) {
                categoryMatch = item.category.toLowerCase() === selectedCategory.toLowerCase();
            }
            
            if (!categoryMatch && item.keywords) {
                const keywords = typeof item.keywords === 'string' 
                    ? item.keywords.split(',').map(k => k.trim()) 
                    : item.keywords;
                
                if (Array.isArray(keywords)) {
                    categoryMatch = keywords.some(keyword => 
                        keyword && keyword.toLowerCase() === selectedCategory.toLowerCase()
                    );
                }
            }
            
            // Search term filter
            const nameMatch = item.name && item.name.toLowerCase().includes(searchTerm);
            const authorMatch = item.author && item.author.toLowerCase().includes(searchTerm);
            const keywordsMatch = item.keywords && 
                (typeof item.keywords === 'string' 
                    ? item.keywords.toLowerCase().includes(searchTerm)
                    : Array.isArray(item.keywords) && item.keywords.some(k => 
                        k && k.toLowerCase().includes(searchTerm)
                    )
                );
            
            const searchMatch = !searchTerm || nameMatch || authorMatch || keywordsMatch;
            
            return categoryMatch && searchMatch;
        });
        
        // Reset to first page and update display
        currentGuiPage = 1;
        updateGuiPagination();
        displayGuiElements(1);
    }

    // Display GUI elements for the specified page
    function displayGuiElements(page) {
        // Show loading state
        guiGrid.classList.add('refreshing');
        
        // Calculate start and end indices for the current page
        const startIdx = (page - 1) * ITEMS_PER_PAGE;
        const endIdx = startIdx + ITEMS_PER_PAGE;
        const pageData = filteredGuiData.slice(startIdx, endIdx);
        
        // Clear the current grid
        guiGrid.innerHTML = '';
        
        // If no results, show a message
        if (pageData.length === 0) {
            guiGrid.innerHTML = '<div class="no-results"><p>No GUI elements found matching your criteria.</p></div>';
            setTimeout(() => {
                guiGrid.classList.remove('refreshing');
            }, 300);
            return;
        }
        
        // Create a card for each GUI element
        pageData.forEach(item => {
            const guiCard = document.createElement('div');
            guiCard.className = 'gui-card';
            guiCard.setAttribute('data-id', item.id);
            
            // Default image or actual image
            const imagePath = item.file ? `/data/gui/${item.file}` : '/assets/gui/default.webp';
            
            // Display keywords/category
            const categories = item.keywords 
                ? (typeof item.keywords === 'string' 
                    ? item.keywords 
                    : (Array.isArray(item.keywords) ? item.keywords.join(', ') : ''))
                : (item.category || 'General');
            
            guiCard.innerHTML = `
                <div class="gui-preview">
                    <img src="${imagePath}" alt="${item.name}" loading="lazy">
                </div>
                <div class="gui-details">
                    <h3>${item.name || 'Untitled GUI'}</h3>
                    <div class="gui-meta">
                        <span class="gui-author">By: ${item.author || 'Unknown'}</span>
                        <span class="gui-category">${categories}</span>
                        <span class="gui-resolution">Loading...</span>
                    </div>
                    <div class="art-controls">
                        <button class="preview-button" data-img="${imagePath}" data-name="${item.name || 'Untitled'}">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                            Preview
                        </button>                        <a href="${item.downloadUrl || imagePath}" class="download-button" download>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Download
                        </a>
                    </div>
                </div>
            `;
            
            guiGrid.appendChild(guiCard);
            
            // Add event listener for preview button
            const previewBtn = guiCard.querySelector('.preview-button');
            previewBtn.addEventListener('click', () => {
                openPreviewModal(previewBtn.getAttribute('data-img'), previewBtn.getAttribute('data-name'));
            });

            // Handle image resolution detection
            const imgElement = guiCard.querySelector('.gui-preview img');
            imgElement.onload = function() {
                const imgWidth = this.naturalWidth;
                const imgHeight = this.naturalHeight;
                
                // Store resolution data on image
                imgElement.setAttribute('data-resolution', `${imgWidth}x${imgHeight}`);
                
                // Update resolution text
                const resSpan = guiCard.querySelector('.gui-resolution');
                if (resSpan) {
                    resSpan.textContent = `${imgWidth}x${imgHeight}`;
                }
                
                // Apply appropriate object-fit style based on aspect ratio
                const imgAspectRatio = imgWidth / imgHeight;
                if (Math.abs(imgAspectRatio - TARGET_ASPECT_RATIO) > 0.1) {
                    // Non-standard aspect ratio - apply cropping
                    imgElement.style.objectFit = 'cover';
                    imgElement.style.objectPosition = 'center';
                } else {
                    // Standard aspect ratio - cover but maintain proportions
                    imgElement.style.objectFit = 'cover';
                }
            };
            
            // Handle error if image doesn't load
            imgElement.onerror = function() {
                const resSpan = guiCard.querySelector('.gui-resolution');
                if (resSpan) {
                    resSpan.textContent = 'Unknown';
                }
            };            // Disable download button if there's no download URL or file
            const downloadBtn = guiCard.querySelector('.download-button');
            if (!item.downloadUrl && !item.file) {
                downloadBtn.style.pointerEvents = 'none';
                downloadBtn.style.opacity = '0.5';
                downloadBtn.removeAttribute('download');
                downloadBtn.removeAttribute('href');
                downloadBtn.title = 'Download not available';
            } else if (item.downloadUrl) {
                // If we have a specific download URL, use it
                downloadBtn.href = item.downloadUrl;
                downloadBtn.title = `Download ${item.name}`;
            }
        });
        
        // Remove loading state
        setTimeout(() => {
            guiGrid.classList.remove('refreshing');
        }, 300);
    }

    // Update pagination information and button states
    function updateGuiPagination() {
        totalGuiPages = Math.max(1, Math.ceil(filteredGuiData.length / ITEMS_PER_PAGE));
        currentGuiPage = Math.min(currentGuiPage, totalGuiPages);
        
        guiPageInfo.textContent = `Page ${currentGuiPage} of ${totalGuiPages}`;
        guiPrevBtn.disabled = currentGuiPage <= 1;
        guiNextBtn.disabled = currentGuiPage >= totalGuiPages;
    }

    // Go to previous page
    function goToPrevGuiPage() {
        if (currentGuiPage > 1) {
            currentGuiPage--;
            displayGuiElements(currentGuiPage);
            updateGuiPagination();
        }
    }

    // Go to next page
    function goToNextGuiPage() {
        if (currentGuiPage < totalGuiPages) {
            currentGuiPage++;
            displayGuiElements(currentGuiPage);
            updateGuiPagination();
        }
    }

    // Initialize the application
    function init() {
        // Initialize modal
        initPreviewModal();
        
        // Fetch data
        fetchGuiData();
        
        // Add event listeners for GUI search and filter
        guiSearchBtn.addEventListener('click', filterGuiElements);
        guiSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterGuiElements();
            }
        });
        guiCategoryFilter.addEventListener('change', function() {
            // Update the display of the select element itself
            this.selectedIndex = this.selectedIndex;
            
            // Add brief highlight effect for visual feedback
            if (this.value === 'all') {
                guiGrid.classList.add('refreshing');
                setTimeout(() => {
                    filterGuiElements();
                    // Ensure dropdown shows current selection after filtering
                    guiCategoryFilter.value = currentGuiCategory;
                }, 100);
            } else {
                filterGuiElements();
                // Ensure dropdown shows current selection after filtering
                guiCategoryFilter.value = currentGuiCategory;
            }
        });
        
        // Add pagination event listeners
        guiPrevBtn.addEventListener('click', goToPrevGuiPage);
        guiNextBtn.addEventListener('click', goToNextGuiPage);
    }

    // Start the app
    init();
});
