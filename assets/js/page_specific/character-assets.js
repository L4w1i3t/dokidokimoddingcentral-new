document.addEventListener("DOMContentLoaded", function () {
  // Constants
  const ITEMS_PER_PAGE = 9;
  
  // State variables for each character
  const characterStates = {
    monika: { data: [], filtered: [], page: 1, totalPages: 1, currentSubcategory: 'outfits' },
    sayori: { data: [], filtered: [], page: 1, totalPages: 1, currentSubcategory: 'outfits' },
    yuri: { data: [], filtered: [], page: 1, totalPages: 1, currentSubcategory: 'outfits' },
    natsuki: { data: [], filtered: [], page: 1, totalPages: 1, currentSubcategory: 'outfits' },
    mc: { data: [], filtered: [], page: 1, totalPages: 1, currentSubcategory: 'outfits' },
    oc: { data: [], filtered: [], page: 1, totalPages: 1, currentSubcategory: 'outfits' },
    crossover: { data: [], filtered: [], page: 1, totalPages: 1, currentSubcategory: 'outfits' }
  };

  // Current active character
  let currentCharacter = 'monika';

  // DOM Elements - Character Navigation
  const characterNavBtns = document.querySelectorAll(".character-nav-btn");
  const characterMainSections = document.querySelectorAll(".character-main-section");

  // Fetch character data
  function fetchCharacterData() {
    fetch("/data/characters.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load character data");
        }
        return response.json();
      })
      .then((data) => {
        // Load data for each character
        if (data.monika) {
          characterStates.monika.data = data.monika || [];
          characterStates.monika.filtered = [...characterStates.monika.data];
          filterBySubcategory('monika');
        }
        if (data.sayori) {
          characterStates.sayori.data = data.sayori || [];
          characterStates.sayori.filtered = [...characterStates.sayori.data];
          filterBySubcategory('sayori');
        }
        if (data.yuri) {
          characterStates.yuri.data = data.yuri || [];
          characterStates.yuri.filtered = [...characterStates.yuri.data];
          filterBySubcategory('yuri');
        }
        if (data.natsuki) {
          characterStates.natsuki.data = data.natsuki || [];
          characterStates.natsuki.filtered = [...characterStates.natsuki.data];
          filterBySubcategory('natsuki');
        }
        if (data.mc) {
          characterStates.mc.data = data.mc || [];
          characterStates.mc.filtered = [...characterStates.mc.data];
          filterBySubcategory('mc');
        }
        
        // Load OC data
        if (data.characters) {
          characterStates.oc.data = data.characters || [];
          characterStates.oc.filtered = [...characterStates.oc.data];
          filterBySubcategory('oc');
        }

        // Load Crossover data
        if (data.crossover) {
          characterStates.crossover.data = data.crossover || [];
          characterStates.crossover.filtered = [...characterStates.crossover.data];
          filterBySubcategory('crossover');
        }

        // Render initial character
        renderCharacterGrid(currentCharacter);
        updatePagination(currentCharacter);
      })
      .catch((error) => {
        console.error("Error loading character data:", error);
        const grid = document.getElementById(`${currentCharacter}-grid`);
        if (grid) {
          grid.innerHTML = `
            <div class="no-results">
              <p>Failed to load character data. Please try again later.</p>
            </div>
          `;
        }
      });
  }

  // Main character navigation
  characterNavBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");
      const character = target.replace('-section', '');

      // Update active button state
      characterNavBtns.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Show target section, hide others
      characterMainSections.forEach((section) => {
        section.classList.remove("active");
        if (section.id === target) {
          section.classList.add("active");
        }
      });

      currentCharacter = character;
      renderCharacterGrid(character);
      updatePagination(character);
    });
  });

  // Subcategory button handling
  const subcategoryBtns = document.querySelectorAll(".subcategory-btn");
  subcategoryBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const character = button.getAttribute("data-character");
      const target = button.getAttribute("data-target");

      // Update active button state for this character
      document.querySelectorAll(`.subcategory-btn[data-character="${character}"]`).forEach((btn) => {
        btn.classList.remove("active");
      });
      button.classList.add("active");

      // Update state and filter
      characterStates[character].currentSubcategory = target;
      filterBySubcategory(character);
      renderCharacterGrid(character);
      updatePagination(character);
    });
  });

  // Filter by subcategory for main characters
  function filterBySubcategory(character) {
    const state = characterStates[character];
    const subcategory = state.currentSubcategory;

    state.filtered = state.data.filter(item => {
      return item.category === subcategory || !item.category; // Show all if no category
    });

    state.page = 1;
  }

  // Render character grid
  function renderCharacterGrid(character) {
    const state = characterStates[character];
    const grid = document.getElementById(`${character}-grid`);
    if (!grid) return;

    const startIndex = (state.page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToShow = state.filtered.slice(startIndex, endIndex);

    // Add visual refresh indicator
    grid.classList.add("refreshing");
    setTimeout(() => {
      grid.classList.remove("refreshing");
    }, 300);

    grid.innerHTML = "";

    if (itemsToShow.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <p>No ${character === 'oc' ? 'original characters' : character + ' assets'} matching your criteria.</p>
        </div>
      `;
      return;
    }

    itemsToShow.forEach((item) => {
      const card = document.createElement("div");
      card.className = "character-card";
      card.setAttribute("data-id", item.id);

      // Different rendering for OCs vs main characters
      if (character === 'oc') {
        const previewImage = item.preview_image 
          ? `/data/characters/${item.preview_image}` 
          : "/assets/images/mod-placeholder.svg";

        card.innerHTML = `
          <div class="character-preview">
            <img src="${previewImage}" alt="${item.name}" loading="lazy" onerror="this.src='/assets/images/mod-placeholder.svg'">
          </div>
          <div class="character-details">
            <h3>${item.name}</h3>
            <div class="character-meta">
              <span class="character-author">By ${item.author}</span>
              ${item.type ? `<span class="character-type">${item.type}</span>` : ''}
              ${item.gender ? `<span class="character-gender">${item.gender}</span>` : ''}
            </div>
            ${item.description ? `<p class="character-description">${item.description}</p>` : ''}
            <div class="character-actions">
              <button class="preview-button" onclick="viewCharacterDetails('${item.id}', '${character}')">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                </svg>
                View
              </button>
              <a href="${item.download_link || '#'}" class="download-button" download="${item.file || ''}" ${!item.download_link ? 'style="pointer-events: none; opacity: 0.5;" title="Download not available"' : ''}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Download
              </a>
            </div>
          </div>
        `;
      } else {
        // Main character assets (simpler card)
        const previewImage = item.image || "/assets/images/mod-placeholder.svg";
        
        card.innerHTML = `
          <div class="character-preview">
            <img src="${previewImage}" alt="${item.name || 'Asset'}" loading="lazy" onerror="this.src='/assets/images/mod-placeholder.svg'">
          </div>
          <div class="character-details">
            <h3>${item.name || 'Untitled Asset'}</h3>
            ${item.author ? `<div class="character-meta"><span class="character-author">By ${item.author}</span></div>` : ''}
            ${item.description ? `<p class="character-description">${item.description}</p>` : ''}
            <div class="character-actions">
              <button class="preview-button" onclick="viewCharacterDetails('${item.id}', '${character}')">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                </svg>
                View
              </button>
              <a href="${item.file || '#'}" class="download-button" download="${item.name || ''}" ${!item.file ? 'style="pointer-events: none; opacity: 0.5;" title="Download not available"' : ''}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Download
              </a>
            </div>
          </div>
        `;
      }

      grid.appendChild(card);
    });
  }

  // View character details (placeholder function)
  window.viewCharacterDetails = function(itemId, character) {
    const state = characterStates[character];
    const item = state.data.find(c => c.id == itemId);
    if (item) {
      let details = `Name: ${item.name}`;
      if (item.author) details += `\nAuthor: ${item.author}`;
      if (item.type) details += `\nType: ${item.type}`;
      if (item.gender) details += `\nGender: ${item.gender}`;
      if (item.description) details += `\n\n${item.description}`;
      
      alert(`${character.toUpperCase()} Asset Details:\n\n${details}`);
      // TODO: Implement proper modal or details page
    }
  };

  // Update pagination
  function updatePagination(character) {
    const state = characterStates[character];
    const pageInfo = document.getElementById(`${character}-page-info`);
    const prevBtn = document.getElementById(`${character}-prev-page`);
    const nextBtn = document.getElementById(`${character}-next-page`);

    if (!pageInfo || !prevBtn || !nextBtn) return;

    state.totalPages = Math.max(1, Math.ceil(state.filtered.length / ITEMS_PER_PAGE));
    state.page = Math.min(state.page, state.totalPages);

    pageInfo.textContent = `Page ${state.page} of ${state.totalPages}`;
    prevBtn.disabled = state.page <= 1;
    nextBtn.disabled = state.page >= state.totalPages;
  }

  // Filter functions for each character
  function filterCharacterData(character) {
    const state = characterStates[character];
    const searchInput = document.getElementById(`${character}-search`);
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Filter by subcategory and search for all characters (including OCs)
    state.filtered = state.data.filter((item) => {
      const matchesCategory = item.category === state.currentSubcategory || !item.category;
      const matchesSearch =
        searchTerm === "" ||
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.author && item.author.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm));

      return matchesCategory && matchesSearch;
    });

    state.page = 1;
    renderCharacterGrid(character);
    updatePagination(character);
  }

  // Setup event listeners for each character
  function setupCharacterListeners(character) {
    const searchBtn = document.getElementById(`${character}-search-button`);
    const searchInput = document.getElementById(`${character}-search`);
    const prevBtn = document.getElementById(`${character}-prev-page`);
    const nextBtn = document.getElementById(`${character}-next-page`);

    if (searchBtn) {
      searchBtn.addEventListener("click", () => filterCharacterData(character));
    }

    if (searchInput) {
      searchInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
          filterCharacterData(character);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const state = characterStates[character];
        if (state.page > 1) {
          state.page--;
          renderCharacterGrid(character);
          updatePagination(character);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const state = characterStates[character];
        if (state.page < state.totalPages) {
          state.page++;
          renderCharacterGrid(character);
          updatePagination(character);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  // Setup listeners for all characters
  ['monika', 'sayori', 'yuri', 'natsuki', 'mc', 'oc', 'crossover'].forEach(character => {
    setupCharacterListeners(character);
  });

  // Initialize the page
  fetchCharacterData();
});
