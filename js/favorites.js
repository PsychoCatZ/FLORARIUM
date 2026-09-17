/* FLORARIUM — страница избранного */
window.App = window.App || {};

(function () {
  function render() {
    const grid = document.querySelector("[data-favorites-grid]");
    const empty = document.querySelector("[data-favorites-empty]");
    const countEl = document.querySelector("[data-favorites-count]");
    if (!grid) return;

    const ids = App.storage.getWishlist();
    const plants = ids.map(App.util.findPlant).filter(Boolean);

    if (countEl) {
      countEl.textContent = `${plants.length} ${App.util.plural(plants.length, "растение", "растения", "растений")}`;
    }

    if (plants.length === 0) {
      grid.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    App.cards.renderList(plants, grid);
    App.ui.syncWishlistButtons();
  }

  App.favorites = {
    refresh: render,
    init() {
      const grid = document.querySelector("[data-favorites-grid]");
      if (!grid) return;
      render();
      App.storage.onChange(render);
    }
  };
})();
