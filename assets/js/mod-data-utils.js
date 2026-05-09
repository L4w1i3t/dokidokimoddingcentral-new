/**
 * Utility functions for handling mod data loading
 * Supports both standard and experimental modes
 */

/**
 * Determines which mods JSON file to use based on URL parameters
 * @returns {string} The path to the appropriate JSON file
 */
function getModsDataPath() {
  // Check if we're in experimental mode via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isExperimental = urlParams.get("exp") === "true";

  return isExperimental ? "../../data/mods_exp.json" : "../../data/mods.json";
}

/**
 * Loads mod data from the appropriate JSON file
 * @param {string} category - The category of mods to load (e.g., 'standard', 'android')
 * @returns {Promise<Array>} Promise that resolves to the array of mods for the specified category
 */
async function loadModData(category) {
  try {
    const jsonPath = getModsDataPath();
    const response = await fetch(jsonPath);

    if (!response.ok) {
      throw new Error(`Failed to fetch mods data: ${response.status}`);
    }

    const data = await response.json();
    return data[category] || [];
  } catch (error) {
    console.error("Error loading mod data:", error);
    throw error;
  }
}

/**
 * Checks if we're currently in experimental mode
 * @returns {boolean} True if in experimental mode
 */
function isExperimentalMode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("exp") === "true";
}

/**
 * Adds experimental parameter to URLs when in experimental mode
 * @param {string} url - The base URL
 * @returns {string} The URL with experimental parameter if needed
 */
function addExperimentalParam(url) {
  if (isExperimentalMode()) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}exp=true`;
  }
  return url;
}

/**
 * Debounces noisy UI events such as live search input.
 * @param {Function} callback
 * @param {number} delay
 * @returns {Function}
 */
function debounce(callback, delay = 180) {
  let timeoutId;

  return function (...args) {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback.apply(this, args), delay);
  };
}

/**
 * Escapes text before inserting it into HTML template strings.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * @param {string} value
 * @returns {string}
 */
function getPrimaryAuthorName(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "Unknown";
  }

  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || text;
  const colonParts = firstLine.split(":");
  const prefix = colonParts[0].trim();
  const suffix = colonParts.slice(1).join(":").trim();
  const genericLabels = new Set([
    "author",
    "authors",
    "creator",
    "main author",
    "main creator",
    "coder",
    "writer",
    "writing department",
    "coding department",
    "music department",
    "art department",
  ]);

  let candidate =
    colonParts.length > 1 && !genericLabels.has(prefix.toLowerCase())
      ? prefix
      : suffix || firstLine;

  candidate = candidate
    .split(/[,;]|\s+-\s+/)[0]
    .replace(/^(author|authors|creator|main author|main creator)\s*:\s*/i, "")
    .trim();

  return candidate || "Unknown";
}

/**
 * Keeps cards compact while preserving full author text for tooltips/details.
 * @param {string} author
 * @param {string} fullAuthor
 * @returns {string}
 */
function formatAuthorDisplay(author, fullAuthor) {
  const fullText = String(fullAuthor || author || "").trim();
  const primary = getPrimaryAuthorName(author || fullText);
  const hasManyAuthors =
    fullText.length > 60 ||
    /[,;\n]/.test(fullText) ||
    /\b(department|coder|writer|artist|musician|director)\b/i.test(fullText);

  if (hasManyAuthors && !/\bet al\.?$/i.test(primary)) {
    return `${primary} et al.`;
  }

  return primary;
}

/**
 * @param {Object} mod
 * @returns {string}
 */
function getFullAuthorText(mod) {
  return String((mod && (mod.authorFull || mod.author)) || "Unknown").trim();
}

/**
 * Builds catalog-card author markup.
 * @param {Object} mod
 * @returns {string}
 */
function renderAuthorLabel(mod) {
  const fullAuthor = getFullAuthorText(mod);
  const displayAuthor = formatAuthorDisplay(mod.author, fullAuthor);
  return `<span class="mod-author" title="${escapeHtml(fullAuthor)}">By: ${escapeHtml(displayAuthor)}</span>`;
}

/**
 * Builds a catalog card for a mod list page using DOM APIs for text content.
 * @param {Object} mod
 * @param {string} category
 * @returns {HTMLAnchorElement}
 */
function createModCatalogCard(mod, category) {
  const modCard = document.createElement("a");
  modCard.classList.add("mod-card");

  if (mod.route) {
    const params = new URLSearchParams({
      cat: category,
      route: mod.route,
    });
    if (isExperimentalMode()) {
      params.set("exp", "true");
    }
    modCard.href = `./mod.html?${params.toString()}`;
  } else {
    modCard.setAttribute("aria-disabled", "true");
    modCard.tabIndex = -1;
  }

  const imageContainer = document.createElement("div");
  imageContainer.className = "mod-image-container";

  const image = document.createElement("img");
  image.src = mod.imageUrl || "../../assets/images/nothumbnail.webp";
  image.alt = mod.title || "Mod thumbnail";
  image.className = "mod-image";
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.src = "../../assets/images/nothumbnail.webp";
  });
  imageContainer.appendChild(image);

  if (category === "videos") {
    const playIcon = document.createElement("div");
    playIcon.className = "play-icon-small";
    playIcon.setAttribute("aria-hidden", "true");
    playIcon.innerHTML = "&#9658;";
    imageContainer.appendChild(playIcon);
  }

  const details = document.createElement("div");
  details.className = "mod-details";

  const title = document.createElement("h2");
  title.textContent = mod.title || "Untitled Mod";

  const meta = document.createElement("div");
  meta.className = "mod-meta";
  meta.innerHTML = renderAuthorLabel(mod);

  details.append(title, meta);
  modCard.append(imageContainer, details);

  return modCard;
}

/**
 * @param {Object} mod
 * @returns {string}
 */
function getAuthorSearchText(mod) {
  return `${(mod && mod.author) || ""} ${(mod && mod.authorFull) || ""}`.toLowerCase();
}

/**
 * Adds a fallback suffix when old data has several identical download labels.
 * @param {Object} linkObj
 * @param {number} index
 * @param {Array} links
 * @returns {string}
 */
function formatDownloadLabel(linkObj, index, links) {
  const version = String((linkObj && linkObj.version) || "").trim();
  if (!version) {
    return "Download";
  }

  const normalizedVersion = version.toLowerCase();
  const duplicateCount = (links || []).filter(
    (link) =>
      String((link && link.version) || "")
        .trim()
        .toLowerCase() === normalizedVersion,
  ).length;

  if (duplicateCount > 1) {
    return `Download (${version} ${index + 1})`;
  }

  return `Download (${version})`;
}
