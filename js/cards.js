/* FLORARIUM — карточка товара (переиспользуется на всех страницах) */
window.App = window.App || {};

(function () {
  App.cards = {
    render(plant) {
      const wished = App.storage.isWished(plant.id);
      const discount = plant.oldPrice ? Math.round((1 - plant.price / plant.oldPrice) * 100) : 0;

      return `
        <article class="plant-card" data-card>
          <div class="plant-card__media">
            <button type="button" class="plant-card__media-btn" data-product-quickview="${plant.id}" aria-label="Быстрый просмотр: ${plant.name}">
              ${App.icons.plant(plant.shape, plant.colors, "#f2ece0")}
            </button>
            <div class="plant-card__badges">
              ${plant.isNew ? '<span class="badge badge--new">Новинка</span>' : ""}
              ${discount ? `<span class="badge badge--sale">−${discount}%</span>` : ""}
            </div>
            <button type="button"
              class="icon-btn plant-card__wish ${wished ? "is-active" : ""}"
              data-wishlist-toggle="${plant.id}"
              aria-pressed="${wished}"
              aria-label="${wished ? "Убрать из избранного" : "Добавить в избранное"}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5c-.3 0-.6-.1-.8-.3C7.6 17.1 4 13.9 4 10c0-2.8 2.2-5 5-5 1.5 0 2.9.7 3.8 1.9C13.7 5.7 15.1 5 16.6 5c2.8 0 5 2.2 5 5 0 3.9-3.6 7.1-7.2 10.2-.2.2-.5.3-.8.3Z"/></svg>
            </button>
          </div>
          <div class="plant-card__body">
            <p class="plant-card__latin">${plant.latin}</p>
            <h3 class="plant-card__name">
              <button type="button" class="plant-card__name-btn" data-product-quickview="${plant.id}">${plant.name}</button>
            </h3>
            <p class="plant-card__meta">${App.data.lightLabels[plant.light]} · ${App.data.difficultyLabels[plant.difficulty]}</p>
            <div class="plant-card__footer">
              <div class="plant-card__price">
                <span>${App.util.formatPrice(plant.price)}</span>
                ${plant.oldPrice ? `<s>${App.util.formatPrice(plant.oldPrice)}</s>` : ""}
              </div>
              <button type="button" class="btn btn--icon" data-add-to-cart="${plant.id}" aria-label="Добавить «${plant.name}» в корзину">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-1.6 8.6a2 2 0 0 1-2 1.65H9.1a2 2 0 0 1-2-1.65L5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </article>`;
    },

    renderList(plants, target) {
      target.innerHTML = plants.map(App.cards.render).join("");
    }
  };
})();
