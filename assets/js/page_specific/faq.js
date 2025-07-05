document.addEventListener("DOMContentLoaded", function () {
  // Tab navigation
  const tabs = document.querySelectorAll(".faq-tab");
  const categories = document.querySelectorAll(".faq-category");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Hide all categories
      categories.forEach((cat) => cat.classList.remove("active"));

      // Show the selected category
      const categoryId = tab.getAttribute("data-category");
      document.getElementById(categoryId).classList.add("active");

      // Ensure all questions are collapsed in the newly shown category
      document
        .querySelectorAll("#" + categoryId + " .faq-item")
        .forEach((item) => {
          item.classList.remove("active");
          const answer = item.querySelector(".faq-answer");
          if (answer) {
            answer.style.maxHeight = null;
          }
        });
    });
  });

  // Accordion functionality for FAQ items
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    if (question) {
      question.addEventListener("click", () => {
        // Check if this item is already active
        const isActive = item.classList.contains("active");

        // Close all items
        faqItems.forEach((faqItem) => {
          faqItem.classList.remove("active");
          const answer = faqItem.querySelector(".faq-answer");
          if (answer) {
            answer.style.maxHeight = null;
          }
        });

        // If the clicked item wasn't active, open it
        if (!isActive) {
          item.classList.add("active");
          const answer = item.querySelector(".faq-answer");
          if (answer) {
            answer.style.maxHeight = answer.scrollHeight + "px";
          }
        }
      });
    }
  });
});
