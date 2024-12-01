// assets/js/addComponents.js

document.addEventListener("DOMContentLoaded", function() {
    // Load an HTML component and insert it into the DOM.
    function loadComponent(url, insertPosition) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not fetch ${url}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                if (insertPosition === 'prepend') {
                    // Insert the component at the beginning of the body
                    document.body.insertAdjacentHTML('afterbegin', data);
                } else if (insertPosition === 'append') {
                    // Insert the component at the end of the body
                    document.body.insertAdjacentHTML('beforeend', data);
                }
            })
            .catch(error => {
                console.error('Error loading component:', error);
            });
    }

    // Determine if the current page is the homepage.
    // Adjust the conditions based on how your homepage is accessed.
    const path = window.location.pathname;
    const isHomePage = path === '/' || path.endsWith('/index.html');

    // If it's not the homepage, load the header and footer
    if (!isHomePage) {
        // Adjust the paths based on the location of your addComponents.js file and your project structure
        loadComponent('../components/header/header.html', 'prepend');
        loadComponent('../components/footer/footer.html', 'append');
    }
});