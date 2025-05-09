/* ================== Shared Utilities ================== */
function delay(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

/* ================== Tesouros do Cerrado Game ================== */
(() => {
  const container = document.getElementById('tesouros');
  if(!container) return;
  const symbols = [
    { symbol: '🐯', name: 'Tigrinho', type: 'wild' },
    { symbol: '🦜', name: 'Arara', type: 'scatter' },
    { symbol: '🐆', name: 'Onça', type: 'normal' },
    { symbol: '🍍', name: 'Abacaxi', type: 'normal' },
    { symbol: '🍉', name: 'Melancia', type: 'normal' },
    { symbol: '🍂', name: 'Folha', type: 'normal' },
    { symbol: '💰', name: 'Cofre de Ouro', type: 'jackpot' }
  ];
  const reelsCount = 5;
  const rowsCount = 3;
  let coins = 100;
  let bet = 5;
  let freeSpinsLeft = 0;
  let spinning = false;
  const reelElements = [];
  for(let i=1; i<=reelsCount; i++) {
    reelElements.push(document.getElementById('reel'+i));
  }
  const spinButton = document.getElementById('spin-button');
  const coinCountEl = document.getElementById('coin-count');
  const messageEl = document.getElementById('message');
  const confettiContainer = document.getElementById('confetti-container');
  let currentResult = [];
  function getRandomSymbolIndex(){
    const weights = [5, 6, 14, 14, 14, 14, 1];
    let total = weights.reduce((a,b) => a+b, 0);
    let rnd = Math.floor(Math.random() * total);
    for(let i=0; i<weights.length; i++) {
      if(rnd < weights[i]) return i;
      rnd -= weights[i];
    }
    return weights.length-1;
  }
  function createSymbolEl(symbolIndex) {
    const symObj = symbols[symbolIndex];
    const el = document.createElement('div');
    el.classList.add('symbol');
    el.textContent = symObj.symbol;
    el.title = symObj.name;
    return el;
  }
  function initSlotDisplay() {
    currentResult = [];
    for(let r=0; r<reelsCount; r++) {
      currentResult[r] = [];
      reelElements[r].innerHTML = '';
      for(let y=0; y<rowsCount; y++) {
        let idx = getRandomSymbolIndex();
        currentResult[r].push(idx);
        let symEl = createSymbolEl(idx);
        reelElements[r].appendChild(symEl);
      }
    }
  }
  async function spinReels(){
    spinning = true;
    spinButton.disabled = true;
    messageEl.textContent = '';
    if(coins < bet && freeSpinsLeft <= 0) {
      alert("Você não tem moedas suficientes!");
      spinning = false;
      spinButton.disabled = false;
      return;
    }
    if(freeSpinsLeft > 0){
      freeSpinsLeft--;
      messageEl.textContent = `Rodadas grátis: ${freeSpinsLeft} restantes 🎉`;
    } else {
      coins -= bet;
      updateCoins();
    }
    for(let cycle = 0; cycle < 15; cycle++) {
      for(let r=0; r<reelsCount; r++) {
        reelElements[r].innerHTML = '';
        for(let y=0; y<rowsCount; y++) {
          reelElements[r].appendChild(createSymbolEl(getRandomSymbolIndex()));
        }
      }
      await delay(50 + cycle*10);
    }
    for(let r=0; r<reelsCount; r++) {
      currentResult[r] = [];
      reelElements[r].innerHTML = '';
      for(let y=0; y<rowsCount; y++) {
        let idx = getRandomSymbolIndex();
        currentResult[r].push(idx);
        reelElements[r].appendChild(createSymbolEl(idx));
      }
    }
    const resultMessage = evaluateWin(currentResult);
    messageEl.innerHTML = resultMessage.message || '';
    if(resultMessage.isWin){
      coins += resultMessage.coins;
      updateCoins();
      launchConfetti();
    }
    if(freeSpinsLeft === 0 && resultMessage.freeSpinsAwarded > 0) {
      freeSpinsLeft = resultMessage.freeSpinsAwarded;
      messageEl.innerHTML += ` <br>Rodadas grátis ativadas! 🎉 Você tem ${freeSpinsLeft} rodadas grátis.`;
    }
    spinning = false;
    spinButton.disabled = false;
  }
  function evaluateWin(matrix){
    const paylines = [];
    for(let y=0; y<rowsCount; y++) {
      paylines.push(Array.from({length: reelsCount}, (_, r) => matrix[r][y]));
    }
    paylines.push([matrix[0][0], matrix[1][1], matrix[2][2], matrix[3][1], matrix[4][0]]);
    paylines.push([matrix[0][2], matrix[1][1], matrix[2][0], matrix[3][1], matrix[4][2]]);
    let totalCoinsWon = 0;
    let freeSpinsAwarded = 0;
    let scatterCount = 0;
    for(let r=0; r<reelsCount; r++) {
      for(let s=0; s<rowsCount; s++) {
        if(symbols[matrix[r][s]].type === 'scatter') scatterCount++;
      }
    }
    if(scatterCount >= 3) {
      freeSpinsAwarded = 5;
      totalCoinsWon += bet * 2;
    }
    paylines.forEach(line => {
      let count = 1;
      let baseSymbol = line[0];
      if(symbols[baseSymbol].type === 'wild') {
        for(let i=1; i<line.length; i++){
          if(symbols[line[i]].type !== 'wild'){
            baseSymbol = line[i];
            break;
          }
        }
      }
      for(let i=1; i<line.length; i++){
        if(line[i] === baseSymbol || symbols[line[i]].type === 'wild' || symbols[baseSymbol].type === 'wild'){
          count++;
        } else break;
      }
      if(count >= 3 && (symbols[baseSymbol].type === 'normal' || symbols[baseSymbol].type === 'jackpot')){
        let pay = 0;
        switch(baseSymbol){
          case 6:
            pay = bet * 50;
            break;
          case 2:
            pay = bet * 8;
            break;
          case 3:
          case 4:
            pay = bet * 5;
            break;
          case 5:
            pay = bet * 3;
            break;
          default:
            pay = bet * 2;
        }
        totalCoinsWon += pay;
      }
      if(count >= 3 && symbols[baseSymbol].type === 'wild'){
        totalCoinsWon += bet * 10 * (count - 2);
      }
    });
    if(totalCoinsWon > 0){
      return {
        isWin: true,
        coins: totalCoinsWon,
        message: `Você ganhou ${totalCoinsWon} moedas!`,
        freeSpinsAwarded
      };
    }
    return { isWin: false, coins: 0, freeSpinsAwarded: 0, message: "Não houve ganho desta vez. Tente novamente!" };
  }
  function updateCoins(){
    coinCountEl.textContent = coins;
  }
  function launchConfetti(){
    const count = 100;
    const colors = ['#ffca28', '#ff7043', '#d84315', '#f57c00', '#ff8f00'];
    for(let i=0; i<count; i++){
      const conf = document.createElement('div');
      conf.classList.add('confetti');
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.left = (Math.random() * container.clientWidth) + 'px';
      conf.style.top = '0';
      conf.style.opacity = Math.random();
      conf.style.boxShadow = `0 0 8px ${colors[Math.floor(Math.random() * colors.length)]}`;
      conf.style.animationDuration = (1 + Math.random()*2) + 's';
      conf.style.animationDelay = (Math.random()*0.5) + 's';
      confettiContainer.appendChild(conf);
      setTimeout(() => { conf.remove(); }, 2500);
    }
  }
  updateCoins();
  initSlotDisplay();
  spinButton.addEventListener('click', () => { if(!spinning) spinReels(); });
})();

/* ================== Crash Run Game ================== */
(() => {
  const section = document.getElementById('crash');
  if(!section) return;
  let coins = 1000;
  let bet = 0;
  let multiplier = 1;
  let crashPoint = 0;
  let isRunning = false;
  const coinCountEl = document.getElementById('coin-count-crash');
  const multiplierEl = document.getElementById('multiplier');
  const graphEl = document.getElementById('graph');
  const startButton = document.getElementById('start-button');
  const cashoutButton = document.getElementById('cashout-button');
  const betAmountInput = document.getElementById('bet-amount');
  const messageEl = document.getElementById('message-crash');

  function updateCoins() {
    coinCountEl.textContent = coins.toFixed(0);
  }
  function resetGraph() {
    multiplier = 1;
    graphEl.style.width = '0%';
    multiplierEl.textContent = '1.00x';
    messageEl.textContent = '';
    cashoutButton.disabled = true;
  }

  function startRound() {
    if(isRunning) return;
    bet = parseInt(betAmountInput.value);
    if(!bet || bet <= 0) {
      messageEl.textContent = 'Digite uma aposta válida.';
      return;
    }
    if(bet > coins) {
      messageEl.textContent = 'Você não tem moedas suficientes.';
      return;
    }
    coins -= bet;
    updateCoins();
    isRunning = true;
    cashoutButton.disabled = false;
    messageEl.textContent = '';
    crashPoint = +(Math.random() * 6.99 + 1.01).toFixed(2);
    multiplier = 1;
    let startTime = Date.now();
    function tick() {
      if(!isRunning) return;
      let elapsed = (Date.now() - startTime) / 1000;
      multiplier = Math.exp(elapsed / 6);
      multiplier = Math.min(multiplier, 999); 
      multiplierEl.textContent = multiplier.toFixed(2) + 'x';
      let percent = Math.min((multiplier - 1) / 9 * 100, 100);
      graphEl.style.width = percent + '%';
      if (multiplier >= crashPoint) {
        isRunning = false;
        cashoutButton.disabled = true;
        messageEl.textContent = `Quebrou em ${crashPoint.toFixed(2)}x! Você perdeu a aposta.`;
        startButton.disabled = false;
        resetGraph();
        playCrashSound();
        return;
      }
      requestAnimationFrame(tick);
    }
    startButton.disabled = true;
    tick();
    playTensionSound();
  }

  function cashout() {
    if(!isRunning) return;
    isRunning = false;
    let payout = bet * multiplier;
    coins += payout;
    updateCoins();
    messageEl.textContent = `Você sacou em ${multiplier.toFixed(2)}x e ganhou ${payout.toFixed(0)} moedas! 🎉`;
    cashoutButton.disabled = true;
    startButton.disabled = false;
    resetGraph();
    playCashoutSound();
    stopTensionSound();
  }

  startButton.addEventListener('click', () => {
    messageEl.textContent = '';
    resetGraph();
    startRound();
  });
  cashoutButton.addEventListener('click', cashout);
  updateCoins();
  resetGraph();

  let audioCtx = null;
  let tensionOscillator = null;
  let tensionGain = null;
  function playTensionSound() {
    if(audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    tensionOscillator = audioCtx.createOscillator();
    tensionGain = audioCtx.createGain();
    tensionOscillator.type = 'sawtooth';
    tensionOscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    tensionGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    tensionOscillator.connect(tensionGain).connect(audioCtx.destination);
    tensionOscillator.start();
    tensionOscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 10);
  }
  function stopTensionSound() {
    if(tensionOscillator) {
      tensionOscillator.stop();
      tensionOscillator.disconnect();
      tensionGain.disconnect();
    }
    audioCtx = null;
    tensionOscillator = null;
    tensionGain = null;
  }
  function playCrashSound() {
    if(!window.AudioContext) return;
    let ctx = new AudioContext();
    let o = ctx.createOscillator();
    let g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(100, ctx.currentTime);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.stop(ctx.currentTime + 0.5);
  }
  function playCashoutSound() {
    if(!window.AudioContext) return;
    let ctx = new AudioContext();
    let o = ctx.createOscillator();
    let g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(800, ctx.currentTime);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.stop(ctx.currentTime + 0.5);
  }
})();

/* ================== Jogo da Mina ================== */
(() => {
  const container = document.getElementById('mina');
  if(!container) return;
  const gridElement = document.getElementById('grid');
  const messageElement = document.getElementById('message-mina');
  const restartButton = document.getElementById('restart-button');
  const gridSize = 5;
  const mineCount = 5;
  let mines = [];
  let cellsClicked = 0;
  let gameOver = false;

  function initGame() {
      gridElement.innerHTML = '';
      mines = [];
      cellsClicked = 0;
      gameOver = false;
      messageElement.textContent = '';
      for (let i = 0; i < gridSize * gridSize; i++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.dataset.index = i;
          cell.addEventListener('click', () => handleCellClick(cell, i));
          gridElement.appendChild(cell);
      }
      while (mines.length < mineCount) {
          const randomIndex = Math.floor(Math.random() * (gridSize * gridSize));
          if (!mines.includes(randomIndex)) {
              mines.push(randomIndex);
          }
      }
  }
  function handleCellClick(cell, index) {
      if (gameOver || cell.classList.contains('clicked')) return;
      cell.classList.add('clicked');
      cellsClicked++;
      if (mines.includes(index)) {
          cell.classList.add('mine');
          messageElement.textContent = 'Você perdeu!';
          gameOver = true;
          revealMines();
          playExplosionSound();
      } else {
          const nearby = countNearbyMines(index);
          cell.textContent = nearby > 0 ? nearby : '';
          if (cellsClicked === (gridSize * gridSize - mineCount)) {
              messageElement.textContent = 'Você venceu!';
              gameOver = true;
          }
      }
  }
  function countNearbyMines(index) {
      const neighbors = [-gridSize-1, -gridSize, -gridSize+1, -1, +1, gridSize-1, gridSize, gridSize+1];
      let count = 0;
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      neighbors.forEach(offset => {
          const n = index + offset;
          const nx = n % gridSize;
          const ny = Math.floor(n / gridSize);
          if(n >= 0 && n < gridSize*gridSize && mines.includes(n) && Math.abs(nx - x) <=1 && Math.abs(ny - y) <=1){
              count++;
          }
      });
      return count;
  }
  function revealMines() {
      gridElement.querySelectorAll('.cell').forEach(cell => {
          const idx = parseInt(cell.dataset.index);
          if(mines.includes(idx)) cell.classList.add('mine');
      });
  }
  function playExplosionSound() {
    if(!window.AudioContext) return;
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
  restartButton.addEventListener('click', initGame);
  initGame();
})();

/* ================== Game Selector Logic ================== */
(() => {
  const btnTesouros = document.getElementById('btn-tesouros');
  const btnCrash = document.getElementById('btn-crash');
  const btnMina = document.getElementById('btn-mina');
  const tesourosSection = document.getElementById('tesouros');
  const crashSection = document.getElementById('crash');
  const minaSection = document.getElementById('mina');

  function showTesouros(){
    tesourosSection.classList.add('active');
    crashSection.classList.remove('active');
    minaSection.classList.remove('active');
    btnTesouros.classList.add('active');
    btnCrash.classList.remove('active');
    btnMina.classList.remove('active');
    btnTesouros.setAttribute('aria-pressed', 'true');
    btnCrash.setAttribute('aria-pressed', 'false');
    btnMina.setAttribute('aria-pressed', 'false');
  }
  function showCrash(){
    tesourosSection.classList.remove('active');
    crashSection.classList.add('active');
    minaSection.classList.remove('active');
    btnTesouros.classList.remove('active');
    btnCrash.classList.add('active');
    btnMina.classList.remove('active');
    btnTesouros.setAttribute('aria-pressed', 'false');
    btnCrash.setAttribute('aria-pressed', 'true');
    btnMina.setAttribute('aria-pressed', 'false');
  }
  function showMina(){
    tesourosSection.classList.remove('active');
    crashSection.classList.remove('active');
    minaSection.classList.add('active');
    btnTesouros.classList.remove('active');
    btnCrash.classList.remove('active');
    btnMina.classList.add('active');
    btnTesouros.setAttribute('aria-pressed', 'false');
    btnCrash.setAttribute('aria-pressed', 'false');
    btnMina.setAttribute('aria-pressed', 'true');
  }

  btnTesouros.addEventListener('click', showTesouros);
  btnCrash.addEventListener('click', showCrash);
  btnMina.addEventListener('click', showMina);

  showTesouros();
})();