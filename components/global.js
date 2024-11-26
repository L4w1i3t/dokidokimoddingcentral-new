// [components]/global.js
document.addEventListener("DOMContentLoaded", function() {
    // Fetch and insert the header
    fetch("/components/header.html")
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
    fetch("/components/footer.html")
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
