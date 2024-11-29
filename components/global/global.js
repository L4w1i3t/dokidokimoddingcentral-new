// EVERYTHING PERTAINING TO GLOBAL/UNIVERSAL COMPONENTS GOES HERE
document.addEventListener("DOMContentLoaded", function() {
    // Determine the base path dynamically
    const basePath = window.location.pathname.includes('/pages/') ? '../../' : '';

    // Function to set the active navigation link
    const setActiveNavLink = () => {
        const navLinks = document.querySelectorAll('header nav ul li a');
        let currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
        
        // Handle the root path (e.g., 'index.html' or '/')
        if (currentPage === '') {
            currentPage = 'index.html';
        }

        navLinks.forEach(link => {
            let linkPath = link.getAttribute('href');
            let linkPage = linkPath.substring(linkPath.lastIndexOf('/') + 1);

            // Remove query parameters or hash fragments
            linkPage = linkPage.split('?')[0].split('#')[0];

            // Compare the link's page with the current page
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Fetch and insert the header
    fetch(`${basePath}components/header/header.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for header.html');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;
            setActiveNavLink(); // Set the active link after header is loaded
        })
        .catch(error => console.error('Error loading header:', error));

    // Fetch and insert the footer
    fetch(`${basePath}components/footer/footer.html`)
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