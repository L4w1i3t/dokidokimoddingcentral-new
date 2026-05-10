document.addEventListener("DOMContentLoaded", function () {
  // Tab navigation
  const tabs = document.querySelectorAll(".faq-tab");
  const categories = document.querySelectorAll(".faq-category");
  const faqItems = document.querySelectorAll(".faq-item");

  function closeFaqItem(item) {
    const answer = item.querySelector(".faq-answer");
    const question = item.querySelector(".faq-question");

    item.classList.remove("active");

    if (answer) {
      answer.style.maxHeight = null;
    }

    if (question) {
      question.setAttribute("aria-expanded", "false");
    }
  }

  function setFaqItemHeight(item) {
    const answer = item.querySelector(".faq-answer");

    if (answer && item.classList.contains("active")) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  }

  function openFaqItem(item) {
    const answer = item.querySelector(".faq-answer");
    const question = item.querySelector(".faq-question");

    item.classList.add("active");

    if (answer) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    }

    if (question) {
      question.setAttribute("aria-expanded", "true");
    }
  }

  function refreshOpenFaqItems() {
    faqItems.forEach(setFaqItemHeight);
  }

  tabs.forEach((tab) => {
    tab.type = "button";
    tab.setAttribute("aria-selected", tab.classList.contains("active"));

    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });

      // Add active class to clicked tab
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      // Hide all categories
      categories.forEach((cat) => cat.classList.remove("active"));

      // Show the selected category
      const categoryId = tab.getAttribute("data-category");
      const selectedCategory = document.getElementById(categoryId);

      if (!selectedCategory) {
        return;
      }

      selectedCategory.classList.add("active");

      // Ensure all questions are collapsed in the newly shown category
      document
        .querySelectorAll("#" + categoryId + " .faq-item")
        .forEach(closeFaqItem);
    });
  });

  // Accordion functionality for FAQ items
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    if (question) {
      question.type = "button";
      question.setAttribute("aria-expanded", item.classList.contains("active"));

      question.addEventListener("click", () => {
        // Check if this item is already active
        const isActive = item.classList.contains("active");

        // Close all items
        faqItems.forEach(closeFaqItem);

        // If the clicked item wasn't active, open it
        if (!isActive) {
          openFaqItem(item);
        }
      });
    }
  });

  window.addEventListener("resize", refreshOpenFaqItems);

  if (document.fonts) {
    document.fonts.ready.then(refreshOpenFaqItems);
  }
});
