document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const ITEMS_PER_PAGE = 9;
    const TARGET_ASPECT_RATIO = 16 / 9; // Standard 16:9 aspect ratio

    // State variables
    let bgData = [];
    let cgData = [];
    let filteredBgData = [];
    let filteredCgData = [];
    let currentBgPage = 1;
    let currentCgPage = 1;
    let totalBgPages = 1;
    let totalCgPages = 1;
    let bgCategories = new Set();
    let cgCharacters = new Set();
    let currentBgCategory = 'all'; // Track current BG category filter selection
    let currentCgCharacter = 'all'; // Track current CG character filter selection

    // DOM Elements
    const subcategoryBtns = document.querySelectorAll('.subcategory-btn');
    const assetSections = document.querySelectorAll('.asset-section');
    
    // BG elements
    const bgSearch = document.getElementById('bg-search');
    const bgSearchBtn = document.getElementById('bg-search-button');
    const bgCategoryFilter = document.getElementById('bg-category-filter');
    const bgGrid = document.getElementById('bg-grid');
    const bgPrevBtn = document.getElementById('bg-prev-page');
    const bgNextBtn = document.getElementById('bg-next-page');
    const bgPageInfo = document.getElementById('bg-page-info');

    // CG elements
    const cgSearch = document.getElementById('cg-search');
    const cgSearchBtn = document.getElementById('cg-search-button');
    const cgCharacterFilter = document.getElementById('cg-character-filter');
    const cgGrid = document.getElementById('cg-grid');
    const cgPrevBtn = document.getElementById('cg-prev-page');
    const cgNextBtn = document.getElementById('cg-next-page');
    const cgPageInfo = document.getElementById('cg-page-info');

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

    // Fetch art data
    function fetchArtData() {
        fetch('/data/art.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load art data');
                }
                return response.json();
            })
            .then(data => {
                // Process all art data
                const allArtData = data.art || [];
                
                // Split into BG and CG categories
                bgData = allArtData.filter(item => item.type === 'BG');
                cgData = allArtData.filter(item => item.type === 'CG');
                
                // Extract categories and characters for filter dropdowns
                extractCategories();
                
                filteredBgData = [...bgData];
                filteredCgData = [...cgData];
                
                totalBgPages = Math.ceil(filteredBgData.length / ITEMS_PER_PAGE);
                totalCgPages = Math.ceil(filteredCgData.length / ITEMS_PER_PAGE);
                
                // Populate filter dropdowns with extracted categories
                populateFilterDropdowns();
                
                renderBgGrid();
                renderCgGrid();
                updateBgPagination();
                updateCgPagination();
            })
            .catch(error => {
                console.error('Error loading art data:', error);
                bgGrid.innerHTML = `
                    <div class="no-results">
                        <p>Failed to load background images. Please try again later.</p>
                    </div>
                `;
                cgGrid.innerHTML = `
                    <div class="no-results">
                        <p>Failed to load CG images. Please try again later.</p>
                    </div>
                `;
                
                // Even on error, set up empty arrays so filters work
                bgData = [];
                cgData = [];
                filteredBgData = [];
                filteredCgData = [];
                
                // Still attempt to set up the UI
                extractCategories();
                populateFilterDropdowns();
            });
    }

    // Extract unique categories and characters from data
    function extractCategories() {
        bgCategories.clear();
        cgCharacters.clear();
        
        // For background categories
        bgData.forEach(item => {
            if (item.keywords && Array.isArray(item.keywords)) {
                item.keywords.forEach(keyword => {
                    if (keyword) bgCategories.add(keyword.trim());
                });
            } else if (item.category) {
                bgCategories.add(item.category.trim());
            }
        });
        
        // For character CGs
        cgData.forEach(item => {
            if (item.keywords && Array.isArray(item.keywords)) {
                item.keywords.forEach(keyword => {
                    if (keyword) cgCharacters.add(keyword.trim());
                });
            } else if (item.character) {
                cgCharacters.add(item.character.trim());
            }
        });
    }    // Populate filter dropdowns with extracted categories
    function populateFilterDropdowns() {
        const bgCategoryFilter = document.getElementById('bg-category-filter');
        const cgCharacterFilter = document.getElementById('cg-character-filter');
        
        if (!bgCategoryFilter || !cgCharacterFilter) return;
        
        // Save current selections before clearing
        const savedBgCategory = bgCategoryFilter.value || currentBgCategory || 'all';
        const savedCgCharacter = cgCharacterFilter.value || currentCgCharacter || 'all';
        
        // Clear existing options
        bgCategoryFilter.innerHTML = '';
        cgCharacterFilter.innerHTML = '';
        
        // Add "all" option
        bgCategoryFilter.appendChild(new Option('All Categories', 'all'));
        cgCharacterFilter.appendChild(new Option('All Characters', 'all'));
        
        // Add bg categories
        Array.from(bgCategories).sort().forEach(category => {
            if (category !== 'All' && category !== '') {
                bgCategoryFilter.appendChild(new Option(category, category));
            }
        });
        
        // Add cg characters
        Array.from(cgCharacters).sort().forEach(character => {
            if (character !== 'All' && character !== '') {
                cgCharacterFilter.appendChild(new Option(character, character));
            }
        });
          // Restore previous selections if they exist in the new options
        if (savedBgCategory && Array.from(bgCategoryFilter.options).some(opt => opt.value === savedBgCategory)) {
            bgCategoryFilter.value = savedBgCategory;
            currentBgCategory = savedBgCategory;
        } else {
            currentBgCategory = 'all';
        }
        
        if (savedCgCharacter && Array.from(cgCharacterFilter.options).some(opt => opt.value === savedCgCharacter)) {
            cgCharacterFilter.value = savedCgCharacter;
            currentCgCharacter = savedCgCharacter;
        } else {
            currentCgCharacter = 'all';
        }
    }

    // Tab switching functionality
    subcategoryBtns.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            
            // Update active button state
            subcategoryBtns.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section, hide others
            assetSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Detect image resolution and update card with proper dimensions
    function handleImageResolution(imgElement, container) {
        imgElement.onload = function() {
            const imgWidth = this.naturalWidth;
            const imgHeight = this.naturalHeight;
            const imgAspectRatio = imgWidth / imgHeight;
            
            // Store resolution data on image
            imgElement.setAttribute('data-resolution', `${imgWidth}x${imgHeight}`);
            
            // Find the resolution span in the parent card and update it
            const card = container.closest('.art-card');
            if (card) {
                const resSpan = card.querySelector('.art-resolution');
                if (resSpan) {
                    resSpan.textContent = `${imgWidth}x${imgHeight}`;
                }
            }
            
            // Apply appropriate object-fit style based on aspect ratio
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
            // Set default resolution text
            const card = container.closest('.art-card');
            if (card) {
                const resSpan = card.querySelector('.art-resolution');
                if (resSpan) {
                    resSpan.textContent = 'Unknown';
                }
            }
        };
    }    // Render BG grid
    function renderBgGrid() {
        const startIndex = (currentBgPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const itemsToShow = filteredBgData.slice(startIndex, endIndex);
        
        // Add visual refresh indicator
        bgGrid.classList.add('refreshing');
        setTimeout(() => {
            bgGrid.classList.remove('refreshing');
        }, 300);
        
        bgGrid.innerHTML = '';
        
        if (itemsToShow.length === 0) {
            bgGrid.innerHTML = `
                <div class="no-results">
                    <p>No backgrounds matching your search criteria.</p>
                </div>
            `;
            return;
        }
        
        itemsToShow.forEach(item => {
            const card = document.createElement('div');
            card.className = 'art-card';
            card.setAttribute('data-id', item.id);
            
            // Default image or actual image
            const imagePath = item.file ? `/data/art/${item.file}` : '/assets/images/bg/placeholder.jpg';
            
            // Categories/keywords display
            const categories = item.keywords && Array.isArray(item.keywords) 
                ? item.keywords.join(', ') 
                : (item.category || 'General');
            
            card.innerHTML = `
                <div class="art-preview">
                    <img src="${imagePath}" alt="${item.name}" loading="lazy">
                </div>
                <div class="art-details">
                    <h3>${item.name}</h3>
                    <div class="art-meta">
                        <span class="art-author">By: ${item.author}</span>
                        <span class="art-category">${categories}</span>
                        <span class="art-resolution">Loading...</span>
                    </div>
                    <div class="art-controls">
                        <button class="preview-button" data-img="${imagePath}" data-name="${item.name}">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                            Preview
                        </button>
                        <a href="${imagePath}" class="download-button" download="${item.file || 'background.jpg'}">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Download
                        </a>
                    </div>
                </div>
            `;
            
            bgGrid.appendChild(card);
            
            // Add event listener for preview button
            const previewBtn = card.querySelector('.preview-button');
            previewBtn.addEventListener('click', () => {
                openPreviewModal(previewBtn.getAttribute('data-img'), previewBtn.getAttribute('data-name'));
            });

            // Handle image resolution detection
            const imgElement = card.querySelector('.art-preview img');
            const imgContainer = card.querySelector('.art-preview');
            handleImageResolution(imgElement, imgContainer);

            // Disable download button if there's no file
            const downloadBtn = card.querySelector('.download-button');
            if (!item.file) {
                downloadBtn.style.pointerEvents = 'none';
                downloadBtn.style.opacity = '0.5';
                downloadBtn.removeAttribute('download');
                downloadBtn.removeAttribute('href');
                downloadBtn.title = 'Download not available';
            }
        });
    }    // Render CG grid
    function renderCgGrid() {
        const startIndex = (currentCgPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const itemsToShow = filteredCgData.slice(startIndex, endIndex);
        
        // Add visual refresh indicator
        cgGrid.classList.add('refreshing');
        setTimeout(() => {
            cgGrid.classList.remove('refreshing');
        }, 300);
        
        cgGrid.innerHTML = '';
        
        if (itemsToShow.length === 0) {
            cgGrid.innerHTML = `
                <div class="no-results">
                    <p>No CGs matching your search criteria.</p>
                </div>
            `;
            return;
        }
        
        itemsToShow.forEach(item => {
            const card = document.createElement('div');
            card.className = 'art-card';
            card.setAttribute('data-id', item.id);
            
            // Default image or actual image
            const imagePath = item.file ? `/data/art/${item.file}` : '/assets/images/cg/placeholder.jpg';
            
            // Characters/keywords display
            const characters = item.keywords && Array.isArray(item.keywords) 
                ? item.keywords.join(', ') 
                : (item.character || 'Other');
                
            card.innerHTML = `
                <div class="art-preview">
                    <img src="${imagePath}" alt="${item.name}" loading="lazy">
                </div>
                <div class="art-details">
                    <h3>${item.name}</h3>
                    <div class="art-meta">
                        <span class="art-author">By: ${item.author}</span>
                        <span class="art-category">${characters}</span>
                        <span class="art-resolution">Loading...</span>
                    </div>
                    <div class="art-controls">
                        <button class="preview-button" data-img="${imagePath}" data-name="${item.name}">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                            Preview
                        </button>
                        <a href="${imagePath}" class="download-button" download="${item.file || 'cg.jpg'}">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Download
                        </a>
                    </div>
                </div>
            `;
            
            cgGrid.appendChild(card);
            
            // Add event listener for preview button
            const previewBtn = card.querySelector('.preview-button');
            previewBtn.addEventListener('click', () => {
                openPreviewModal(previewBtn.getAttribute('data-img'), previewBtn.getAttribute('data-name'));
            });

            // Handle image resolution detection
            const imgElement = card.querySelector('.art-preview img');
            const imgContainer = card.querySelector('.art-preview');
            handleImageResolution(imgElement, imgContainer);

            // Disable download button if there's no file
            const downloadBtn = card.querySelector('.download-button');
            if (!item.file) {
                downloadBtn.style.pointerEvents = 'none';
                downloadBtn.style.opacity = '0.5';
                downloadBtn.removeAttribute('download');
                downloadBtn.removeAttribute('href');
                downloadBtn.title = 'Download not available';
            }
        });
    }

    // Open preview modal (modal shows uncropped, full image)
    function openPreviewModal(imageSrc, caption) {
        // Make sure modal elements are initialized
        initPreviewModal();
        
        // Set modal content
        modalImage.src = imageSrc;
        modalCaption.textContent = caption;
        
        // For preview, use contain to show full uncropped image
        modalImage.style.objectFit = 'contain';
        
        // Show modal
        previewModal.classList.add('active');
    }

    // Update BG pagination info and buttons
    function updateBgPagination() {
        totalBgPages = Math.max(1, Math.ceil(filteredBgData.length / ITEMS_PER_PAGE));
        currentBgPage = Math.min(currentBgPage, totalBgPages);
        
        bgPageInfo.textContent = `Page ${currentBgPage} of ${totalBgPages}`;
        bgPrevBtn.disabled = currentBgPage <= 1;
        bgNextBtn.disabled = currentBgPage >= totalBgPages;
    }

    // Update CG pagination info and buttons
    function updateCgPagination() {
        totalCgPages = Math.max(1, Math.ceil(filteredCgData.length / ITEMS_PER_PAGE));
        currentCgPage = Math.min(currentCgPage, totalCgPages);
        
        cgPageInfo.textContent = `Page ${currentCgPage} of ${totalCgPages}`;
        cgPrevBtn.disabled = currentCgPage <= 1;
        cgNextBtn.disabled = currentCgPage >= totalCgPages;
    }    // Filter BG data
    function filterBgData() {
        const searchTerm = bgSearch.value.toLowerCase().trim();
        const category = bgCategoryFilter.value;
        
        // Track current selection
        currentBgCategory = category;
        
        filteredBgData = bgData.filter(item => {
            const matchesSearch = 
                searchTerm === '' || 
                item.name.toLowerCase().includes(searchTerm) || 
                item.author.toLowerCase().includes(searchTerm);
                
            let matchesCategory = category === 'all';
            
            if (!matchesCategory && item.keywords && Array.isArray(item.keywords)) {
                // Check if any keyword matches
                matchesCategory = item.keywords.some(keyword => 
                    keyword && keyword.toLowerCase() === category.toLowerCase()
                );
            } else if (!matchesCategory && item.category) {
                // Check if category matches
                matchesCategory = item.category.toLowerCase() === category.toLowerCase();
            }
            
            return matchesSearch && matchesCategory;
        });
        
        currentBgPage = 1;
        renderBgGrid();
        updateBgPagination();
    }    // Filter CG data
    function filterCgData() {
        const searchTerm = cgSearch.value.toLowerCase().trim();
        const character = cgCharacterFilter.value;
        
        // Track current selection
        currentCgCharacter = character;
        
        filteredCgData = cgData.filter(item => {
            const matchesSearch = 
                searchTerm === '' || 
                item.name.toLowerCase().includes(searchTerm) || 
                item.author.toLowerCase().includes(searchTerm);
                
            let matchesCharacter = character === 'all';
            
            if (!matchesCharacter && item.keywords && Array.isArray(item.keywords)) {
                // Check if any keyword matches
                matchesCharacter = item.keywords.some(keyword => 
                    keyword && keyword.toLowerCase() === character.toLowerCase()
                );
            } else if (!matchesCharacter && item.character) {
                // Check if character matches
                matchesCharacter = item.character.toLowerCase() === character.toLowerCase();
            }
            
            return matchesSearch && matchesCharacter;
        });
        
        currentCgPage = 1;
        renderCgGrid();
        updateCgPagination();
    }    // Event listeners
    // BG search and filter
    bgSearchBtn.addEventListener('click', filterBgData);
    bgSearch.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterBgData();
        }
    });
      // Enhanced filter event listener with visual feedback
    bgCategoryFilter.addEventListener('change', function() {
        // Update the display of the select element itself
        this.selectedIndex = this.selectedIndex;
        
        // Add brief highlight effect, especially for "all" selections
        if (this.value === 'all') {
            bgGrid.classList.add('refreshing');
            setTimeout(() => {
                filterBgData();
                // Ensure dropdown shows current selection after filtering
                bgCategoryFilter.value = currentBgCategory;
            }, 100);
        } else {
            filterBgData();
            // Ensure dropdown shows current selection after filtering
            bgCategoryFilter.value = currentBgCategory;
        }
    });

    // BG pagination
    bgPrevBtn.addEventListener('click', () => {
        if (currentBgPage > 1) {
            currentBgPage--;
            renderBgGrid();
            updateBgPagination();
        }
    });
    
    bgNextBtn.addEventListener('click', () => {
        if (currentBgPage < totalBgPages) {
            currentBgPage++;
            renderBgGrid();
            updateBgPagination();
        }
    });    // CG search and filter
    cgSearchBtn.addEventListener('click', filterCgData);
    cgSearch.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterCgData();
        }
    });
      // Enhanced filter event listener with visual feedback
    cgCharacterFilter.addEventListener('change', function() {
        // Update the display of the select element itself
        this.selectedIndex = this.selectedIndex;
        
        // Add brief highlight effect, especially for "all" selections
        if (this.value === 'all') {
            cgGrid.classList.add('refreshing');
            setTimeout(() => {
                filterCgData();
                // Ensure dropdown shows current selection after filtering
                cgCharacterFilter.value = currentCgCharacter;
            }, 100);
        } else {
            filterCgData();
            // Ensure dropdown shows current selection after filtering
            cgCharacterFilter.value = currentCgCharacter;
        }
    });

    // CG pagination
    cgPrevBtn.addEventListener('click', () => {
        if (currentCgPage > 1) {
            currentCgPage--;
            renderCgGrid();
            updateCgPagination();
        }
    });
    
    cgNextBtn.addEventListener('click', () => {
        if (currentCgPage < totalCgPages) {
            currentCgPage++;
            renderCgGrid();
            updateCgPagination();
        }
    });

    // Event listeners for updating filters when new items are rendered
    // This ensures filters stay updated if data changes or is added dynamically
    function setupDynamicFiltering() {
        // Observer for changes to the art grid content
        const bgObserverConfig = { childList: true };
        const cgObserverConfig = { childList: true };
        
        // Create new observer for BG grid
        const bgObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Re-extract categories after grid updates
                    extractCategories();
                    populateFilterDropdowns();
                }
            });
        });
        
        // Create new observer for CG grid
        const cgObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Re-extract categories after grid updates
                    extractCategories();
                    populateFilterDropdowns();
                }
            });
        });
        
        // Start observing the grids
        if (bgGrid) bgObserver.observe(bgGrid, bgObserverConfig);
        if (cgGrid) cgObserver.observe(cgGrid, cgObserverConfig);
    }

    // Initialize the page
    initPreviewModal();
    fetchArtData();
    setupDynamicFiltering();
});