document.addEventListener("DOMContentLoaded", function () {
  // Constants
  const ITEMS_PER_PAGE = 6;

  // DOM Elements
  const searchInput = document.getElementById("addon-search");
  const searchButton = document.getElementById("search-button");
  const categoryFilter = document.getElementById("category-filter");
  const compatibilityFilter = document.getElementById("compatibility-filter");
  const addonsContainer = document.getElementById("addons-container");
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");

  // State variables
  let allAddons = [];
  let filteredAddons = [];
  let currentPage = 1;
  let totalPages = 1;

  // Fetch addons data
  fetch("/data/addons.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load addons data");
      }
      return response.json();
    })
    .then((data) => {
      allAddons = data.addons || [];
      filteredAddons = [...allAddons];
      totalPages = Math.ceil(filteredAddons.length / ITEMS_PER_PAGE);

      renderAddons();
      updatePagination();
    })
    .catch((error) => {
      console.error("Error loading addons:", error);
      addonsContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load addons. Please try again later.</p>
                </div>
            `;
    });

  // Function to render addons based on current page and filters
  function renderAddons() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const addonsToShow = filteredAddons.slice(startIndex, endIndex);

    // Clear container
    addonsContainer.innerHTML = "";

    if (addonsToShow.length === 0) {
      addonsContainer.innerHTML = `
                <div class="no-results">
                    <p>No addons found matching your criteria.</p>
                </div>
            `;
      return;
    }

    // Render each addon
    addonsToShow.forEach((addon) => {
      const hasImage = addon.imageUrl && addon.imageUrl.trim() !== "";
      const addonCardEl = document.createElement("div");
      addonCardEl.className = `addon-card${!hasImage ? " no-image" : ""}`;
      addonCardEl.setAttribute("data-category", addon.category);
      addonCardEl.setAttribute(
        "data-compatibility",
        addon.compatibility.join(" "),
      );

      // Format the compatibility string
      const compatibilityString = addon.compatibility
        .map((version) => `Ren'Py ${version}.x`)
        .join(", ");

      // Build the HTML content
      let addonContent = `
                <div class="addon-content">
                    ${
                      hasImage
                        ? `
                        <div class="addon-image">
                            <img src="${addon.imageUrl}" alt="${addon.title}">
                        </div>
                    `
                        : ""
                    }
                    <div class="addon-details${!hasImage ? " full-width" : ""}">
                        <h2>${addon.title}</h2>
                        <div class="addon-meta">
                            <span class="addon-category">${getCategoryName(addon.category)}</span>
                            <span class="addon-compatibility">${compatibilityString}</span>
                        </div>
                        <p>${addon.description}</p>
                        <div class="addon-links">
                            <a href="${addon.downloadUrl}" class="download-button">Download</a>
                        </div>
                    </div>
                </div>
            `;

      addonCardEl.innerHTML = addonContent;
      addonsContainer.appendChild(addonCardEl);
    });
  }

  // Get the display name for a category
  function getCategoryName(categoryKey) {
    const categories = {
      ui: "UI Components",
      system: "Core Systems",
      effects: "Visual Effects",
      audio: "Audio Tools",
      utility: "Utilities",
    };
    return categories[categoryKey] || categoryKey;
  }

  // Update pagination information
  function updatePagination() {
    totalPages = Math.max(1, Math.ceil(filteredAddons.length / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
  }

  // Filter addons based on search and filter criteria
  function filterAddons() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const compatibility = compatibilityFilter.value;

    filteredAddons = allAddons.filter((addon) => {
      // Search by title and description
      const matchesSearch =
        searchTerm === "" ||
        addon.title.toLowerCase().includes(searchTerm) ||
        addon.description.toLowerCase().includes(searchTerm);

      // Filter by category
      const matchesCategory = category === "all" || addon.category === category;

      // Filter by compatibility
      const matchesCompatibility =
        compatibility === "all" ||
        addon.compatibility.includes(parseInt(compatibility));

      return matchesSearch && matchesCategory && matchesCompatibility;
    });

    // Reset to first page and update display
    currentPage = 1;
    renderAddons();
    updatePagination();
  }

  // Event listeners
  searchButton.addEventListener("click", filterAddons);
  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      filterAddons();
    }
  });

  categoryFilter.addEventListener("change", filterAddons);
  compatibilityFilter.addEventListener("change", filterAddons);

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderAddons();
      updatePagination();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderAddons();
      updatePagination();
    }
  });

  // Handle image load errors
  document.addEventListener(
    "error",
    function (event) {
      if (
        event.target.tagName === "IMG" &&
        event.target.closest(".addon-image")
      ) {
        const addonCard = event.target.closest(".addon-card");
        if (addonCard) {
          // Replace with placeholder image
          event.target.src = "../../assets/images/placeholder.jpg";

          // Alternatively, convert to no-image layout
          // addonCard.classList.add('no-image');
          // event.target.closest('.addon-image').remove();
          // const addonDetails = addonCard.querySelector('.addon-details');
          // if (addonDetails) addonDetails.classList.add('full-width');
        }
      }
    },
    true,
  );
});
