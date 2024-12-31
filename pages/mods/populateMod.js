/*****************************************************
 *  populateMod.js
 *****************************************************/

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

(async function populateModPage() {
  try {
    const categoryName = getQueryParam('cat');  
    const routeName = getQueryParam('route');   

    if (!categoryName || !routeName) {
      console.error("Missing 'cat' or 'route' query param.");
      return;
    }

    // 1) Fetch mods.json
    const response = await fetch('../../data/mods.json');
    if (!response.ok) {
      throw new Error(`Could not fetch mods.json: ${response.status}`);
    }
    const modsData = await response.json();

    // 2) Check if the category is valid
    if (!modsData.hasOwnProperty(categoryName)) {
      console.error(`Category '${categoryName}' not found in mods.json.`);
      return;
    }

    const categoryMods = modsData[categoryName];
    // 3) find the mod
    const thisMod = categoryMods.find(mod => mod.route === routeName);
    if (!thisMod) {
      console.error(`No mod found in category '${categoryName}' with route '${routeName}'.`);
      return;
    }

    // 4) Populate text fields
    document.title = `${thisMod.title} - Doki Doki Modding Central`;

    // Title
    const titleEl = document.querySelector('.mod-content h1');
    if (titleEl) {
      titleEl.textContent = thisMod.title;
    }

    // Image
    const imgEl = document.getElementById('modThumbnail');
    if (imgEl) {
      const cleanImagePath = thisMod.imageUrl.replace(/^\//, ''); 
      imgEl.src = `../../${cleanImagePath}`;
      imgEl.alt = thisMod.title;
    }

    // paragraphs
    const paragraphEls = document.querySelectorAll('.mod-content p');
    // [0] Author line
    // [1] Submitted by
    // [2] 'Description:'
    // [3] actual description
    if (paragraphEls[0]) {
      paragraphEls[0].innerHTML = `<strong>Author:</strong> ${thisMod.author}`;
    }
    if (paragraphEls[1]) {
      paragraphEls[1].innerHTML = `<strong>Submitted By:</strong> ${thisMod.submittedBy || 'N/A'}`;
    }
    if (paragraphEls[3]) {
      paragraphEls[3].textContent = thisMod.description || '';
    }

    // 5) Download button references
    const downloadContainer = document.getElementById('downloadContainer');
    const downloadButton = document.getElementById('downloadButton');

    // 6) If it's a video mod, show the overlay, hide the download
    if (categoryName === 'videos') {
      // Hide download container
      if (downloadContainer) {
        downloadContainer.style.display = 'none';
      }

      // Show the play overlay
      const playOverlay = document.getElementById('playOverlay');
      if (playOverlay) {
        playOverlay.classList.remove('hidden');
      }

      // We'll get the first link as the embed URL
      let videoUrl = null;
      if (thisMod.links && thisMod.links.length > 0) {
        videoUrl = thisMod.links[0].url;
      }

      // Set up a click handler to hide the image + overlay & show the iframe
      const videoWrapper = document.getElementById('videoWrapper');
      const videoIframe = document.getElementById('videoIframe');

      if (videoUrl && videoWrapper && videoIframe) {
        videoIframe.src = videoUrl;

        // We can let user click EITHER the overlay or the image
        const startVideo = () => {
          // hide image
          imgEl.classList.add('hidden');
          // hide overlay
          playOverlay.classList.add('hidden');
          // show iframe
          videoWrapper.classList.remove('hidden');
        };

        playOverlay.addEventListener('click', startVideo);
        imgEl.addEventListener('click', startVideo);
      }
    } else {
      // 7) Normal mod with a download link
      if (thisMod.links && thisMod.links.length > 0 && downloadButton) {
        const firstLink = thisMod.links[0];
        downloadButton.href = firstLink.url || '#';
        downloadButton.textContent = firstLink.version
          ? `Download (${firstLink.version})`
          : 'Download';
      } else if (downloadButton) {
        downloadButton.href = '#';
        downloadButton.textContent = 'No Download Available';
      }
    }
  } catch (error) {
    console.error('Error in populateModPage:', error);
  }
})();
