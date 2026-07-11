document.addEventListener("DOMContentLoaded", () => {
  const accordion = document.querySelector("[data-accordion]");
  if (!accordion) return;

  const triggers = accordion.querySelectorAll(".accordion-trigger");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion-item");
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!item || !panel) return;

      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Close every item first (single-open accordion)
      triggers.forEach((otherTrigger) => {
        const otherItem = otherTrigger.closest(".accordion-item");
        const otherPanelId = otherTrigger.getAttribute("aria-controls");
        const otherPanel = otherPanelId
          ? document.getElementById(otherPanelId)
          : null;

        otherTrigger.setAttribute("aria-expanded", "false");
        otherItem?.classList.remove("is-open");
        if (otherPanel) otherPanel.hidden = true;
      });

      // Re-open the clicked item if it was closed
      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        item.classList.add("is-open");
        panel.hidden = false;
      }
    });
  });
});
