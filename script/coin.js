function flipCoin(playerChoice) {
    const coin = document.getElementById('coin');
    const resultText = document.getElementById('result');
  
    // Add flip animation
    coin.classList.remove('flip');
    void coin.offsetWidth; // Restart animation
    coin.classList.add('flip');
  
    // Simula resultado
    const outcome = Math.random() < 0.5 ? 'cara' : 'coroa';
  
    // Muda imagem da moeda (opcional)
    coin.style.backgroundImage =
      outcome === 'cara'
        ? "url('https://upload.wikimedia.org/wikipedia/commons/8/88/1euro_head.png')"
        : "url('https://upload.wikimedia.org/wikipedia/commons/b/b3/1euro_tail.png')";
  
    // Resultado
    setTimeout(() => {
      if (playerChoice === outcome) {
        resultText.textContent = `Você escolheu ${playerChoice.toUpperCase()} e ACERTOU! 🎉`;
      } else {
        resultText.textContent = `Você escolheu ${playerChoice.toUpperCase()} e ERROU. 😢 Era ${outcome.toUpperCase()}.`;
      }
    }, 1000);
  }
      