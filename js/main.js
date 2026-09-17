/* FLORARIUM — точка входа: инициализация модулей на каждой странице */
window.App = window.App || {};

document.addEventListener("DOMContentLoaded", () => {
  App.ui.init();
  App.product.init();
  App.checkout.init();

  if (App.quiz) App.quiz.init();
  if (App.catalog) App.catalog.init();
  if (App.favorites) App.favorites.init();
  if (App.home) App.home.init();

  App.ui.renderCartItems();
});
