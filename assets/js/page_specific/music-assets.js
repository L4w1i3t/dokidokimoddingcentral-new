document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const ITEMS_PER_PAGE = 9;    // State variables
    let bgmData = [];
    let sfxData = [];
    let filteredBgmData = [];
    let filteredSfxData = [];
    let currentBgmPage = 1;
    let currentSfxPage = 1;
    let totalBgmPages = 1;
    let totalSfxPages = 1;
    let currentlyPlaying = null;
    let audioPlayer = new Audio();
    let audioDurations = {}; // Cache for storing detected audio durations
    let bgmGenres = new Set(); // Store unique music genres
    let sfxCategories = new Set(); // Store unique SFX categories
    let currentBgmGenre = 'all'; // Track current BGM genre filter selection
    let currentSfxCategory = 'all'; // Track current SFX category filter selection

    // DOM Elements
    const subcategoryBtns = document.querySelectorAll('.subcategory-btn');
    const assetSections = document.querySelectorAll('.asset-section');
    
    // BGM elements
    const bgmSearch = document.getElementById('bgm-search');
    const bgmSearchBtn = document.getElementById('bgm-search-button');
    const bgmGenreFilter = document.getElementById('bgm-genre-filter');
    const bgmGrid = document.getElementById('bgm-grid');
    const bgmPrevBtn = document.getElementById('bgm-prev-page');
    const bgmNextBtn = document.getElementById('bgm-next-page');
    const bgmPageInfo = document.getElementById('bgm-page-info');

    // SFX elements
    const sfxSearch = document.getElementById('sfx-search');
    const sfxSearchBtn = document.getElementById('sfx-search-button');
    const sfxCategoryFilter = document.getElementById('sfx-category-filter');
    const sfxGrid = document.getElementById('sfx-grid');
    const sfxPrevBtn = document.getElementById('sfx-prev-page');
    const sfxNextBtn = document.getElementById('sfx-next-page');
    const sfxPageInfo = document.getElementById('sfx-page-info');

    // Fetch music data
    function fetchMusicData() {
        // Fetch BGM data
        fetch('/data/music.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load BGM data');
                }
                return response.json();
            })
            .then(data => {
                bgmData = data.music || [];
                filteredBgmData = [...bgmData];
                
                // Extract genres from music data
                extractBgmGenres();
                populateBgmGenreFilter();
                
                totalBgmPages = Math.ceil(filteredBgmData.length / ITEMS_PER_PAGE);
                renderBgmGrid();
                updateBgmPagination();
            })
            .catch(error => {
                console.error('Error loading BGM data:', error);
                bgmGrid.innerHTML = `
                    <div class="no-results">
                        <p>Failed to load music data. Please try again later.</p>
                    </div>
                `;
            });
        
        // Fetch SFX data
        fetch('/data/sfx.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load SFX data');
                }
                return response.json();
            })
            .then(data => {
                sfxData = data.sfx || [];
                filteredSfxData = [...sfxData];
                
                // Extract categories from SFX data
                extractSfxCategories();
                populateSfxCategoryFilter();
                
                totalSfxPages = Math.ceil(filteredSfxData.length / ITEMS_PER_PAGE);
                renderSfxGrid();
                updateSfxPagination();
            })
            .catch(error => {
                console.error('Error loading SFX data:', error);
                sfxGrid.innerHTML = `
                    <div class="no-results">
                        <p>Failed to load sound effects data. Please try again later.</p>
                    </div>
                `;
                // Set up empty arrays for proper functionality
                sfxData = [];
                filteredSfxData = [];
            });
    }

    // Extract unique genres from BGM data
    function extractBgmGenres() {
        bgmGenres.clear();
        
        bgmData.forEach(item => {
            if (item.genre) {
                // Check if the genre contains multiple genres separated by commas or slashes
                if (item.genre.includes(',') || item.genre.includes('/')) {
                    const separators = /[,\/]+/; // Match commas or slashes
                    const genreList = item.genre.split(separators);
                    
                    genreList.forEach(genre => {
                        const trimmedGenre = genre.trim();
                        if (trimmedGenre) bgmGenres.add(trimmedGenre);
                    });
                } else {
                    // Single genre
                    bgmGenres.add(item.genre.trim());
                }
            }
            
            // Also check for keywords if available
            if (item.keywords && Array.isArray(item.keywords)) {
                item.keywords.forEach(keyword => {
                    if (keyword) bgmGenres.add(keyword.trim());
                });
            }
        });
    }

    // Extract unique categories from SFX data
    function extractSfxCategories() {
        sfxCategories.clear();
        
        sfxData.forEach(item => {
            if (item.category) {
                sfxCategories.add(item.category.trim());
            }
            
            // Also check for keywords if available
            if (item.keywords && Array.isArray(item.keywords)) {
                item.keywords.forEach(keyword => {
                    if (keyword) sfxCategories.add(keyword.trim());
                });
            }
        });
    }    // Populate BGM genre filter dropdown with extracted genres
    function populateBgmGenreFilter() {
        const bgmGenreFilter = document.getElementById('bgm-genre-filter');
        if (!bgmGenreFilter) return;
        
        // Save current selection before clearing
        const currentSelection = bgmGenreFilter.value;
        
        // Clear existing options
        bgmGenreFilter.innerHTML = '';
        
        // Add "all" option
        bgmGenreFilter.appendChild(new Option('All Genres', 'all'));
        
        // Add genres
        Array.from(bgmGenres).sort().forEach(genre => {
            if (genre && genre !== 'all' && genre !== '') {
                bgmGenreFilter.appendChild(new Option(genre, genre));
            }
        });
        
        // Restore previous selection if it exists in the new options
        if (currentSelection && Array.from(bgmGenreFilter.options).some(opt => opt.value === currentSelection)) {
            bgmGenreFilter.value = currentSelection;
        }
    }    // Populate SFX category filter dropdown with extracted categories
    function populateSfxCategoryFilter() {
        const sfxCategoryFilter = document.getElementById('sfx-category-filter');
        if (!sfxCategoryFilter) return;
        
        // Save current selection before clearing
        const currentSelection = sfxCategoryFilter.value;
        
        // Clear existing options
        sfxCategoryFilter.innerHTML = '';
        
        // Add "all" option
        sfxCategoryFilter.appendChild(new Option('All Categories', 'all'));
        
        // Add categories
        Array.from(sfxCategories).sort().forEach(category => {
            if (category && category !== 'all' && category !== '') {
                sfxCategoryFilter.appendChild(new Option(category, category));
            }
        });
        
        // Restore previous selection if it exists in the new options
        if (currentSelection && Array.from(sfxCategoryFilter.options).some(opt => opt.value === currentSelection)) {
            sfxCategoryFilter.value = currentSelection;
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

    // Generate visualizer bars with random heights for music cards
    function generateVisualizerBars() {
        let barsHTML = '';
        const barCount = 12;
        
        for (let i = 0; i < barCount; i++) {
            const height = Math.floor(Math.random() * 60) + 10; // Random height between 10px and 70px
            barsHTML += `<div class="visualizer-bar" style="height: ${height}px;"></div>`;
        }
        
        return barsHTML;
    }

    // Function to detect audio duration
    function detectAudioDuration(audioFile, callback) {
        // Check if we've already detected this file's duration
        if (audioDurations[audioFile]) {
            callback(audioDurations[audioFile]);
            return;
        }
        
        // Create a temporary audio element to get duration
        const tempAudio = new Audio(`/data/bgm/${audioFile}`);
        
        // When metadata is loaded, we can access duration
        tempAudio.addEventListener('loadedmetadata', function() {
            const duration = tempAudio.duration;
            // Cache the duration for future use
            audioDurations[audioFile] = duration;
            // Call the callback with the duration
            callback(duration);
            // Clean up
            tempAudio.remove();
        });
        
        // Handle errors
        tempAudio.addEventListener('error', function() {
            console.error(`Error loading audio file: ${audioFile}`);
            callback(null);
            tempAudio.remove();
        });
        
        // Start loading the audio file
        tempAudio.load();
    }
    
    // Format duration in minutes:seconds format
    function formatDuration(seconds, format = 'full') {
        if (!seconds) return 'Unknown';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        if (format === 'nearest-minute') {
            // Round to the nearest minute
            return `${Math.round(seconds / 60)} min`;
        } else if (format === 'full') {
            // Full format: MM:SS
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            // Default expanded format: X min Y sec
            if (minutes === 0) {
                return `${remainingSeconds} sec`;
            } else if (remainingSeconds === 0) {
                return `${minutes} min`;
            } else {
                return `${minutes} min ${remainingSeconds} sec`;
            }
        }
    }    // Render BGM grid
    function renderBgmGrid() {
        const startIndex = (currentBgmPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const itemsToShow = filteredBgmData.slice(startIndex, endIndex);
        
        // Add visual refresh indicator
        bgmGrid.classList.add('refreshing');
        setTimeout(() => {
            bgmGrid.classList.remove('refreshing');
        }, 300);
        
        bgmGrid.innerHTML = '';
        
        if (itemsToShow.length === 0) {
            bgmGrid.innerHTML = `
                <div class="no-results">
                    <p>No music matching your search criteria.</p>
                </div>
            `;
            return;
        }
        
        itemsToShow.forEach(item => {
            const card = document.createElement('div');
            card.className = 'music-card';
            card.setAttribute('data-id', item.id);
            
            // Default to "Unknown" until we can detect actual duration
            let lengthDisplay = "Unknown Length";
            
            // If we already have detected duration in our cache, use it immediately
            if (item.file && audioDurations[item.file]) {
                lengthDisplay = formatDuration(audioDurations[item.file], 'expanded');
            }
            
            // Check if this card is currently playing
            const isPlaying = currentlyPlaying === item.id;
            const playButtonClass = isPlaying ? 'play-button playing' : 'play-button';
            const playButtonText = isPlaying ? 'Stop' : 'Play';
            const playButtonIcon = isPlaying ? 
                '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>' : 
                '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.804 8L5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/></svg>';
            
            card.innerHTML = `
                <div class="visualizer">
                    <div class="visualizer-bars ${isPlaying ? 'active' : ''}">
                        ${generateVisualizerBars()}
                    </div>
                </div>
                <div class="music-details">
                    <h3>${item.name}</h3>
                    <div class="music-meta">
                        <span class="music-author">${item.author}</span>
                        <span class="music-genre">${item.genre}</span>
                        <span class="music-length">${lengthDisplay}</span>
                    </div>
                    <div class="music-controls">
                        <button class="${playButtonClass}">
                            ${playButtonIcon}
                            ${playButtonText}
                        </button>
                        <a href="/data/bgm/${item.file || ''}" class="download-button" download="${item.file || ''}">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Download
                        </a>
                    </div>
                </div>
            `;
            
            bgmGrid.appendChild(card);
            
            // Add event listeners for play button
            const playBtn = card.querySelector('.play-button');
            const visualizerBars = card.querySelector('.visualizer-bars');
            playBtn.addEventListener('click', () => {
                playMusic(item, playBtn, visualizerBars);
            });

            // Disable download button if there's no file
            const downloadBtn = card.querySelector('.download-button');
            if (!item.file) {
                downloadBtn.style.pointerEvents = 'none';
                downloadBtn.style.opacity = '0.5';
                downloadBtn.removeAttribute('download');
                downloadBtn.removeAttribute('href');
                downloadBtn.title = 'Download not available';
            }
            
            // If we have a file, detect and update its duration
            if (item.file) {
                const lengthSpan = card.querySelector('.music-length');
                detectAudioDuration(item.file, (duration) => {
                    if (duration) {
                        // Update the displayed length with the actual duration
                        lengthSpan.textContent = formatDuration(duration, 'expanded');
                        
                        // Update the item in our data array with the actual duration
                        item.detectedDuration = duration;
                    }
                });
            }
        });
    }

    // Function to handle music playback
    function playMusic(item, playButton, visualizerBars) {
        // If this item is already playing, stop it
        if (currentlyPlaying === item.id) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            currentlyPlaying = null;
            
            // Update UI elements for this card only
            updateCardPlayState(playButton, visualizerBars, false);
            return;
        }
        
        // If something else is playing, stop it first
        if (currentlyPlaying !== null) {
            // Find the previously playing card and update its UI
            const previousCard = document.querySelector(`.music-card[data-id="${currentlyPlaying}"]`);
            if (previousCard) {
                const previousPlayBtn = previousCard.querySelector('.play-button');
                const previousVisualizer = previousCard.querySelector('.visualizer-bars');
                updateCardPlayState(previousPlayBtn, previousVisualizer, false);
            }
            
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        
        // Start playing this item if it has a file
        if (item.file) {
            audioPlayer.src = `/data/bgm/${item.file}`;
            audioPlayer.play().catch(error => {
                console.error('Error playing audio:', error);
                alert('Could not play the audio file. It might be missing or unsupported by your browser.');
                return;
            });
            
            currentlyPlaying = item.id;
            
            // Update UI elements for this card only
            updateCardPlayState(playButton, visualizerBars, true);
            
            // Set up event for when audio finishes
            audioPlayer.onended = function() {
                currentlyPlaying = null;
                updateCardPlayState(playButton, visualizerBars, false);
            };
            
            // If we don't have duration yet, update it once the metadata is loaded
            if (!item.detectedDuration) {
                audioPlayer.addEventListener('loadedmetadata', function onMetadata() {
                    const duration = audioPlayer.duration;
                    const card = document.querySelector(`.music-card[data-id="${item.id}"]`);
                    if (card) {
                        const lengthSpan = card.querySelector('.music-length');
                        lengthSpan.textContent = formatDuration(duration, 'expanded');
                    }
                    item.detectedDuration = duration;
                    audioDurations[item.file] = duration;
                    
                    // Remove this event listener to avoid duplicate calls
                    audioPlayer.removeEventListener('loadedmetadata', onMetadata);
                });
            }
        } else {
            console.log(`No audio file available for: ${item.name}`);
            alert('This audio file is not available for playback.');
        }
    }
    
    // Update play state UI for a specific card without re-rendering the whole grid
    function updateCardPlayState(playButton, visualizerBars, isPlaying) {
        if (isPlaying) {
            playButton.classList.add('playing');
            visualizerBars.classList.add('active');
            playButton.innerHTML = `
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                </svg>
                Stop
            `;
        } else {
            playButton.classList.remove('playing');
            visualizerBars.classList.remove('active');
            playButton.innerHTML = `
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.804 8L5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
                </svg>
                Play
            `;
        }
    }    // Render SFX grid
    function renderSfxGrid() {
        const startIndex = (currentSfxPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const itemsToShow = filteredSfxData.slice(startIndex, endIndex);
        
        // Add visual refresh indicator
        sfxGrid.classList.add('refreshing');
        setTimeout(() => {
            sfxGrid.classList.remove('refreshing');
        }, 300);
        
        sfxGrid.innerHTML = '';
        
        if (itemsToShow.length === 0) {
            sfxGrid.innerHTML = `
                <div class="no-results">
                    <p>No sound effects matching your search criteria.</p>
                </div>
            `;
            return;
        }
        
        itemsToShow.forEach(item => {
            const card = document.createElement('div');
            card.className = 'music-card';
            card.setAttribute('data-id', item.id);
            
            // Format seconds for SFX length display
            let lengthDisplay = '';
            if (item.length_seconds) {
                lengthDisplay = item.length_seconds >= 60 
                    ? Math.floor(item.length_seconds / 60) + ' min ' + (item.length_seconds % 60) + ' sec'
                    : item.length_seconds + ' sec';
            } else {
                lengthDisplay = '< 1 sec';
            }
            
            card.innerHTML = `
                <div class="visualizer">
                    <div class="visualizer-bars">
                        ${generateVisualizerBars()}
                    </div>
                </div>
                <div class="music-details">
                    <h3>${item.name}</h3>
                    <div class="music-meta">
                        <span class="music-author">${item.author}</span>
                        <span class="music-genre">${item.category}</span>
                        <span class="music-length">${lengthDisplay}</span>
                    </div>
                    <div class="music-controls">
                        <button class="play-button">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.804 8L5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
                            </svg>
                            Play
                        </button>
                        <a href="#" class="download-button">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Download
                        </a>
                    </div>
                </div>
            `;
            
            sfxGrid.appendChild(card);
            
            // Add event listeners for play button
            const playBtn = card.querySelector('.play-button');
            playBtn.addEventListener('click', () => {
                console.log(`Playing sound effect: ${item.name}`);
                // Here you would implement actual audio playback functionality
            });
        });
    }

    // Update BGM pagination info and buttons
    function updateBgmPagination() {
        totalBgmPages = Math.max(1, Math.ceil(filteredBgmData.length / ITEMS_PER_PAGE));
        currentBgmPage = Math.min(currentBgmPage, totalBgmPages);
        
        bgmPageInfo.textContent = `Page ${currentBgmPage} of ${totalBgmPages}`;
        bgmPrevBtn.disabled = currentBgmPage <= 1;
        bgmNextBtn.disabled = currentBgmPage >= totalBgmPages;
    }

    // Update SFX pagination info and buttons
    function updateSfxPagination() {
        totalSfxPages = Math.max(1, Math.ceil(filteredSfxData.length / ITEMS_PER_PAGE));
        currentSfxPage = Math.min(currentSfxPage, totalSfxPages);
        
        sfxPageInfo.textContent = `Page ${currentSfxPage} of ${totalSfxPages}`;
        sfxPrevBtn.disabled = currentSfxPage <= 1;
        sfxNextBtn.disabled = currentSfxPage >= totalSfxPages;
    }    // Filter BGM data
    function filterBgmData() {
        const searchTerm = bgmSearch.value.toLowerCase().trim();
        const genre = bgmGenreFilter.value;
        
        // Update tracking variable
        currentBgmGenre = genre;
        
        filteredBgmData = bgmData.filter(item => {
            const matchesSearch = 
                searchTerm === '' || 
                item.name.toLowerCase().includes(searchTerm) || 
                item.author.toLowerCase().includes(searchTerm);
            
            // Check if any genre matches the filter    
            let matchesGenre = genre === 'all';
            
            if (!matchesGenre && item.genre) {
                if (item.genre.includes(',') || item.genre.includes('/')) {
                    // Handle multiple genres in one string
                    const separators = /[,\/]+/;
                    const genreList = item.genre.split(separators);
                    
                    matchesGenre = genreList.some(g => 
                        g.trim().toLowerCase() === genre.toLowerCase()
                    );
                } else {
                    // Single genre
                    matchesGenre = item.genre.toLowerCase() === genre.toLowerCase();
                }
            }
            
            // Also check keywords if available
            if (!matchesGenre && item.keywords && Array.isArray(item.keywords)) {
                matchesGenre = item.keywords.some(keyword => 
                    keyword && keyword.toLowerCase() === genre.toLowerCase()
                );
            }
                
            return matchesSearch && matchesGenre;
        });
        
        currentBgmPage = 1;
        renderBgmGrid();
        updateBgmPagination();
    }    // Filter SFX data
    function filterSfxData() {
        const searchTerm = sfxSearch.value.toLowerCase().trim();
        const category = sfxCategoryFilter.value;
        
        // Update tracking variable
        currentSfxCategory = category;
        
        filteredSfxData = sfxData.filter(item => {
            const matchesSearch = 
                searchTerm === '' || 
                item.name.toLowerCase().includes(searchTerm) || 
                item.author.toLowerCase().includes(searchTerm);
            
            // Check if category matches    
            let matchesCategory = category === 'all';
            
            if (!matchesCategory && item.category) {
                matchesCategory = item.category.toLowerCase() === category.toLowerCase();
            }
            
            // Also check keywords if available
            if (!matchesCategory && item.keywords && Array.isArray(item.keywords)) {
                matchesCategory = item.keywords.some(keyword => 
                    keyword && keyword.toLowerCase() === category.toLowerCase()
                );
            }
                
            return matchesSearch && matchesCategory;
        });
        
        currentSfxPage = 1;
        renderSfxGrid();
        updateSfxPagination();
    }

    // Function to set up observers for dynamic filter updates
    function setupDynamicFiltering() {
        // Observer for changes to the music grid content
        const bgmObserverConfig = { childList: true };
        const sfxObserverConfig = { childList: true };
        
        // Create new observer for BGM grid
        const bgmObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Re-extract genres after grid updates
                    extractBgmGenres();
                    populateBgmGenreFilter();
                }
            });
        });
        
        // Create new observer for SFX grid
        const sfxObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Re-extract categories after grid updates
                    extractSfxCategories();
                    populateSfxCategoryFilter();
                }
            });
        });
        
        // Start observing the grids
        if (bgmGrid) bgmObserver.observe(bgmGrid, bgmObserverConfig);
        if (sfxGrid) sfxObserver.observe(sfxGrid, sfxObserverConfig);
    }    // Event listeners
    // BGM search and filter
    bgmSearchBtn.addEventListener('click', filterBgmData);
    bgmSearch.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterBgmData();
        }
    });
      // Enhanced filter event listener with visual feedback
    bgmGenreFilter.addEventListener('change', function() {
        // Update the display of the select element itself
        this.selectedIndex = this.selectedIndex;
        
        // Add brief highlight effect, especially for "all" selections
        if (this.value === 'all') {
            bgmGrid.classList.add('refreshing');
            setTimeout(() => {
                filterBgmData();
                // Ensure dropdown shows current selection after filtering
                bgmGenreFilter.value = currentBgmGenre;
            }, 100);
        } else {
            filterBgmData();
            // Ensure dropdown shows current selection after filtering
            bgmGenreFilter.value = currentBgmGenre;
        }
    });

    // BGM pagination
    bgmPrevBtn.addEventListener('click', () => {
        if (currentBgmPage > 1) {
            currentBgmPage--;
            renderBgmGrid();
            updateBgmPagination();
        }
    });
    
    bgmNextBtn.addEventListener('click', () => {
        if (currentBgmPage < totalBgmPages) {
            currentBgmPage++;
            renderBgmGrid();
            updateBgmPagination();
        }
    });    // SFX search and filter
    sfxSearchBtn.addEventListener('click', filterSfxData);
    sfxSearch.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterSfxData();
        }
    });
      // Enhanced filter event listener with visual feedback
    sfxCategoryFilter.addEventListener('change', function() {
        // Update the display of the select element itself
        this.selectedIndex = this.selectedIndex;
        
        // Add brief highlight effect, especially for "all" selections
        if (this.value === 'all') {
            sfxGrid.classList.add('refreshing');
            setTimeout(() => {
                filterSfxData();
                // Ensure dropdown shows current selection after filtering
                sfxCategoryFilter.value = currentSfxCategory;
            }, 100);
        } else {
            filterSfxData();
            // Ensure dropdown shows current selection after filtering
            sfxCategoryFilter.value = currentSfxCategory;
        }
    });

    // SFX pagination
    sfxPrevBtn.addEventListener('click', () => {
        if (currentSfxPage > 1) {
            currentSfxPage--;
            renderSfxGrid();
            updateSfxPagination();
        }
    });
    
    sfxNextBtn.addEventListener('click', () => {
        if (currentSfxPage < totalSfxPages) {
            currentSfxPage++;
            renderSfxGrid();
            updateSfxPagination();
        }
    });

    // Initialize the page
    fetchMusicData();
    setupDynamicFiltering();
});