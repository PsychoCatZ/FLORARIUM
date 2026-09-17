/* FLORARIUM — общий интерфейс: шапка, мобильное меню, корзина, тосты */
window.App = window.App || {};

(function () {
  App.util = {
    findPlant(id) {
      return App.data.plants.find((p) => p.id === id) || null;
    },
    formatPrice(value) {
      return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
    },
    plural(n, one, few, many) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return one;
      if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return few;
      return many;
    }
  };

  function toastHost() {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className = "toast-host";
      host.setAttribute("aria-live", "polite");
      host.setAttribute("role", "status");
      document.body.appendChild(host);
    }
    return host;
  }

  App.ui = {
    toast(message) {
      const host = toastHost();
      const el = document.createElement("div");
      el.className = "toast";
      el.textContent = message;
      host.appendChild(el);
      requestAnimationFrame(() => el.classList.add("toast--visible"));
      setTimeout(() => {
        el.classList.remove("toast--visible");
        setTimeout(() => el.remove(), 250);
      }, 2600);
    },

    openDialog(dialog) {
      if (!dialog) return;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    },

    closeDialog(dialog) {
      if (!dialog) return;
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    },

    updateBadges() {
      const cart = App.storage.getCart();
      const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
      const wishCount = App.storage.getWishlist().length;

      document.querySelectorAll("[data-cart-count]").forEach((el) => {
        el.textContent = String(cartCount);
        el.classList.toggle("badge--empty", cartCount === 0);
      });
      document.querySelectorAll("[data-wish-count]").forEach((el) => {
        el.textContent = String(wishCount);
        el.classList.toggle("badge--empty", wishCount === 0);
      });
    },

    syncWishlistButtons() {
      document.querySelectorAll("[data-wishlist-toggle]").forEach((btn) => {
        const id = btn.getAttribute("data-wishlist-toggle");
        const active = App.storage.isWished(id);
        btn.setAttribute("aria-pressed", String(active));
        btn.classList.toggle("is-active", active);
        btn.title = active ? "Убрать из избранного" : "Добавить в избранное";
      });
    },

    initMobileNav() {
      const toggle = document.querySelector("[data-nav-toggle]");
      const dialog = document.getElementById("mobile-nav");
      if (!toggle || !dialog) return;
      toggle.addEventListener("click", () => {
        App.ui.openDialog(dialog);
      });
      dialog.querySelectorAll("[data-nav-close], a").forEach((el) => {
        el.addEventListener("click", () => App.ui.closeDialog(dialog));
      });
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) App.ui.closeDialog(dialog);
      });
    },

    initHeaderScroll() {
      const header = document.querySelector(".site-header");
      if (!header) return;
      const onScroll = () => {
        header.classList.toggle("site-header--scrolled", window.scrollY > 12);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    },

    initWishlistDelegation() {
      document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-wishlist-toggle]");
        if (!btn) return;
        const id = btn.getAttribute("data-wishlist-toggle");
        const plant = App.util.findPlant(id);
        const added = App.storage.toggleWishlist(id);
        App.ui.syncWishlistButtons();
        App.ui.updateBadges();
        if (plant) {
          App.ui.toast(added ? `«${plant.name}» добавлено в избранное` : `«${plant.name}» убрано из избранного`);
        }
        if (typeof App.favorites?.refresh === "function") {
          App.favorites.refresh();
        }
      });
    },

    initAddToCartDelegation() {
      document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add-to-cart]");
        if (!btn) return;
        const id = btn.getAttribute("data-add-to-cart");
        const qtyInput = btn.closest("[data-card], [data-product-modal]")?.querySelector("[data-qty-value]");
        const qty = qtyInput ? parseInt(qtyInput.textContent, 10) || 1 : 1;
        const plant = App.util.findPlant(id);
        App.storage.addToCart(id, qty);
        App.ui.updateBadges();
        App.ui.renderCartItems();
        if (plant) App.ui.toast(`«${plant.name}» добавлено в корзину`);
        btn.classList.add("btn--pulse");
        setTimeout(() => btn.classList.remove("btn--pulse"), 400);
      });

      document.addEventListener("click", (e) => {
        const stepBtn = e.target.closest("[data-qty-step]");
        if (!stepBtn) return;
        const wrap = stepBtn.closest("[data-qty]");
        const valueEl = wrap.querySelector("[data-qty-value]");
        let value = parseInt(valueEl.textContent, 10) || 1;
        const dir = stepBtn.getAttribute("data-qty-step");
        value = dir === "up" ? Math.min(value + 1, 20) : Math.max(value - 1, 1);
        valueEl.textContent = String(value);
      });
    },

    renderCartItems() {
      const body = document.querySelector("[data-cart-body]");
      const footer = document.querySelector("[data-cart-footer]");
      if (!body) return;
      const cart = App.storage.getCart();

      if (cart.length === 0) {
        body.innerHTML = `
          <div class="cart-empty">
            <p>Корзина пока пуста.</p>
            <a href="catalog.html" class="btn btn--secondary">Перейти в каталог</a>
          </div>`;
        if (footer) footer.hidden = true;
        return;
      }

      if (footer) footer.hidden = false;

      let subtotal = 0;
      body.innerHTML = cart
        .map((item) => {
          const plant = App.util.findPlant(item.id);
          if (!plant) return "";
          const lineTotal = plant.price * item.qty;
          subtotal += lineTotal;
          return `
            <li class="cart-item">
              <div class="cart-item__thumb">${App.icons.plant(plant.shape, plant.colors, "#f2ece0")}</div>
              <div class="cart-item__info">
                <p class="cart-item__name">${plant.name}</p>
                <p class="cart-item__price">${App.util.formatPrice(plant.price)} · шт.</p>
                <div class="qty-control qty-control--sm" data-qty>
                  <button type="button" class="qty-btn" data-qty-step="down" data-cart-qty="${plant.id}" aria-label="Уменьшить количество">−</button>
                  <span class="qty-value" data-qty-value>${item.qty}</span>
                  <button type="button" class="qty-btn" data-qty-step="up" data-cart-qty="${plant.id}" aria-label="Увеличить количество">+</button>
                </div>
              </div>
              <div class="cart-item__end">
                <p class="cart-item__total">${App.util.formatPrice(lineTotal)}</p>
                <button type="button" class="link-btn" data-cart-remove="${plant.id}">Удалить</button>
              </div>
            </li>`;
        })
        .join("");

      const promo = App.state.promo;
      const discount = promo ? subtotal * promo.rate : 0;
      const total = subtotal - discount;

      if (footer) {
        footer.querySelector("[data-cart-subtotal]").textContent = App.util.formatPrice(subtotal);
        const discountRow = footer.querySelector("[data-cart-discount-row]");
        if (discount > 0) {
          discountRow.hidden = false;
          footer.querySelector("[data-cart-discount]").textContent = "−" + App.util.formatPrice(discount);
        } else {
          discountRow.hidden = true;
        }
        footer.querySelector("[data-cart-total]").textContent = App.util.formatPrice(total);
      }
    },

    initCartDrawer() {
      const dialog = document.getElementById("cart-drawer");
      if (!dialog) return;

      document.querySelectorAll("[data-open-cart]").forEach((btn) => {
        btn.addEventListener("click", () => {
          App.ui.renderCartItems();
          App.ui.openDialog(dialog);
        });
      });

      dialog.querySelectorAll("[data-close-cart]").forEach((btn) => {
        btn.addEventListener("click", () => App.ui.closeDialog(dialog));
      });

      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) App.ui.closeDialog(dialog);
      });

      dialog.addEventListener("click", (e) => {
        const stepBtn = e.target.closest("[data-cart-qty]");
        if (stepBtn) {
          const id = stepBtn.getAttribute("data-cart-qty");
          const cart = App.storage.getCart();
          const item = cart.find((it) => it.id === id);
          if (item) {
            const dir = stepBtn.getAttribute("data-qty-step");
            const newQty = dir === "up" ? item.qty + 1 : item.qty - 1;
            App.storage.updateCartQty(id, newQty);
            App.ui.renderCartItems();
            App.ui.updateBadges();
          }
          return;
        }
        const removeBtn = e.target.closest("[data-cart-remove]");
        if (removeBtn) {
          const id = removeBtn.getAttribute("data-cart-remove");
          App.storage.removeFromCart(id);
          App.ui.renderCartItems();
          App.ui.updateBadges();
        }
      });

      const promoForm = dialog.querySelector("[data-promo-form]");
      if (promoForm) {
        promoForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const input = promoForm.querySelector("input");
          const rate = App.storage.checkPromo(input.value);
          const message = dialog.querySelector("[data-promo-message]");
          if (rate > 0) {
            App.state.promo = { code: input.value.trim().toUpperCase(), rate };
            message.textContent = `Промокод применён: скидка ${Math.round(rate * 100)}%`;
            message.className = "form-hint form-hint--ok";
          } else {
            App.state.promo = null;
            message.textContent = "Промокод не найден. Попробуйте LISTOK10.";
            message.className = "form-hint form-hint--error";
          }
          App.ui.renderCartItems();
        });
      }

      const checkoutBtn = dialog.querySelector("[data-open-checkout]");
      if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
          if (App.storage.getCart().length === 0) return;
          App.ui.closeDialog(dialog);
          const checkoutDialog = document.getElementById("checkout-modal");
          if (checkoutDialog && App.checkout) {
            App.checkout.open();
          }
        });
      }
    },

    init() {
      App.state = App.state || { promo: null };
      App.ui.initHeaderScroll();
      App.ui.initMobileNav();
      App.ui.initCartDrawer();
      App.ui.initWishlistDelegation();
      App.ui.initAddToCartDelegation();
      App.ui.updateBadges();
      App.ui.syncWishlistButtons();
      App.storage.onChange(() => {
        App.ui.updateBadges();
        App.ui.syncWishlistButtons();
      });

      const yearEl = document.querySelector("[data-year]");
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    }
  };
})();
