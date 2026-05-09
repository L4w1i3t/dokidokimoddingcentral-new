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

  function debounce(callback, delay = 180) {
    let timeoutId;

    return function (...args) {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => callback.apply(this, args), delay);
    };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function hasUsableUrl(url) {
    return Boolean(url && url.trim() && url.trim() !== "#");
  }

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
      totalPages = Math.max(
        1,
        Math.ceil(filteredAddons.length / ITEMS_PER_PAGE),
      );

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
      pageInfo.textContent = "Page 1 of 1";
      prevButton.disabled = true;
      nextButton.disabled = true;
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
      const hasDownload = hasUsableUrl(addon.downloadUrl);
      const compatibility = Array.isArray(addon.compatibility)
        ? addon.compatibility
        : [];
      const addonCardEl = document.createElement("div");
      addonCardEl.className = `addon-card${!hasImage ? " no-image" : ""}`;
      addonCardEl.setAttribute("data-category", addon.category);
      addonCardEl.setAttribute("data-compatibility", compatibility.join(" "));

      // Format the compatibility string
      const compatibilityString = compatibility
        .map((version) => `Ren'Py ${version}.x`)
        .join(", ");

      // Build the HTML content
      let addonContent = `
                <div class="addon-content">
                    ${
                      hasImage
                        ? `
                        <div class="addon-image">
                            <img src="${escapeHtml(addon.imageUrl)}" alt="${escapeHtml(addon.title)}">
                        </div>
                    `
                        : ""
                    }
                    <div class="addon-details${!hasImage ? " full-width" : ""}">
                        <h2>${escapeHtml(addon.title)}</h2>
                        <div class="addon-meta">
                            <span class="addon-category">${escapeHtml(getCategoryName(addon.category))}</span>
                            <span class="addon-compatibility">${escapeHtml(compatibilityString || "Compatibility TBD")}</span>
                        </div>
                        <p>${escapeHtml(addon.description)}</p>
                        <div class="addon-links">
                            ${
                              hasDownload
                                ? `<a href="${escapeHtml(addon.downloadUrl)}" class="download-button">Download</a>`
                                : '<span class="download-button disabled" aria-disabled="true">Unavailable</span>'
                            }
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
      const title = String(addon.title || "").toLowerCase();
      const description = String(addon.description || "").toLowerCase();

      // Search by title and description
      const matchesSearch =
        searchTerm === "" ||
        title.includes(searchTerm) ||
        description.includes(searchTerm);

      // Filter by category
      const matchesCategory = category === "all" || addon.category === category;

      // Filter by compatibility
      const matchesCompatibility =
        compatibility === "all" ||
        (Array.isArray(addon.compatibility) &&
          addon.compatibility.includes(parseInt(compatibility)));

      return matchesSearch && matchesCategory && matchesCompatibility;
    });

    // Reset to first page and update display
    currentPage = 1;
    renderAddons();
    updatePagination();
  }

  // Event listeners
  const debouncedFilterAddons = debounce(filterAddons);

  searchButton.addEventListener("click", filterAddons);
  searchInput.addEventListener("input", debouncedFilterAddons);
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
