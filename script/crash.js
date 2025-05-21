let multiplier = 1.00;
let isRunning = false;
let interval;
let crashPoint;
let coins = 1000;
let betAmount = 0;

const multiplierSpan = document.getElementById('multiplier');
const coinDisplay = document.getElementById('coin-count-crash');
const message = document.getElementById('message-crash');
const cashoutButton = document.getElementById('cashout-button');
const startButton = document.getElementById('start-button');
const betInput = document.getElementById('bet-amount');
const plane = document.getElementById('plane');

function update() {
  multiplierSpan.textContent = multiplier.toFixed(2) + 'x';
  coinDisplay.textContent = coins;
}

function gerarCrashPoint() {
  const r = Math.random();
  return Math.max(1.10, (1 / (1 - r)).toFixed(2));
}

function reset() {
  multiplier = 1.00;
  update();
  clearInterval(interval);
  isRunning = false;
  cashoutButton.disabled = true;
  startButton.disabled = false;
  plane.style.animation = 'none';
  void plane.offsetWidth;
  plane.style.bottom = '40px';
  message.textContent = '';
}

function startGame() {
  if (isRunning) return;

  betAmount = parseInt(betInput.value);
  if (isNaN(betAmount) || betAmount <= 0 || betAmount > coins) {
    message.textContent = '⚠️ Aposta inválida!';
    return;
  }

  coins -= betAmount;
  update();
  isRunning = true;
  crashPoint = gerarCrashPoint();

  startButton.disabled = true;
  cashoutButton.disabled = false;

  plane.style.animation = 'none';
  void plane.offsetWidth;
  plane.style.animation = 'fly 6s linear forwards';

  interval = setInterval(() => {
    multiplier += 0.05;
    update();

    const bottomPercent = Math.min(40 + multiplier * 10, 85);
    plane.style.bottom = bottomPercent + '%';

    if (multiplier >= crashPoint) {
      clearInterval(interval);
      message.textContent = `💥 Crash em ${multiplier.toFixed(2)}x`;
      plane.classList.add('explode');

      setTimeout(() => {
        plane.classList.remove('explode');
        reset();
      }, 800);
    }
  }, 100);
}

function cashOut() {
  if (!isRunning) return;

  clearInterval(interval);
  const ganho = Math.floor(betAmount * multiplier);
  coins += ganho;
  update();

  message.textContent = `💰 Ganhou ${ganho} moedas @ ${multiplier.toFixed(2)}x`;
  plane.style.animationPlayState = 'paused';

  setTimeout(() => {
    reset();
  }, 500);
}

startButton.addEventListener('click', startGame);
cashoutButton.addEventListener('click', cashOut);
