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
