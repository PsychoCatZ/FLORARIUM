/* FLORARIUM — быстрый просмотр товара (модальное окно) */
window.App = window.App || {};

(function () {
  function relatedPlants(plant) {
    return App.data.plants
      .filter((p) => p.id !== plant.id && p.category === plant.category)
      .slice(0, 3);
  }

  function render(plant) {
    const dialog = document.getElementById("product-modal");
    if (!dialog) return;

    const wished = App.storage.isWished(plant.id);
    const discount = plant.oldPrice ? Math.round((1 - plant.price / plant.oldPrice) * 100) : 0;

    dialog.querySelector("[data-product-media]").innerHTML = App.icons.plant(plant.shape, plant.colors, "#f2ece0");
    dialog.querySelector("[data-product-badges]").innerHTML = [
      plant.isNew ? '<span class="badge badge--new">Новинка</span>' : "",
      discount ? `<span class="badge badge--sale">−${discount}%</span>` : "",
      plant.petSafe ? '<span class="badge badge--safe">Безопасно для питомцев</span>' : ""
    ].join("");

    dialog.querySelector("[data-product-category]").textContent =
      App.data.categories.find((c) => c.id === plant.category)?.label || "";
    dialog.querySelector("[data-product-name]").textContent = plant.name;
    dialog.querySelector("[data-product-latin]").textContent = plant.latin;
    dialog.querySelector("[data-product-desc]").textContent = plant.description;

    dialog.querySelector("[data-product-price]").textContent = App.util.formatPrice(plant.price);
    const oldPriceEl = dialog.querySelector("[data-product-old-price]");
    if (plant.oldPrice) {
      oldPriceEl.textContent = App.util.formatPrice(plant.oldPrice);
      oldPriceEl.hidden = false;
    } else {
      oldPriceEl.hidden = true;
    }

    dialog.querySelector("[data-product-rating]").textContent = `${plant.rating.toFixed(1)} · ${plant.reviews} ${App.util.plural(plant.reviews, "отзыв", "отзыва", "отзывов")}`;

    const careList = dialog.querySelector("[data-product-care]");
    careList.innerHTML = `
      <li><span>Освещение</span><strong>${plant.care.light}</strong></li>
      <li><span>Полив</span><strong>${plant.care.water}</strong></li>
      <li><span>Температура</span><strong>${plant.care.temp}</strong></li>
      <li><span>Влажность</span><strong>${plant.care.humidity}</strong></li>
    `;

    dialog.querySelector("[data-product-difficulty]").textContent = App.data.difficultyLabels[plant.difficulty];
    dialog.querySelector("[data-product-size]").textContent = App.data.sizeLabels[plant.size];

    const qtyValue = dialog.querySelector("[data-qty-value]");
    if (qtyValue) qtyValue.textContent = "1";

    const addBtn = dialog.querySelector("[data-add-to-cart]");
    addBtn.setAttribute("data-add-to-cart", plant.id);

    const wishBtn = dialog.querySelector("[data-wishlist-toggle]");
    wishBtn.setAttribute("data-wishlist-toggle", plant.id);
    wishBtn.setAttribute("aria-pressed", String(wished));
    wishBtn.classList.toggle("is-active", wished);

    const relatedWrap = dialog.querySelector("[data-product-related]");
    const related = relatedPlants(plant);
    relatedWrap.innerHTML = related.length
      ? related
          .map(
            (p) => `
        <button type="button" class="related-card" data-product-quickview="${p.id}">
          <span class="related-card__media">${App.icons.plant(p.shape, p.colors, "#f2ece0")}</span>
          <span class="related-card__name">${p.name}</span>
          <span class="related-card__price">${App.util.formatPrice(p.price)}</span>
        </button>`
          )
          .join("")
      : "";
  }

  App.product = {
    open(id) {
      const plant = App.util.findPlant(id);
      if (!plant) return;
      render(plant);
      App.ui.openDialog(document.getElementById("product-modal"));
    },

    init() {
      const dialog = document.getElementById("product-modal");
      if (!dialog) return;

      document.addEventListener("click", (e) => {
        const trigger = e.target.closest("[data-product-quickview]");
        if (!trigger) return;
        App.product.open(trigger.getAttribute("data-product-quickview"));
      });

      dialog.querySelectorAll("[data-close-modal]").forEach((btn) => {
        btn.addEventListener("click", () => App.ui.closeDialog(dialog));
      });
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) App.ui.closeDialog(dialog);
      });
    }
  };
})();
