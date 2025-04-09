document.addEventListener("DOMContentLoaded", function() {
    // Add animation delay to cards for sequential entry
    const allCards = document.querySelectorAll('.team-member-card, .feature-card, .rule-card, .connect-card');
    
    allCards.forEach((card, index) => {
        card.style.animationDelay = `${0.1 * (index + 1)}s`;
        card.classList.add('animated-entry');
    });
    
    // Optional: Add intersection observer to trigger animations when scrolled into view
    if ('IntersectionObserver' in window) {
        const appearOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -100px 0px"
        };
        
        const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                } else {
                    entry.target.classList.add('appear');
                    appearOnScroll.unobserve(entry.target);
                }
            });
        }, appearOptions);
        
        const sections = document.querySelectorAll('.about-section');
        sections.forEach(section => {
            appearOnScroll.observe(section);
        });
    }
});