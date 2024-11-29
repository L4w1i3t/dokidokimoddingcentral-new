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

    const staffMembers = document.querySelectorAll('.staff-member');

    staffMembers.forEach(member => {
        member.addEventListener('click', () => {
            const profile = member.nextElementSibling; // Get the corresponding profile section
            profile.classList.toggle('active'); // Toggle the active class to show/hide

            // Optional: Close other profiles
            staffMembers.forEach(otherMember => {
                if (otherMember !== member) {
                    const otherProfile = otherMember.nextElementSibling;
                    otherProfile.classList.remove('active'); // Hide other profiles
                }
            });
        });
    });
});