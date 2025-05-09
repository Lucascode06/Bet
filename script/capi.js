const simbolos = ["🐯", "🍒", "🍋", "🔔", "⭐", "💎"];
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

function girar() {
  if (saldo < custoRodada) {
    resultado.textContent = "Saldo insuficiente.";
    resultado.style.color = "#ff4d4d";
    return;
  }

  atualizarSaldo(saldo - custoRodada);
  girarBtn.disabled = true;
  resultado.textContent = "Processando...";
  resultado.style.color = "#cccccc";

  slot1.classList.add("spin");
  slot2.classList.add("spin");
  slot3.classList.add("spin");

  setTimeout(() => {
    const s1 = simbolos[Math.floor(Math.random() * simbolos.length)];
    const s2 = simbolos[Math.floor(Math.random() * simbolos.length)];
    const s3 = simbolos[Math.floor(Math.random() * simbolos.length)];

    slot1.textContent = s1;
    slot2.textContent = s2;
    slot3.textContent = s3;

    slot1.classList.remove("spin");
    slot2.classList.remove("spin");
    slot3.classList.remove("spin");

    if (s1 === s2 && s2 === s3) {
      const premio = custoRodada * 10;
      atualizarSaldo(saldo + premio);
      resultado.textContent = `+${premio} moedas (3 iguais)`;
      resultado.style.color = "#66ff66";
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      const premio = custoRodada * 3;
      atualizarSaldo(saldo + premio);
      resultado.textContent = `+${premio} moedas (2 iguais)`;
      resultado.style.color = "#99ff99";
    } else {
      resultado.textContent = "Nenhum ganho.";
      resultado.style.color = "#ff6666";
    }

    girarBtn.disabled = false;
  }, 1200);
}

girarBtn.addEventListener("click", girar);
atualizarSaldo(saldo);
