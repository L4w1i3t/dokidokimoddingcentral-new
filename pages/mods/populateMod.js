/*****************************************************
 *  populateMod.js
 *  Script for a SINGLE mod.html page that uses
 *  ?cat=xxx & ?route=yyy in the query string.
 *****************************************************/

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

(async function populateModPage() {
  try {
    /***************************************
     * 1) Grab "cat" and "route" from the URL
     ***************************************/
    const categoryName = getQueryParam('cat');   // e.g. "standard" or "android"
    const routeName = getQueryParam('route');    // e.g. "tripletrouble"

    if (!categoryName || !routeName) {
      console.error(
        `Missing 'cat' or 'route' query param. Example: ?cat=standard&route=brokenpoet`
      );
      return;
    }

    /***************************************
     * 2) Fetch mods.json
     ***************************************/
    // Because mod.html is at pages/mods/mod.html, we likely need:
    //   ../../data/mods.json
    // (same as your old code).
    const response = await fetch('../../data/mods.json');
    if (!response.ok) {
      throw new Error(`Could not fetch mods.json: ${response.status}`);
    }
    const modsData = await response.json();

    /***************************************
     * 3) Check that categoryName is valid
     ***************************************/
    if (!modsData.hasOwnProperty(categoryName)) {
      console.error(`Category '${categoryName}' not found in mods.json.`);
      return;
    }

    // We'll load only that category:
    const categoryMods = modsData[categoryName];

    /***************************************
     * 4) Find the relevant mod in that category
     ***************************************/
    const thisMod = categoryMods.find(mod => mod.route === routeName);
    if (!thisMod) {
      console.error(
        `No mod found in category '${categoryName}' with route '${routeName}'.`
      );
      return;
    }

    /***************************************
     * 5) Populate placeholders in mod.html
     ***************************************/
    // <title>
    document.title = `${thisMod.title} - Doki Doki Modding Central`;

    // <h1>...
    const titleEl = document.querySelector('.mod-content h1');
    if (titleEl) {
      titleEl.textContent = thisMod.title;
    }

    // <img src="..." alt="..."
    const imgEl = document.querySelector('.mod-image');
    if (imgEl) {
      // If your JSON has a leading slash in imageUrl, remove it
      const cleanImagePath = thisMod.imageUrl.replace(/^\//, '');
      // For instance, if your imageUrl is "/assets/mod_prevs/DDTT.webp"
      // We'll do `../../${cleanImagePath}` so it references the main assets folder:
      imgEl.src = `../../${cleanImagePath}`;
      imgEl.alt = thisMod.title;
    }

    // paragraphs
    const paragraphEls = document.querySelectorAll('.mod-content p');
    // [0] = <p><strong>Author:</strong> ...</p>
    // [1] = <p><strong>Submitted By:</strong> ...</p>
    // [2] = <p><strong>Description:</strong></p>
    // [3] = <p>Actual description</p>
    if (paragraphEls[0]) {
      paragraphEls[0].innerHTML = `<strong>Author:</strong> ${thisMod.author}`;
    }
    if (paragraphEls[1]) {
      paragraphEls[1].innerHTML = `<strong>Submitted By:</strong> ${thisMod.submittedBy || 'N/A'}`;
    }
    if (paragraphEls[3]) {
      paragraphEls[3].textContent = thisMod.description || '';
    }

    // Download link
    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
      if (thisMod.links && thisMod.links.length > 0) {
        // Optionally show version or text
        // e.g. `Download (Android)` or just the link text if it exists
        // We'll just do generic "Download" if there's no text
        const firstLink = thisMod.links[0];
        downloadButton.href = firstLink.url || '#';
        downloadButton.textContent = firstLink.text || 'Download';
      } else {
        downloadButton.href = '#';
        downloadButton.textContent = 'No Download Available';
      }
    }
  } catch (error) {
    console.error('Error in populateModPage:', error);
  }
})();
