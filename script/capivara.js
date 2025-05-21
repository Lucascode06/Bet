const simbolos = [
  { emoji: "🦫", nome: "Capivara", cor: "#a0522d" },
  { emoji: "🌽", nome: "Milho", cor: "#ffe066" },
  { emoji: "🍉", nome: "Melancia", cor: "#ff6384" },
  { emoji: "💧", nome: "Água", cor: "#4fc3f7" },
  { emoji: "🌿", nome: "Folha", cor: "#81c784" },
  { emoji: "💎", nome: "Diamante", cor: "#b3e0ff" }
];
const slot1 = document.getElementById("slot1");
const slot2 = document.getElementById("slot2");
const slot3 = document.getElementById("slot3");
const resultado = document.getElementById("resultado");
const saldoEl = document.getElementById("saldo");
const girarBtn = document.getElementById("girar");

let saldo = 1000;
const custoRodada = 10;

function atualizarSaldo(valor) {
  saldo = Math.max(0, valor);
  saldoEl.textContent = saldo;
}

function animarSlots(simbolosAnim) {
  [slot1, slot2, slot3].forEach((slot, i) => {
    slot.classList.add("spin");
    slot.style.color = simbolosAnim[i].cor;
  });
}
function pararAnimacaoSlots(simbolosFinais) {
  [slot1, slot2, slot3].forEach((slot, i) => {
    slot.classList.remove("spin");
    slot.style.color = simbolosFinais[i].cor;
  });
}
function girar() {
  if (saldo < custoRodada) {
    resultado.textContent = "Saldo insuficiente.";
    resultado.style.color = "#ff4d4d";
    return;
  }
  atualizarSaldo(saldo - custoRodada);
  girarBtn.disabled = true;
  resultado.textContent = "Girando...";
  resultado.style.color = "#cccccc";

  let animInterval = setInterval(() => {
    const animSimbolos = [0, 1, 2].map(() => simbolos[Math.floor(Math.random() * simbolos.length)]);
    [slot1, slot2, slot3].forEach((slot, i) => {
      slot.textContent = animSimbolos[i].emoji;
      slot.style.color = animSimbolos[i].cor;
    });
    animarSlots(animSimbolos);
  }, 90);

  setTimeout(() => {
    clearInterval(animInterval);
    const s1 = simbolos[Math.floor(Math.random() * simbolos.length)];
    const s2 = simbolos[Math.floor(Math.random() * simbolos.length)];
    const s3 = simbolos[Math.floor(Math.random() * simbolos.length)];
    slot1.textContent = s1.emoji;
    slot2.textContent = s2.emoji;
    slot3.textContent = s3.emoji;
    pararAnimacaoSlots([s1, s2, s3]);

    let premio = 0;
    let mensagem = "Nenhum ganho.";
    let cor = "#ff6666";
    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
      premio = custoRodada * 20;
      mensagem = `Jackpot Capivara! +${premio} moedas (${s1.nome} x3)`;
      cor = "#66ff66";
    } else if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
      premio = custoRodada * 5;
      mensagem = `+${premio} moedas (2 iguais)`;
      cor = "#99ff99";
    }
    atualizarSaldo(saldo + premio);
    resultado.textContent = mensagem;
    resultado.style.color = cor;
    girarBtn.disabled = false;
  }, 1400);
}

girarBtn.addEventListener("click", girar);
atualizarSaldo(saldo);
