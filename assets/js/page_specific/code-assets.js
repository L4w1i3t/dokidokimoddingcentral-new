document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const ITEMS_PER_PAGE = 9;
    
    // DOM Elements
    const codeGrid = document.getElementById('code-grid');
    const codeSearch = document.getElementById('code-search');
    const searchButton = document.getElementById('code-search-button');
    const complexityFilter = document.getElementById('code-complexity-filter');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const noResults = document.getElementById('no-results');
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const cardTemplate = document.getElementById('code-card-template');
    
    // State variables
    let codeData = [];
    let filteredCode = [];
    let currentPage = 1;
    let totalPages = 1;
    let currentCategory = 'all';
    let currentComplexity = 'all';
    let currentSearchTerm = '';
    let codeContents = {}; // Cache for loaded code contents
    
    // Fetch code data from JSON file
    fetch('/data/code.json')
        .then(response => response.json())
        .then(data => {
            codeData = data.code || [];
            
            // Initial display
            filteredCode = [...codeData];
            updateDisplay();
        })
        .catch(error => {
            console.error('Error loading code data:', error);
            noResults.textContent = 'Failed to load code snippets. Please try again later.';
            noResults.style.display = 'block';
        });
    
    // Event Listeners
    searchButton.addEventListener('click', performSearch);
    codeSearch.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
      complexityFilter.addEventListener('change', function() {
        // Add visual refresh feedback
        currentComplexity = this.value;
        currentPage = 1;
        
        // Special handling for "all" selection
        if (this.value === 'all') {
            codeGrid.classList.add('refreshing');
            setTimeout(() => {
                applyFilters();
            }, 100);
        } else {
            applyFilters();
        }
    });
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            document.querySelector('.category-btn.active').classList.remove('active');
            this.classList.add('active');
            
            // Update filters
            currentCategory = this.dataset.type;
            currentPage = 1;
            
            // Add visual refresh effect for category changes, especially for "all"
            if (this.dataset.type === 'all') {
                codeGrid.classList.add('refreshing');
                setTimeout(() => {
                    applyFilters();
                }, 100);
            } else {
                applyFilters();
            }
        });
    });
    
    prevButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updateDisplay();
        }
    });
    
    nextButton.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            updateDisplay();
        }
    });
    
    // Functions
    function performSearch() {
        currentSearchTerm = codeSearch.value.trim().toLowerCase();
        currentPage = 1;
        applyFilters();
    }
    
    function applyFilters() {
        filteredCode = codeData.filter(item => {
            // Category filter
            const categoryMatch = currentCategory === 'all' || item.type === currentCategory;
            
            // Complexity filter
            const complexityMatch = currentComplexity === 'all' || item.complexity === currentComplexity;
            
            // Search term
            const searchMatch = !currentSearchTerm || 
                item.name.toLowerCase().includes(currentSearchTerm) || 
                item.author.toLowerCase().includes(currentSearchTerm) ||
                item.description.toLowerCase().includes(currentSearchTerm);
            
            return categoryMatch && complexityMatch && searchMatch;
        });
        
        updateDisplay();
    }
      function updateDisplay() {
        // Update pagination info
        totalPages = Math.ceil(filteredCode.length / ITEMS_PER_PAGE);
        if (totalPages === 0) totalPages = 1;
        
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        
        // Update pagination buttons and info
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
        
        // Add visual refresh indicator
        codeGrid.classList.add('refreshing');
        setTimeout(() => {
            codeGrid.classList.remove('refreshing');
        }, 300);
        
        // Clear the grid
        codeGrid.innerHTML = '';
        
        // Show/hide no results message
        if (filteredCode.length === 0) {
            noResults.style.display = 'block';
            return;
        } else {
            noResults.style.display = 'none';
        }
        
        // Display current page of items
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredCode.length);
        
        // Load code content for this page's items
        const loadingPromises = [];
        for (let i = startIndex; i < endIndex; i++) {
            const item = filteredCode[i];
            if (!codeContents[item.id] && item.file) {
                loadingPromises.push(
                    fetchCodeContent(item.id, item.file)
                );
            }
        }
        
        // Wait for all code files to load, then create cards
        Promise.all(loadingPromises)
            .then(() => {
                for (let i = startIndex; i < endIndex; i++) {
                    const item = filteredCode[i];
                    const card = createCodeCard(item);
                    codeGrid.appendChild(card);
                }
                
                // Initialize syntax highlighting on code blocks
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
                
                // Add click event to copy buttons
                document.querySelectorAll('.copy-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const codeBlock = this.closest('.code-preview-container').querySelector('code');
                        copyToClipboard(codeBlock.innerText);
                        
                        // Visual feedback
                        const originalText = this.innerHTML;
                        this.innerHTML = '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/></svg>';
                        setTimeout(() => {
                            this.innerHTML = originalText;
                        }, 2000);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading code files:', error);
                noResults.textContent = 'Failed to load some code snippets. Please try again later.';
                noResults.style.display = 'block';
            });
    }
    
    // Function to fetch code content from file
    function fetchCodeContent(id, file) {
        return fetch(`/data/code/${file}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(content => {
                codeContents[id] = content;
            })
            .catch(error => {
                console.error(`Error loading code file ${file}:`, error);
                codeContents[id] = `// Error loading code file: ${error.message}`;
            });
    }
    
    function createCodeCard(item) {
        // Clone the template
        const card = cardTemplate.content.cloneNode(true);
        
        // Fill in the data
        card.querySelector('.code-title').textContent = item.name;
        card.querySelector('.code-type').textContent = item.type;
        card.querySelector('.code-author').textContent = `By: ${item.author}`;
        card.querySelector('.code-complexity').textContent = item.complexity;
        card.querySelector('.code-description p').textContent = item.description;
        
        // Set code with correct language
        const codeElement = card.querySelector('code');
        codeElement.textContent = codeContents[item.id] || 'Loading...';
        const language = getLanguageForType(item.type);
        codeElement.className = `language-${language}`;
        card.querySelector('.code-language').textContent = language;
        
        // Set usage and notes
        card.querySelector('.code-usage ol').innerHTML = item.usage.map(step => `<li>${step}</li>`).join('');
        card.querySelector('.code-notes p').textContent = item.notes;
        
        return card;
    }
    
    function getLanguageForType(type) {
        // Default to renpy for all types, but could be customized based on type
        return "renpy";
    }
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    function showCodeDetails(item) {
        // This function could open a modal with more detailed view of the code
        // For now, we'll just log to console, but this could be expanded later
        console.log("Code details:", item);
    }
    
    // Wait for syntax highlighting library to load
    window.addEventListener('load', function() {
        if (typeof hljs !== 'undefined') {
            hljs.configure({
                tabReplace: '    ',
                languages: ['python', 'renpy']
            });
        }
    });
});