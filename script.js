const SETTINGS = {
  answers: ["ты щас в чулках", "ты в чулках"],
  password: "1488"
};

const screens = {
  question: document.querySelector("#question-screen"),
  gate: document.querySelector("#gate"),
  game: document.querySelector("#game"),
  reasons: document.querySelector("#reasons")
};

const questionForm = document.querySelector("#question-form");
const questionAnswer = document.querySelector("#question-answer");
const questionError = document.querySelector("#question-error");
const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#password");
const formError = document.querySelector("#form-error");
const gateSubmit = document.querySelector("#gate-submit");
const gateLoader = document.querySelector("#gate-loader");
const heartField = document.querySelector("#heart-field");
const scoreLabel = document.querySelector("#score");
const totalHeartsLabel = document.querySelector("#total-hearts");
const gameHint = document.querySelector("#game-hint");
const nextGameButton = document.querySelector("#to-reasons");
const thirdReasonLock = document.querySelector("#reason-three-lock");
const thirdReasonText = document.querySelector("#reason-three-text");
const lockClickCount = document.querySelector("#lock-click-count");
const reasonsHint = document.querySelector("#reasons-hint");
const pythonOverlay = document.querySelector("#python-overlay");
const pythonClose = document.querySelector("#python-close");
const textHeartCanvas = document.querySelector("#love-text-heart");
const backgroundMusic = document.querySelector("#background-music");
const musicToggle = document.querySelector("#music-toggle");
const musicToggleLabel = document.querySelector("#music-toggle-label");
const musicStatus = document.querySelector("#music-status");

let collectedHearts = 0;
let lockClicks = 0;
let textHeartAnimationFrame = 0;
let unlockTimeout = 0;

function showScreen(name) {
  Object.entries(screens).forEach(([screenName, screen]) => {
    const isActive = screenName === name;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function normalizeAnswer(value) {
  return value
    .toLocaleLowerCase("ru")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .replace(/\s+/g, " ");
}

function updateMusicControl() {
  const isPlaying = !backgroundMusic.paused;
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "Выключить музыку" : "Включить музыку");
  musicToggleLabel.textContent = isPlaying ? "Выключить музыку" : "Включить музыку";
}

async function playMusic() {
  if (!backgroundMusic.paused) return;

  try {
    await backgroundMusic.play();
    musicStatus.textContent = "";
  } catch (error) {
    console.error("Не удалось включить музыку.", error);
    musicStatus.textContent = "Не удалось включить музыку. Проверь, что файл mayak.mp3 лежит рядом с сайтом.";
  }
  updateMusicControl();
}

musicToggle.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    void playMusic();
    return;
  }

  backgroundMusic.pause();
  musicStatus.textContent = "Музыка выключена.";
  updateMusicControl();
});

backgroundMusic.addEventListener("error", () => {
  console.error("Не удалось загрузить файл mayak.mp3.");
  musicStatus.textContent = "Не удалось загрузить mayak.mp3. Проверь, что файл лежит рядом с сайтом.";
});
backgroundMusic.addEventListener("play", updateMusicControl);
backgroundMusic.addEventListener("pause", updateMusicControl);

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const acceptedAnswers = SETTINGS.answers.map(normalizeAnswer);
  if (acceptedAnswers.includes(normalizeAnswer(questionAnswer.value))) {
    questionError.textContent = "";
    questionAnswer.value = "";
    void playMusic();
    showScreen("gate");
    passwordInput.focus();
    return;
  }

  questionError.textContent = "Не-а, подумай ещё: какой вопрос задают во время клатча? ♡";
  questionAnswer.select();
});

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value === SETTINGS.password) {
    formError.textContent = "";
    passwordInput.value = "";
    gateSubmit.disabled = true;
    gateLoader.hidden = false;
    screens.gate.classList.add("is-unlocking");
    unlockTimeout = window.setTimeout(() => {
      setupGame();
      setupReasons();
      gateLoader.hidden = true;
      screens.gate.classList.remove("is-unlocking");
      gateSubmit.disabled = false;
      showScreen("game");
      unlockTimeout = 0;
    }, 1050);
    return;
  }
  formError.textContent = "Кажется, пароль не тот. Попробуй ещё раз ♡";
  passwordInput.select();
});

function setupGame() {
  collectedHearts = 0;
  scoreLabel.textContent = "0";
  totalHeartsLabel.textContent = "5";
  gameHint.textContent = "Коснись сердечка, чтобы поймать его";
  nextGameButton.hidden = true;
  heartField.replaceChildren();

  const positions = [
    [14, 19], [65, 13], [39, 39], [78, 53], [19, 64]
  ];

  positions.forEach(([left, top], index) => {
    const heart = document.createElement("button");
    heart.className = "heart-target";
    heart.type = "button";
    heart.style.left = `${left}%`;
    heart.style.top = `${top}%`;
    heart.style.animationDelay = `${index * -0.4}s`;
    heart.textContent = index % 2 === 0 ? "♥" : "♡";
    heart.setAttribute("aria-label", `Поймать сердечко ${index + 1}`);
    heart.addEventListener("click", () => {
      if (heart.classList.contains("is-caught")) return;
      heart.classList.add("is-caught");
      collectedHearts += 1;
      scoreLabel.textContent = String(collectedHearts);

      if (collectedHearts === positions.length) {
        gameHint.textContent = "Все сердечки собраны. Теперь самое важное…";
        nextGameButton.hidden = false;
      }
    });
    heartField.append(heart);
  });
}

nextGameButton.addEventListener("click", () => {
  showScreen("reasons");
});

function setupReasons() {
  lockClicks = 0;
  lockClickCount.textContent = "0/3";
  thirdReasonLock.disabled = false;
  thirdReasonLock.setAttribute("aria-label", "Открыть третью причину: нажми 3 раза");
  thirdReasonText.textContent = "Причина 3";
  document.querySelector("#reason-three-row").classList.remove("is-unlocked");
  reasonsHint.textContent = "У третьей причины есть секретный замочек…";
}

document.querySelector("#back-to-game").addEventListener("click", () => {
  showScreen("game");
});

thirdReasonLock.addEventListener("click", () => {
  lockClicks += 1;
  lockClickCount.textContent = `${lockClicks}/3`;
  if (lockClicks < 3) {
    reasonsHint.textContent = lockClicks === 1 ? "Замок щёлкнул… ещё два раза!" : "Почти! Остался последний щелчок!";
    return;
  }

  thirdReasonLock.disabled = true;
  thirdReasonLock.setAttribute("aria-label", "Третья причина открыта");
  thirdReasonText.textContent = "За самые розовые и самые сладкие пятки";
  document.querySelector("#reason-three-row").classList.add("is-unlocked");
  reasonsHint.textContent = "Есть! Третья причина открыта ♡";
});

document.querySelector("#reason-four-button").addEventListener("click", () => {
  pythonOverlay.hidden = false;
  drawTextHeart();
  pythonClose.focus();
});

function closePythonProgram() {
  pythonOverlay.hidden = true;
  stopTextHeartAnimation();
  document.querySelector("#reason-four-button").focus();
}

pythonClose.addEventListener("click", closePythonProgram);
pythonOverlay.addEventListener("click", (event) => {
  if (event.target === pythonOverlay) closePythonProgram();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !pythonOverlay.hidden) closePythonProgram();
});

function stopTextHeartAnimation() {
  if (textHeartAnimationFrame) {
    window.cancelAnimationFrame(textHeartAnimationFrame);
    textHeartAnimationFrame = 0;
  }
}

function drawTextHeart() {
  stopTextHeartAnimation();
  const context = textHeartCanvas.getContext("2d");
  if (!context) {
    console.error("Браузер не поддерживает canvas для сердца из текста.");
    return;
  }

  const rawOutline = Array.from({ length: 600 }, (_, index) => {
    const angle = (index / 600) * Math.PI * 2;
    return {
      x: 16 * Math.sin(angle) ** 3,
      y: 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)
    };
  });
  const minY = Math.min(...rawOutline.map((point) => point.y));
  const maxY = Math.max(...rawOutline.map((point) => point.y));
  const outline = rawOutline.map((point) => ({
    x: point.x / 16,
    y: ((point.y - minY) / (maxY - minY)) * 2 - 1
  }));
  const startedAt = performance.now();
  const draw = (now) => {
    const bounds = textHeartCanvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));
    if (textHeartCanvas.width !== width || textHeartCanvas.height !== height) {
      textHeartCanvas.width = width;
      textHeartCanvas.height = height;
    }

    context.clearRect(0, 0, width, height);
    const elapsed = now - startedAt;
    const scale = Math.min(width / 2.65, height / 2.5);
    const centerX = width / 2;
    const centerY = height * 0.52;
    const progress = Math.min(1, elapsed / 1500);
    const pulse = 0.98 + Math.sin(elapsed / 360) * 0.02;
    const phrases = ["I Love You", "My Princess"];
    const fontSize = Math.max(7, Math.min(9, scale * 0.078)) * pixelRatio;
    context.font = `600 ${fontSize}px Manrope, sans-serif`;
    const widestPhrase = Math.max(...phrases.map((phrase) => context.measureText(phrase).width));
    const textHalfWidth = (widestPhrase / 2 + fontSize * 0.12) / scale;
    const rowStep = (fontSize * 1.3) / scale;
    const rows = Math.ceil(2 / rowStep);
    const phraseSpacing = (widestPhrase + fontSize * 0.5) / scale;

    context.save();
    context.translate(centerX, centerY);
    context.scale(pulse, pulse);
    context.font = `600 ${fontSize}px Manrope, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = "#168dff";
    context.shadowBlur = 7 * pixelRatio;
    context.fillStyle = "#50baff";

    for (let row = 0; row < rows; row += 1) {
      if (row / rows > progress) continue;
      const y = 1 - (row / Math.max(1, rows - 1)) * 2;
      const intersections = [];
      for (let index = 0, previous = outline.length - 1; index < outline.length; previous = index, index += 1) {
        const currentPoint = outline[index];
        const previousPoint = outline[previous];
        if ((currentPoint.y > y) !== (previousPoint.y > y)) {
          intersections.push(((previousPoint.x - currentPoint.x) * (y - currentPoint.y))
            / (previousPoint.y - currentPoint.y) + currentPoint.x);
        }
      }
      intersections.sort((left, right) => left - right);
      const intervals = [];
      for (let index = 0; index + 1 < intersections.length; index += 2) {
        const left = intersections[index] + textHalfWidth;
        const right = intersections[index + 1] - textHalfWidth;
        if (right > left) intervals.push([left, right]);
      }

      intervals.forEach(([left, right], intervalIndex) => {
        const intervalWidth = right - left;
        const count = Math.max(1, Math.floor(intervalWidth / phraseSpacing) + 1);
        const actualSpacing = count > 1 ? intervalWidth / (count - 1) : 0;
        const firstX = count > 1 ? left : (left + right) / 2;

        for (let item = 0; item < count; item += 1) {
          const x = firstX + item * actualSpacing;
          const phraseIndex = (row + item + intervalIndex) % phrases.length;
          context.fillText(phrases[phraseIndex], x * scale, -y * scale);
        }
      });
    }

    context.restore();
    textHeartAnimationFrame = window.requestAnimationFrame(draw);
  };
  draw(performance.now());
}
