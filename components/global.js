document.addEventListener("DOMContentLoaded", function() {
    // Determine the base path dynamically
    const basePath = window.location.pathname.includes('/pages/') ? '../' : '';

    // Fetch and insert the header
    fetch(`${basePath}components/header.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for header.html');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));

    // Fetch and insert the footer
    fetch(`${basePath}components/footer.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for footer.html');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
});