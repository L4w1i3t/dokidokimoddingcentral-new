$(document).ready(function() {
    // Function to dynamically add the favicon
    const addFavicon = () => {
        $('<link/>', {
            rel: 'icon',
            href: '../../components/favicon.ico',
            type: 'image/x-icon'
        }).appendTo('head');
    };

    // Add the favicon
    addFavicon();
});