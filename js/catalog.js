/* FLORARIUM — каталог: поиск, фильтры, сортировка */
window.App = window.App || {};

(function () {
  const state = {
    search: "",
    categories: new Set(),
    light: new Set(),
    difficulty: new Set(),
    size: new Set(),
    petSafeOnly: false,
    maxPrice: 8000,
    sort: "popularity"
  };

  function applyFilters() {
    let result = App.data.plants.filter((p) => {
      if (state.search) {
        const q = state.search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.latin.toLowerCase().includes(q)) return false;
      }
      if (state.categories.size && !state.categories.has(p.category)) return false;
      if (state.light.size && !state.light.has(p.light)) return false;
      if (state.difficulty.size && !state.difficulty.has(p.difficulty)) return false;
      if (state.size.size && !state.size.has(p.size)) return false;
      if (state.petSafeOnly && !p.petSafe) return false;
      if (p.price > state.maxPrice) return false;
      return true;
    });

    switch (state.sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "new":
        result.sort((a, b) => (b.isNew === a.isNew ? b.popularity - a.popularity : b.isNew ? 1 : -1));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => b.popularity - a.popularity);
    }

    return result;
  }

  function render() {
    const grid = document.querySelector("[data-catalog-grid]");
    const empty = document.querySelector("[data-catalog-empty]");
    const countEl = document.querySelector("[data-catalog-count]");
    if (!grid) return;

    const results = applyFilters();
    countEl.textContent = `${results.length} ${App.util.plural(results.length, "растение", "растения", "растений")}`;

    if (results.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      App.cards.renderList(results, grid);
    }

    App.ui.syncWishlistButtons();
    syncActiveChipsUI();
  }

  function syncActiveChipsUI() {
    document.querySelectorAll("[data-filter]").forEach((input) => {
      const group = input.getAttribute("data-filter");
      const value = input.value;
      if (group === "category") input.checked = state.categories.has(value);
      if (group === "light") input.checked = state.light.has(value);
      if (group === "difficulty") input.checked = state.difficulty.has(value);
      if (group === "size") input.checked = state.size.has(value);
    });
    const petInput = document.querySelector("[data-filter-pet]");
    if (petInput) petInput.checked = state.petSafeOnly;

    const chipsWrap = document.querySelector("[data-active-chips]");
    if (!chipsWrap) return;
    const chips = [];
    state.categories.forEach((v) => chips.push({ group: "categories", value: v, label: App.data.categories.find((c) => c.id === v)?.label }));
    state.light.forEach((v) => chips.push({ group: "light", value: v, label: App.data.lightLabels[v] }));
    state.difficulty.forEach((v) => chips.push({ group: "difficulty", value: v, label: App.data.difficultyLabels[v] }));
    state.size.forEach((v) => chips.push({ group: "size", value: v, label: App.data.sizeLabels[v] }));
    if (state.petSafeOnly) chips.push({ group: "pet", value: "1", label: "Безопасно для питомцев" });

    chipsWrap.innerHTML = chips
      .map(
        (c) => `<button type="button" class="chip" data-remove-chip="${c.group}" data-remove-value="${c.value}">${c.label} ✕</button>`
      )
      .join("");
    chipsWrap.hidden = chips.length === 0;
  }

  function toggleSetValue(set, value) {
    if (set.has(value)) set.delete(value);
    else set.add(value);
  }

  function readParamsFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("light")) state.light.add(params.get("light"));
    if (params.has("difficulty")) state.difficulty.add(params.get("difficulty"));
    if (params.has("category")) state.categories.add(params.get("category"));
    if (params.has("pet")) state.petSafeOnly = true;
  }

  App.catalog = {
    init() {
      const grid = document.querySelector("[data-catalog-grid]");
      if (!grid) return;

      readParamsFromURL();

      const searchInput = document.querySelector("[data-catalog-search]");
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          state.search = searchInput.value.trim();
          render();
        });
      }

      const sortSelect = document.querySelector("[data-catalog-sort]");
      if (sortSelect) {
        sortSelect.addEventListener("change", () => {
          state.sort = sortSelect.value;
          render();
        });
      }

      const priceRange = document.querySelector("[data-price-range]");
      const priceOutput = document.querySelector("[data-price-output]");
      if (priceRange) {
        state.maxPrice = Number(priceRange.value);
        priceOutput.textContent = App.util.formatPrice(state.maxPrice);
        priceRange.addEventListener("input", () => {
          state.maxPrice = Number(priceRange.value);
          priceOutput.textContent = App.util.formatPrice(state.maxPrice);
          render();
        });
      }

      document.querySelectorAll("[data-filter]").forEach((input) => {
        input.addEventListener("change", () => {
          const group = input.getAttribute("data-filter");
          if (group === "category") toggleSetValue(state.categories, input.value);
          if (group === "light") toggleSetValue(state.light, input.value);
          if (group === "difficulty") toggleSetValue(state.difficulty, input.value);
          if (group === "size") toggleSetValue(state.size, input.value);
          render();
        });
      });

      const petInput = document.querySelector("[data-filter-pet]");
      if (petInput) {
        petInput.addEventListener("change", () => {
          state.petSafeOnly = petInput.checked;
          render();
        });
      }

      const resetBtn = document.querySelector("[data-reset-filters]");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.search = "";
          state.categories.clear();
          state.light.clear();
          state.difficulty.clear();
          state.size.clear();
          state.petSafeOnly = false;
          state.maxPrice = 8000;
          if (searchInput) searchInput.value = "";
          if (priceRange) {
            priceRange.value = "8000";
            priceOutput.textContent = App.util.formatPrice(8000);
          }
          render();
        });
      }

      document.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-remove-chip]");
        if (!chip) return;
        const group = chip.getAttribute("data-remove-chip");
        const value = chip.getAttribute("data-remove-value");
        if (group === "categories") state.categories.delete(value);
        if (group === "light") state.light.delete(value);
        if (group === "difficulty") state.difficulty.delete(value);
        if (group === "size") state.size.delete(value);
        if (group === "pet") state.petSafeOnly = false;
        render();
      });

      const filterToggle = document.querySelector("[data-filters-toggle]");
      const filtersPanel = document.querySelector("[data-filters-panel]");
      if (filterToggle && filtersPanel) {
        filterToggle.addEventListener("click", () => {
          const isOpen = filtersPanel.classList.toggle("is-open");
          filterToggle.setAttribute("aria-expanded", String(isOpen));
        });
      }

      App.storage.onChange(render);
      render();
    }
  };
})();
