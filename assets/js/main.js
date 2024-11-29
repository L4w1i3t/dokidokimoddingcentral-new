document.addEventListener("DOMContentLoaded", function() {
    // Function to dynamically add the favicon
    const addFavicon = () => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = '../../components/favicon.ico';
        link.type = 'image/x-icon';
        document.head.appendChild(link);
    };

    // Add the favicon
    addFavicon();
});
