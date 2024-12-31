/*****************************************************
 *  populateMod.js
 *  Script to dynamically populate each mod.html page
 *  based on the route name and data from mods.json.
 *****************************************************/

(async function populateModPage() {
    try {
      /***************************************
       * 1) Figure out which mod folder we’re in.
       ***************************************/
      // Example URL: ".../pages/mods/android/brokenpoet/mod.html"
      // We'll split the URL by "/" and grab the second to last piece (the folder name).
      const pathParts = window.location.pathname.split('/');
      // Usually the route name is the folder right before "mod.html".
      // Adjust index if your structure is different:
      // e.g. pathParts[pathParts.length - 2]
      const routeName = pathParts[pathParts.length - 2];
  
      /***************************************
       * 2) Fetch mods.json
       ***************************************/
      // Adjust the path to your mods.json as needed.
      // Because we’re inside pages/mods/... 
      // we might need a relative path like:
      // "../../../../data/mods.json"
      const response = await fetch('../../../../data/mods.json');
      if (!response.ok) {
        throw new Error(`Could not fetch mods.json: ${response.status}`);
      }
      const modsData = await response.json();
  
      /***************************************
       * 3) Combine all categories (optional)
       ***************************************/
      const allMods = [
        ...(modsData.standard || []),
        ...(modsData.archive || []),
        ...(modsData.android || []),
        ...(modsData.demos || []),
        ...(modsData.videos || []),
      ];
  
      /***************************************
       * 4) Find the relevant mod
       ***************************************/
      const thisMod = allMods.find(mod => mod.route === routeName);
  
      if (!thisMod) {
        console.error(`No mod found in mods.json with route "${routeName}".`);
        return;
      }
  
      /***************************************
       * 5) Populate the placeholders
       ***************************************/
  
      // 5A) Update the <title>
      document.title = `${thisMod.title} - Doki Doki Modding Central`;
  
      // 5B) <h1>[MOD TITLE]</h1>
      const titleEl = document.querySelector('.mod-content h1');
      if (titleEl) {
        titleEl.textContent = thisMod.title;
      }
  
      // 5C) <img src="..." class="mod-image">
      const imgEl = document.querySelector('.mod-image');
      if (imgEl) {
        // The JSON has something like "/assets/mod_prevs/brokenpoet.webp"
        // We'll strip the leading slash and prefix the correct number of "../"
        const cleanImagePath = thisMod.imageUrl.replace(/^\//, ''); // remove leading slash
        imgEl.src = `../../../../${cleanImagePath}`;
        imgEl.alt = thisMod.title;
      }
  
      // 5D) <p><strong>Author:</strong> [AUTHOR]</p> (2nd <p> in our template)
      // 5E) <p><strong>Submitted By:</strong> [SUBMITTER]</p> (3rd <p>)
      // 5F) <p><strong>Description:</strong></p> (4th <p>)
      // 5G) <p>[insert description here]</p> (5th <p>)
      // Because the template uses sequential <p> elements, we can do:
      const paragraphEls = document.querySelectorAll('.mod-content p');
      // paragraphEls[0] = Author line
      // paragraphEls[1] = Submitted By line
      // paragraphEls[2] = "Description:" label
      // paragraphEls[3] = actual description content
  
      if (paragraphEls[0]) {
        paragraphEls[0].innerHTML = `<strong>Author:</strong> ${thisMod.author}`;
      }
      if (paragraphEls[1]) {
        paragraphEls[1].innerHTML = `<strong>Submitted By:</strong> ${thisMod.submittedBy || 'N/A'}`;
      }
      if (paragraphEls[3]) {
        paragraphEls[3].textContent = thisMod.description || '';
      }
  
      // 5H) If you have "links" for downloads:
      // E.g. an array of objects: { url: "...", text: "..." }
      // Or possibly an empty array. We'll handle it:
      const downloadButton = document.querySelector('.download-button');
      if (downloadButton) {
        if (thisMod.links && thisMod.links.length > 0) {
          // For simplicity, pick the first link if multiple
          downloadButton.href = thisMod.links[0].url || '#';
          downloadButton.textContent = thisMod.links[0].text || 'Download';
        } else {
          // If no link is available, hide the button or disable it
          downloadButton.href = '#';
          downloadButton.textContent = 'No Download Available';
          // Alternatively, you could remove the button
          // downloadButton.style.display = 'none';
        }
      }
  
    } catch (error) {
      console.error('Error in populateModPage:', error);
    }
  })();
  