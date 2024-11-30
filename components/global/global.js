document.addEventListener("DOMContentLoaded", function() {
    // Dynamically adds the favicon to the document head.
    const addFavicon = () => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = 'components/favicon.ico'; // Updated relative path
        link.type = 'image/x-icon';
        document.head.appendChild(link);
    };

    // Fetches an HTML component and inserts it into the specified selector. 
    const loadComponent = (selector, url) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const element = document.querySelector(selector);
                if (element) {
                    element.innerHTML = data;
                } else {
                    console.error(`Element with selector "${selector}" not found.`);
                }
            })
            .catch(error => console.error(`Error loading component from ${url}:`, error));
    };

    // Initializes all global functionalities.
    const initializeGlobals = () => {
        // Add favicon before anything else
        addFavicon();

        // Load the header and footer using relative paths
        loadComponent("#header", "components/header/header.html");
        loadComponent("#footer", "components/footer/footer.html");
    };

    // Initialize globals when the DOM is fully loaded
    initializeGlobals();
});
