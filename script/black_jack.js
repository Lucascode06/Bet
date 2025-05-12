const baralhoSertao = [
  'A♠', '2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠',
  'A♥', '2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥',
  'A♣', '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣',
  'A♦', '2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦'
];

let baralho = [];
let maoJogador = [];
let maoDealer = [];
let apostaAtual = 0;
let saldo = 1000;
let jogoAtivo = false;

document.addEventListener('DOMContentLoaded', () => {
  atualizarUI();
});

function embaralharBaralho() {
  baralho = [...baralhoSertao];
  for (let i = baralho.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
  }
}

function selecionarAposta(valor) {
  if (jogoAtivo) return;
  
  if (apostaAtual + valor <= saldo) {
    apostaAtual += valor;
    document.getElementById('aposta').textContent = `Aposta: ${apostaAtual} moedas`;
  } else {
    mostrarResultado("Saldo insuficiente!", "erro");
  }
  atualizarUI();
}

function novoJogo() {
  if (apostaAtual === 0) {
    mostrarResultado("Selecione uma aposta primeiro!", "erro");
    return;
  }

  embaralharBaralho();
  maoJogador = [pegarCarta(), pegarCarta()];
  maoDealer = [pegarCarta(), pegarCarta()];
  
  jogoAtivo = true;
  atualizarUI();
  verificarBlackjack();
}

function pegarCarta() {
  return baralho.pop();
}

function pedirCarta() {
  if (!jogoAtivo) return;
  
  maoJogador.push(pegarCarta());
  atualizarUI();
  
  if (calcularPontos(maoJogador) > 21) {
    fimDeJogo("Estourou! Cangaceiro ganhou.");
  }
}

function parar() {
  if (!jogoAtivo) return;
  
  while (calcularPontos(maoDealer) < 17) {
    maoDealer.push(pegarCarta());
  }
  
  atualizarUI(true);
  determinarVencedor();
}

function calcularPontos(mao) {
  let pontos = 0;
  let ases = 0;
  
  for (const carta of mao) {
    const valor = carta.substring(0, carta.length - 1);
    
    if (valor === 'A') {
      ases++;
      pontos += 11;
    } else if (['J', 'Q', 'K'].includes(valor)) {
      pontos += 10;
    } else {
      pontos += parseInt(valor);
    }
  }
  
  while (pontos > 21 && ases > 0) {
    pontos -= 10;
    ases--;
  }
  
  return pontos;
}

function verificarBlackjack() {
  const pontosJogador = calcularPontos(maoJogador);
  const pontosDealer = calcularPontos(maoDealer);
  
  if (pontosJogador === 21 && pontosDealer === 21) {
    fimDeJogo("Empate com Blackjack!");
  } else if (pontosJogador === 21) {
    fimDeJogo("Blackjack! Você ganhou!");
  } else if (pontosDealer === 21) {
    fimDeJogo("Cangaceiro fez Blackjack!");
  }
}

function determinarVencedor() {
  const pontosJogador = calcularPontos(maoJogador);
  const pontosDealer = calcularPontos(maoDealer);
  
  if (pontosJogador > 21) {
    fimDeJogo("Estourou! Cangaceiro ganhou.");
  } else if (pontosDealer > 21) {
    fimDeJogo("Cangaceiro estourou! Você ganhou!");
  } else if (pontosJogador > pontosDealer) {
    fimDeJogo("Você ganhou!");
  } else if (pontosJogador < pontosDealer) {
    fimDeJogo("Cangaceiro ganhou!");
  } else {
    fimDeJogo("Empate!");
  }
}

function fimDeJogo(mensagem) {
  jogoAtivo = false;
  
  if (mensagem.includes("ganhou!")) {
    saldo += apostaAtual * (mensagem.includes("Blackjack") ? 2.5 : 2);
    mostrarResultado(mensagem, "vitoria");
  } else if (mensagem.includes("Empate")) {
    saldo += apostaAtual;
    mostrarResultado(mensagem, "empate");
  } else {
    mostrarResultado(mensagem, "derrota");
  }
  
  apostaAtual = 0;
  atualizarUI(true);
}

function mostrarResultado(mensagem, tipo) {
  const resultadoEl = document.getElementById('resultado');
  resultadoEl.textContent = mensagem;
  
  switch(tipo) {
    case "vitoria":
      resultadoEl.style.color = "#4CAF50";
      break;
    case "empate":
      resultadoEl.style.color = "#FFC107";
      break;
    case "derrota":
      resultadoEl.style.color = "#F44336";
      break;
    default:
      resultadoEl.style.color = "#FFFFFF";
  }
}

function atualizarUI(mostrarTudo = false) {
  // Atualizar botões
  document.getElementById('pedir').disabled = !jogoAtivo;
  document.getElementById('parar').disabled = !jogoAtivo;
  document.getElementById('novo-jogo').disabled = jogoAtivo;
  
  // Atualizar saldo e aposta
  document.getElementById('saldo').textContent = `Saldo: ${saldo} moedas`;
  document.getElementById('aposta').textContent = `Aposta: ${apostaAtual} moedas`;
  
  // Atualizar cartas
  const maoJogadorEl = document.getElementById('mao-jogador');
  const maoDealerEl = document.getElementById('mao-dealer');
  
  maoJogadorEl.innerHTML = '';
  maoDealerEl.innerHTML = '';
  
  maoJogador.forEach(carta => {
    const cartaEl = document.createElement('div');
    cartaEl.className = 'carta';
    cartaEl.textContent = carta;
    maoJogadorEl.appendChild(cartaEl);
  });
  
  maoDealer.forEach((carta, index) => {
    const cartaEl = document.createElement('div');
    cartaEl.className = 'carta';
    
    if (index === 0 && !mostrarTudo && jogoAtivo) {
      cartaEl.classList.add('verso');
      cartaEl.textContent = '?';
    } else {
      cartaEl.textContent = carta;
    }
    
    maoDealerEl.appendChild(cartaEl);
  });
  
  // Mostrar pontos quando relevante
  if (mostrarTudo || !jogoAtivo) {
    const pontosJogador = calcularPontos(maoJogador);
    const pontosDealer = calcularPontos(maoDealer);
    document.getElementById('resultado').textContent += 
      ` (Você: ${pontosJogador} | Cangaceiro: ${pontosDealer})`;
  }
}
