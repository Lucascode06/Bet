(() => {
  const container = document.getElementById('mina');
  if (!container) return;

  const gridElement = document.getElementById('grid');
  const messageElement = document.getElementById('message-mina');
  const restartButton = document.getElementById('restart-button');
  const cashoutButton = document.getElementById('cashout-button');
  const minesInput = document.getElementById('mine-count');
  const betInput = document.getElementById('bet-amount-mina');
  const coinDisplay = document.getElementById('coin-count-mina');

  const gridSize = 5;
  let mineCount = 5;
  let coins = 1000;
  let currentBet = 0;
  let currentMultiplier = 1;
  let mines = [];
  let clickedIndexes = new Set();
  let gameOver = false;

  function updateCoinsDisplay() {
    coinDisplay.textContent = coins.toFixed(0);
  }

  function generateMines() {
    mines = [];
    while (mines.length < mineCount) {
      const idx = Math.floor(Math.random() * gridSize * gridSize);
      if (!mines.includes(idx)) mines.push(idx);
    }
  }

  function getMultiplier(clickedCount) {
    // Example progressive multiplier
    const base = 1.1;
    return +(base ** clickedCount).toFixed(2);
  }

  function handleCellClick(cell, index) {
    if (gameOver || clickedIndexes.has(index)) return;

    if (mines.includes(index)) {
      cell.classList.add('mine');
      messageElement.textContent = '💥 Você clicou em uma mina! Perdeu tudo!';
      revealMines();
      gameOver = true;
      currentBet = 0;
      cashoutButton.disabled = true;
      playExplosionSound();
      return;
    }

    clickedIndexes.add(index);
    cell.classList.add('safe');
    const multiplier = getMultiplier(clickedIndexes.size);
    currentMultiplier = multiplier;
    messageElement.textContent = `🎯 Acertou! Multiplicador atual: ${multiplier.toFixed(2)}x`;
  }

  function revealMines() {
    gridElement.querySelectorAll('.cell').forEach((cell, i) => {
      if (mines.includes(i)) {
        cell.classList.add('mine');
      }
    });
  }

  function startGame() {
    mineCount = parseInt(minesInput.value);
    const bet = parseInt(betInput.value);
    if (isNaN(bet) || bet <= 0 || bet > coins) {
      messageElement.textContent = '⚠️ Aposta inválida.';
      return;
    }

    gridElement.innerHTML = '';
    mines = [];
    clickedIndexes.clear();
    gameOver = false;
    currentBet = bet;
    currentMultiplier = 1;
    coins -= bet;
    updateCoinsDisplay();
    cashoutButton.disabled = false;
    messageElement.textContent = 'Boa sorte!';

    for (let i = 0; i < gridSize * gridSize; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = i;
      cell.addEventListener('click', () => handleCellClick(cell, i));
      gridElement.appendChild(cell);
    }

    generateMines();
  }

  function cashout() {
    if (clickedIndexes.size === 0 || gameOver) return;
    const winnings = currentBet * currentMultiplier;
    coins += winnings;
    updateCoinsDisplay();
    messageElement.textContent = `💰 Você sacou ${winnings.toFixed(0)} moedas em ${currentMultiplier.toFixed(2)}x!`;
    gameOver = true;
    cashoutButton.disabled = true;
    revealMines();
    playCashoutSound();
  }

  function playExplosionSound() {
    let ctx = new AudioContext();
    let o = ctx.createOscillator();
    let g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(120, ctx.currentTime);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    o.stop(ctx.currentTime + 0.5);
  }

  function playCashoutSound() {
    let ctx = new AudioContext();
    let o = ctx.createOscillator();
    let g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(800, ctx.currentTime);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    o.stop(ctx.currentTime + 0.5);
  }

  restartButton.addEventListener('click', startGame);
  cashoutButton.addEventListener('click', cashout);

  updateCoinsDisplay();
})();
