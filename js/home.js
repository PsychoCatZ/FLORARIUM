/* FLORARIUM — главная страница: подборки и форма подписки */
window.App = window.App || {};

(function () {
  function renderFeatured() {
    const grid = document.querySelector("[data-featured-grid]");
    if (!grid) return;
    const featured = [...App.data.plants].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    App.cards.renderList(featured, grid);
  }

  function renderNew() {
    const grid = document.querySelector("[data-new-grid]");
    if (!grid) return;
    const fresh = App.data.plants.filter((p) => p.isNew).slice(0, 3);
    App.cards.renderList(fresh, grid);
  }

  function initNewsletter() {
    const form = document.querySelector("[data-newsletter-form]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const hint = form.querySelector(".form-hint");
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!emailOk) {
        input.setAttribute("aria-invalid", "true");
        if (hint) {
          hint.textContent = "Введите корректный e-mail";
          hint.classList.add("form-hint--error");
        }
        return;
      }
      input.removeAttribute("aria-invalid");
      if (hint) {
        hint.textContent = "Готово! Мы отправим подборку на " + input.value.trim();
        hint.classList.remove("form-hint--error");
        hint.classList.add("form-hint--ok");
      }
      App.ui.toast("Подписка оформлена — это демо-форма, письма не отправляются");
      form.reset();
    });
  }

  App.home = {
    init() {
      renderFeatured();
      renderNew();
      initNewsletter();
      App.storage.onChange(() => {
        renderFeatured();
        renderNew();
      });
    }
  };
})();
