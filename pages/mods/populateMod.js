/*****************************************************
 *  populateMod.js
 *  SINGLE script for mod.html that:
 *   1) Checks cat=xxx & route=yyy
 *   2) If videos, shows overlay & embedded video
 *   3) Otherwise, shows multiple download links
 *****************************************************/

/**
 * Helper to read a query param from the URL.
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Helper to check if a string is empty or null.
 */
function isEmpty(str) {
  return !str || str.trim() === "";
}

(async function populateModPage() {
  try {
    // 1) Grab cat & route from the URL
    const categoryName = getQueryParam("cat"); // e.g. "videos" or "standard"
    const routeName = getQueryParam("route"); // e.g. "tripletrouble"
    // Also check for any author or search filtering (might be present if coming from search)
    const authorFilter = getQueryParam("author");
    const searchQuery = getQueryParam("search");

    if (!categoryName || !routeName) {
      console.error(
        "Missing 'cat' or 'route' query param. E.g. ?cat=videos&route=youmattertoo",
      );
      document.querySelector(".mod-content").innerHTML =
        '<div class="error-message"><h2>Error: Mod Not Found</h2><p>Required information is missing from the URL.</p><p><a href="/pages/mods.html">Return to Mods Page</a></p></div>';
      return;
    } // 2) Fetch mods.json (adjust path as needed if your structure differs)
    // Check if we're in experimental mode and use appropriate JSON file
    const urlParams = new URLSearchParams(window.location.search);
    const isExperimental = urlParams.get("exp") === "true";
    const jsonPath = isExperimental ? "/data/mods_exp.json" : "/data/mods.json";

    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`Could not fetch mods data: ${response.status}`);
    }
    const modsData = await response.json();

    // 3) Check if category is valid
    if (!modsData.hasOwnProperty(categoryName)) {
      console.error(`Category '${categoryName}' not found in mods.json.`);
      document.querySelector(".mod-content").innerHTML =
        '<div class="error-message"><h2>Error: Category Not Found</h2><p>The requested mod category does not exist.</p><p><a href="/pages/mods.html">Return to Mods Page</a></p></div>';
      return;
    }
    const categoryMods = modsData[categoryName];

    // 4) Find the mod by route
    const thisMod = categoryMods.find((mod) => mod.route === routeName);
    if (!thisMod) {
      console.error(
        `No mod found in category '${categoryName}' with route='${routeName}'.`,
      );
      document.querySelector(".mod-content").innerHTML =
        '<div class="error-message"><h2>Error: Mod Not Found</h2><p>The requested mod could not be found.</p><p><a href="/pages/mods.html">Return to Mods Page</a></p></div>';
      return;
    }

    // 5) Populate basic fields
    // Page <title>
    document.title = `${thisMod.title} - Doki Doki Modding Central`;

    // <h1> (the mod's main title)
    const titleEl = document.querySelector(".mod-content h1");
    if (titleEl) {
      titleEl.textContent = thisMod.title;
    } // The thumbnail image
    const imgEl = document.getElementById("modThumbnail");
    if (imgEl) {
      const cleanImagePath = thisMod.imageUrl.replace(/^\//, "");
      imgEl.src = `../../${cleanImagePath}`;
      imgEl.alt = thisMod.title;
      // Add error handling for broken images
      imgEl.onerror = function () {
        this.src = "../../assets/images/mod-placeholder.svg";
      };
    }

    // The paragraphs in .mod-content
    const paragraphEls = document.querySelectorAll(".mod-content p");
    // [0] => Author line
    // [1] => SubmittedBy line
    // [2] => "Description:"
    // [3] => actual description
    if (paragraphEls[0]) {
      paragraphEls[0].innerHTML = `<strong>Author:</strong> ${thisMod.author}`;
    }
    if (paragraphEls[1]) {
      paragraphEls[1].innerHTML = `<strong>Submitted By:</strong> ${thisMod.submittedBy || "N/A"}`;
    }

    // Add category display
    if (paragraphEls[2]) {
      // Move "Description:" to the next paragraph
      const categoryDisplayName = {
        standard: "PC Mod",
        android: "Android Mod",
        demos: "Demo",
        videos: "Video",
        archive: "Archived Mod",
      };
      const displayCategory = categoryDisplayName[categoryName] || categoryName;
      paragraphEls[2].innerHTML = `<strong>Category:</strong> ${displayCategory}`;
    }

    if (paragraphEls[3]) {
      paragraphEls[3].innerHTML = `<strong>Description:</strong>`;
    }
    if (paragraphEls[4]) {
      paragraphEls[4].textContent = thisMod.description || "";
    }

    // 6) Reference to the download container
    const downloadContainer = document.getElementById("downloadContainer");

    // 7) Check if we are dealing with videos
    if (categoryName === "videos") {
      // If it's a video mod, let's hide the download container entirely (or clear it)
      if (downloadContainer) {
        downloadContainer.style.display = "none";
      }

      // Show the overlay (play button) & load the iframe link
      const playOverlay = document.getElementById("playOverlay");
      const videoWrapper = document.getElementById("videoWrapper");
      const videoIframe = document.getElementById("videoIframe");

      // Only if there's a links array and at least one link
      if (thisMod.links && thisMod.links.length > 0) {
        // For simplicity, pick the first link as the embed URL
        const videoUrl = thisMod.links[0].url;

        if (playOverlay && videoWrapper && videoIframe && imgEl) {
          // Remove 'hidden' from the overlay so it's visible
          playOverlay.classList.remove("hidden");

          // Assign the iframe's src
          videoIframe.src = videoUrl || "";

          // When user clicks either the overlay or the image, hide them, show the video
          const startVideo = () => {
            imgEl.classList.add("hidden");
            playOverlay.classList.add("hidden");
            videoWrapper.classList.remove("hidden");
          };

          playOverlay.addEventListener("click", startVideo);
          imgEl.addEventListener("click", startVideo);
        }
      }
      // If no links, fallback message (idk what to put here)
    } else {
      // 8) Not a video, so we show download links if present
      if (thisMod.links && thisMod.links.length > 0 && downloadContainer) {
        // Clear container
        downloadContainer.innerHTML = "";

        thisMod.links.forEach((linkObj) => {
          const btn = document.createElement("a");
          btn.classList.add("download-button");
          btn.href = linkObj.url || "#";
          //btn.setAttribute('target', '_blank'); // open in new tab
          // If linkObj has .version, display it
          btn.textContent = linkObj.version
            ? `Download (${linkObj.version})`
            : "Download";

          downloadContainer.appendChild(btn);
        });
      } else if (downloadContainer) {
        // No links
        downloadContainer.innerHTML = "<p>No Download Available</p>";
      }
    }
  } catch (error) {
    console.error("Error in populateModPage:", error);
    document.querySelector(".mod-content").innerHTML =
      '<div class="error-message"><h2>Error: Unexpected Error</h2><p>An unexpected error occurred while loading the mod.</p><p><a href="/pages/mods.html">Return to Mods Page</a></p></div>';
  }
})();
