/* FLORARIUM — квиз «Подбери растение» */
window.App = window.App || {};

(function () {
  const questions = [
    {
      key: "light",
      title: "Сколько света в комнате, где будет жить растение?",
      options: [
        { value: "bright", label: "Окно на юг или запад, весь день светло" },
        { value: "partial", label: "Светло, но прямого солнца почти нет" },
        { value: "shade", label: "Скорее темновато, окно на север" }
      ]
    },
    {
      key: "experience",
      title: "Какой у вас опыт ухода за растениями?",
      options: [
        { value: "beginner", label: "Это будет моё первое растение" },
        { value: "some", label: "У меня уже есть пара растений" },
        { value: "expert", label: "Я слежу за уходом внимательно и люблю сложные виды" }
      ]
    },
    {
      key: "pets",
      title: "В доме есть животные?",
      options: [
        { value: "yes", label: "Да, есть кошка или собака" },
        { value: "no", label: "Нет" }
      ]
    }
  ];

  let current = 0;
  const answers = {};

  function scorePlant(plant) {
    let score = 0;
    if (answers.light && plant.light === answers.light) score += 3;
    if (answers.experience === "beginner" && plant.difficulty === "easy") score += 3;
    if (answers.experience === "some" && plant.difficulty !== "hard") score += 2;
    if (answers.experience === "expert") score += 1;
    if (answers.pets === "yes" && plant.petSafe) score += 4;
    if (answers.pets === "yes" && !plant.petSafe) score -= 5;
    score += plant.popularity / 40;
    return score;
  }

  function getResults() {
    return App.data.plants
      .map((p) => ({ plant: p, score: scorePlant(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.plant);
  }

  function renderStep() {
    const body = document.querySelector("[data-quiz-body]");
    const progress = document.querySelector("[data-quiz-progress]");
    if (!body) return;

    if (current >= questions.length) {
      renderResults(body);
      if (progress) progress.textContent = "Результат";
      document.querySelector("[data-quiz-back]").hidden = false;
      document.querySelector("[data-quiz-next]").hidden = true;
      document.querySelector("[data-quiz-restart]").hidden = false;
      return;
    }

    document.querySelector("[data-quiz-restart]").hidden = true;
    const q = questions[current];
    if (progress) progress.textContent = `Вопрос ${current + 1} из ${questions.length}`;

    body.innerHTML = `
      <fieldset class="quiz-fieldset">
        <legend class="quiz-question">${q.title}</legend>
        <div class="quiz-options" role="radiogroup">
          ${q.options
            .map(
              (opt) => `
            <label class="quiz-option">
              <input type="radio" name="quiz-${q.key}" value="${opt.value}" ${answers[q.key] === opt.value ? "checked" : ""}>
              <span>${opt.label}</span>
            </label>`
            )
            .join("")}
        </div>
      </fieldset>`;

    const nextBtn = document.querySelector("[data-quiz-next]");
    nextBtn.hidden = false;
    nextBtn.textContent = current === questions.length - 1 ? "Показать результат" : "Далее";

    document.querySelector("[data-quiz-back]").hidden = current === 0;
  }

  function renderResults(body) {
    const results = getResults();
    body.innerHTML = `
      <div class="quiz-results">
        <p class="quiz-results__lead">Мы подобрали ${results.length} растения под ваши условия:</p>
        <div class="quiz-results__grid">
          ${results
            .map(
              (p) => `
            <article class="mini-card">
              <div class="mini-card__media">${App.icons.plant(p.shape, p.colors, "#f2ece0")}</div>
              <p class="mini-card__name">${p.name}</p>
              <p class="mini-card__price">${App.util.formatPrice(p.price)}</p>
              <div class="mini-card__actions">
                <button type="button" class="btn btn--secondary btn--sm" data-product-quickview="${p.id}">Подробнее</button>
                <button type="button" class="btn btn--sm" data-add-to-cart="${p.id}">В корзину</button>
              </div>
            </article>`
            )
            .join("")}
        </div>
        <a class="link-btn" href="catalog.html${answers.light ? `?light=${answers.light}` : ""}">Смотреть больше в каталоге →</a>
      </div>`;
  }

  App.quiz = {
    init() {
      const dialog = document.getElementById("quiz-modal");
      if (!dialog) return;

      document.querySelectorAll("[data-open-quiz]").forEach((btn) => {
        btn.addEventListener("click", () => {
          current = 0;
          Object.keys(answers).forEach((k) => delete answers[k]);
          renderStep();
          App.ui.openDialog(dialog);
        });
      });

      dialog.querySelectorAll("[data-close-modal]").forEach((btn) => {
        btn.addEventListener("click", () => App.ui.closeDialog(dialog));
      });
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) App.ui.closeDialog(dialog);
      });

      dialog.querySelector("[data-quiz-next]").addEventListener("click", () => {
        const q = questions[current];
        const checked = dialog.querySelector(`input[name="quiz-${q.key}"]:checked`);
        if (!checked) {
          App.ui.toast("Выберите один из вариантов");
          return;
        }
        answers[q.key] = checked.value;
        current += 1;
        renderStep();
      });

      dialog.querySelector("[data-quiz-back]").addEventListener("click", () => {
        current = Math.max(0, current - 1);
        renderStep();
      });

      dialog.querySelector("[data-quiz-restart]").addEventListener("click", () => {
        current = 0;
        renderStep();
      });
    }
  };
})();
