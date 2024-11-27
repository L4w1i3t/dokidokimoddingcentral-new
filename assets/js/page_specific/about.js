document.addEventListener("DOMContentLoaded", function() {
    const aboutItems = document.querySelectorAll('.about-section');

    aboutItems.forEach(item => {
        const question = item.querySelector('.about-question');

        question.addEventListener('click', () => {
            // Toggle the active class
            item.classList.toggle('active');

            // Close other open about items (optional)
            aboutItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
});