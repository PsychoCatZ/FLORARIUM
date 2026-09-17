/* FLORARIUM — оформление заказа (имитация, без реального бэкенда) */
window.App = window.App || {};

(function () {
  const PHONE_RE = /^[\d\s+()-]{10,18}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function renderSummary() {
    const wrap = document.querySelector("[data-checkout-summary]");
    if (!wrap) return 0;
    const cart = App.storage.getCart();
    let subtotal = 0;
    wrap.innerHTML = cart
      .map((item) => {
        const plant = App.util.findPlant(item.id);
        if (!plant) return "";
        subtotal += plant.price * item.qty;
        return `<li><span>${plant.name} × ${item.qty}</span><strong>${App.util.formatPrice(plant.price * item.qty)}</strong></li>`;
      })
      .join("");

    const promo = App.state.promo;
    const discount = promo ? subtotal * promo.rate : 0;
    const total = subtotal - discount;

    const totalEl = document.querySelector("[data-checkout-total]");
    if (totalEl) totalEl.textContent = App.util.formatPrice(total);
    const discountRow = document.querySelector("[data-checkout-discount-row]");
    if (discountRow) {
      if (discount > 0) {
        discountRow.hidden = false;
        discountRow.querySelector("[data-checkout-discount]").textContent = "−" + App.util.formatPrice(discount);
      } else {
        discountRow.hidden = true;
      }
    }
    return total;
  }

  function showError(field, message) {
    const hint = field.parentElement.querySelector(".form-hint");
    field.setAttribute("aria-invalid", "true");
    if (hint) {
      hint.textContent = message;
      hint.classList.add("form-hint--error");
    }
  }

  function clearError(field) {
    const hint = field.parentElement.querySelector(".form-hint");
    field.removeAttribute("aria-invalid");
    if (hint) {
      hint.textContent = hint.dataset.defaultText || "";
      hint.classList.remove("form-hint--error");
    }
  }

  function validateForm(form) {
    let valid = true;
    const name = form.querySelector("#checkout-name");
    const phone = form.querySelector("#checkout-phone");
    const email = form.querySelector("#checkout-email");
    const address = form.querySelector("#checkout-address");
    const delivery = form.querySelector('input[name="delivery"]:checked');

    [name, phone, email].forEach(clearError);

    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, "Введите имя (минимум 2 символа)");
      valid = false;
    }
    if (!PHONE_RE.test(phone.value.trim())) {
      showError(phone, "Проверьте номер телефона");
      valid = false;
    }
    if (!EMAIL_RE.test(email.value.trim())) {
      showError(email, "Введите корректный e-mail");
      valid = false;
    }
    if (delivery && delivery.value === "courier" && !address.value.trim()) {
      showError(address, "Укажите адрес для доставки курьером");
      valid = false;
    } else {
      clearError(address);
    }

    return valid;
  }

  App.checkout = {
    open() {
      const dialog = document.getElementById("checkout-modal");
      if (!dialog) return;
      dialog.querySelector("[data-checkout-form]").hidden = false;
      dialog.querySelector("[data-checkout-success]").hidden = true;
      renderSummary();
      App.ui.openDialog(dialog);
    },

    init() {
      const dialog = document.getElementById("checkout-modal");
      if (!dialog) return;

      dialog.querySelectorAll("[data-close-modal]").forEach((btn) => {
        btn.addEventListener("click", () => App.ui.closeDialog(dialog));
      });
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) App.ui.closeDialog(dialog);
      });

      const addressField = dialog.querySelector("#checkout-address");
      const addressRow = addressField ? addressField.closest("[data-address-row]") : null;
      dialog.querySelectorAll('input[name="delivery"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          if (!addressRow) return;
          addressRow.hidden = radio.value !== "courier" || !radio.checked;
          if (radio.checked && radio.value !== "courier") clearError(addressField);
        });
      });

      const form = dialog.querySelector("[data-checkout-form]");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateForm(form)) {
          App.ui.toast("Проверьте, пожалуйста, поля формы");
          return;
        }

        const orderNumber = App.storage.makeOrderNumber();
        const total = renderSummary();
        dialog.querySelector("[data-order-number]").textContent = orderNumber;
        dialog.querySelector("[data-order-total]").textContent = App.util.formatPrice(total);
        dialog.querySelector("[data-order-email]").textContent = form.querySelector("#checkout-email").value.trim();

        form.hidden = true;
        dialog.querySelector("[data-checkout-success]").hidden = false;

        App.storage.clearCart();
        App.state.promo = null;
        App.ui.updateBadges();
        App.ui.renderCartItems();
        form.reset();
      });

      dialog.querySelector("[data-checkout-done]")?.addEventListener("click", () => {
        App.ui.closeDialog(dialog);
      });
    }
  };
})();
