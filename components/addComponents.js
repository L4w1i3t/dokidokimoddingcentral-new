document.addEventListener("DOMContentLoaded", function () {
  // Load an HTML component and insert it into the DOM, then run a callback if provided.
  function loadComponent(url, insertPosition, callback) {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not fetch ${url}: ${response.statusText}`);
        }
        return response.text();
      })
      .then((data) => {
        if (insertPosition === "prepend") {
          // Insert the component at the beginning of the body
          document.body.insertAdjacentHTML("afterbegin", data);
        } else if (insertPosition === "append") {
          // Insert the component at the end of the body
          document.body.insertAdjacentHTML("beforeend", data);
        }

        // Execute callback if provided
        if (typeof callback === "function") {
          callback();
        }
      })
      .catch((error) => {
        console.error("Error loading component:", error);
      });
  }

  // Load JavaScript file for a component
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script); // Append to body instead of head for proper execution order
    });
  }

  // Determine if the current page is the homepage
  const path = window.location.pathname;
  const isHomePage = path === "/" || path.endsWith("/index.html");

  // If it's not the homepage, load the header and footer
  if (!isHomePage) {
    // Load header first, then its JavaScript
    loadComponent("/components/header/header.html", "prepend", function () {
      // After header HTML is loaded, load its JavaScript
      loadScript("/components/header/header.js")
        .then(() => {
          console.log("Header script loaded successfully");
        })
        .catch((error) => {
          console.error("Error loading header script:", error);
        });
    });

    // Load footer
    loadComponent("/components/footer/footer.html", "append");
  }
});
