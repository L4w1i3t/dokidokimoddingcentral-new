$(document).ready(function() {
    // Dynamically adds the favicon to the document head.
    const addFavicon = () => {
        $('<link/>', {
            rel: 'icon',
            href: 'favicon.ico', // Relative path to favicon
            type: 'image/x-icon'
        }).appendTo('head');
    };

    // Fetches an HTML component and inserts it into the specified selector. 
    const loadComponent = (selector, url) => {
        $.get(url)
            .done(function(data) {
                $(selector).html(data);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error(`Error loading component from ${url}:`, textStatus, errorThrown);
            });
    };

    // Initializes all global functionalities.
    const initializeGlobals = () => {
        // Add favicon before anything else
        addFavicon();

        // Load the header and footer using relative paths
        loadComponent("#header", "/components/header/header.html");
        loadComponent("#footer", "/components/footer/footer.html");
    };

    // Initialize globals when the DOM is fully loaded
    initializeGlobals();
});