/* FLORARIUM — работа с localStorage: корзина, избранное, промокоды */
window.App = window.App || {};

(function () {
  const CART_KEY = "florarium.cart.v1";
  const WISH_KEY = "florarium.wishlist.v1";

  const PROMO_CODES = {
    LISTOK10: 0.1,
    ЗЕЛЕНЬ15: 0.15
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (err) {
      console.warn("Не удалось прочитать localStorage:", key, err);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn("Не удалось записать в localStorage:", key, err);
      return false;
    }
  }

  const listeners = [];

  function notify() {
    listeners.forEach((fn) => fn());
  }

  App.storage = {
    onChange(fn) {
      listeners.push(fn);
    },

    getCart() {
      return readJSON(CART_KEY, []);
    },

    setCart(items) {
      writeJSON(CART_KEY, items);
      notify();
    },

    addToCart(id, qty) {
      const cart = App.storage.getCart();
      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.qty += qty || 1;
      } else {
        cart.push({ id, qty: qty || 1 });
      }
      App.storage.setCart(cart);
    },

    updateCartQty(id, qty) {
      let cart = App.storage.getCart();
      if (qty <= 0) {
        cart = cart.filter((item) => item.id !== id);
      } else {
        const item = cart.find((it) => it.id === id);
        if (item) item.qty = qty;
      }
      App.storage.setCart(cart);
    },

    removeFromCart(id) {
      const cart = App.storage.getCart().filter((item) => item.id !== id);
      App.storage.setCart(cart);
    },

    clearCart() {
      App.storage.setCart([]);
    },

    getWishlist() {
      return readJSON(WISH_KEY, []);
    },

    isWished(id) {
      return App.storage.getWishlist().includes(id);
    },

    toggleWishlist(id) {
      const list = App.storage.getWishlist();
      const idx = list.indexOf(id);
      if (idx === -1) {
        list.push(id);
      } else {
        list.splice(idx, 1);
      }
      writeJSON(WISH_KEY, list);
      notify();
      return idx === -1;
    },

    removeFromWishlist(id) {
      const list = App.storage.getWishlist().filter((wid) => wid !== id);
      writeJSON(WISH_KEY, list);
      notify();
    },

    checkPromo(code) {
      const key = (code || "").trim().toUpperCase();
      return PROMO_CODES[key] || 0;
    },

    makeOrderNumber() {
      const n = Math.floor(1000 + Math.random() * 9000);
      const date = new Date();
      const y = date.getFullYear().toString().slice(-2);
      const m = String(date.getMonth() + 1).padStart(2, "0");
      return `FL-${y}${m}-${n}`;
    }
  };
})();
