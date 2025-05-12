document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const wheel = document.querySelector('.wheel');
  const apostaBtn = document.getElementById('apostar-btn');
  const valorApostaInput = document.getElementById('valor-aposta');
  const valorAtualSpan = document.getElementById('valor-atual');
  const saldoSpan = document.getElementById('saldo');
  const historicoElement = document.getElementById('historico-resultados');
  const contVermelho = document.getElementById('cont-vermelho');
  const contPreto = document.getElementById('cont-preto');
  const contBranco = document.getElementById('cont-branco');
  const opcoesAposta = document.querySelectorAll('.aposta-opcao');
  const voltarBtn = document.getElementById('voltar-btn');

  // Configurações
  const cores = [
    { nome: 'vermelho', deg: 0, probability: 45, payout: 1 },
    { nome: 'preto', deg: 120, probability: 45, payout: 1 },
    { nome: 'branco', deg: 240, probability: 10, payout: 7 }
  ];

  // Estado do jogo
  let estado = {
    saldo: 500,
    apostaAtual: 0,
    corSelecionada: null,
    girando: false,
    historico: [],
    estatisticas: { vermelho: 0, preto: 0, branco: 0 }
  };

  // Inicialização
  function init() {
    criarRoleta();
    atualizarUI();
    setupEventListeners();
  }

  // Criar visual da roleta
  function criarRoleta() {
    cores.forEach(cor => {
      const segmento = document.createElement('div');
      segmento.style.position = 'absolute';
      segmento.style.width = '50%';
      segmento.style.height = '50%';
      segmento.style.transformOrigin = '100% 100%';
      segmento.style.transform = `rotate(${cor.deg}deg) skewY(-30deg)`;
      segmento.style.backgroundColor = cor.nome === 'vermelho' ? '#E94560' : 
                                       cor.nome === 'preto' ? '#000000' : '#F8F8F8';
      segmento.style.border = '1px solid #333';
      wheel.appendChild(segmento);
    });
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Selecionar cor
    opcoesAposta.forEach(opcao => {
      opcao.addEventListener('click', () => {
        if (estado.girando) return;
        
        opcoesAposta.forEach(o => o.classList.remove('selecionada'));
        opcao.classList.add('selecionada');
        estado.corSelecionada = opcao.dataset.cor;
      });
    });

    // Controle de valor
    document.querySelectorAll('.valor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const valor = parseInt(btn.dataset.valor);
        let novoValor = parseInt(valorApostaInput.value) + valor;
        
        if (novoValor < 10) novoValor = 10;
        if (novoValor > estado.saldo) novoValor = estado.saldo;
        
        valorApostaInput.value = novoValor;
        valorAtualSpan.textContent = novoValor;
      });
    });

    // Input manual
    valorApostaInput.addEventListener('change', () => {
      let valor = parseInt(valorApostaInput.value);
      
      if (isNaN(valor) || valor < 10) valor = 10;
      if (valor > estado.saldo) valor = estado.saldo;
      
      valorApostaInput.value = valor;
      valorAtualSpan.textContent = valor;
    });

    // Apostar e girar
    apostaBtn.addEventListener('click', () => {
      if (estado.girando || !estado.corSelecionada || estado.saldo < parseInt(valorApostaInput.value)) {
        alert(estado.girando ? "A roleta já está girando!" : 
              !estado.corSelecionada ? "Selecione uma cor para apostar!" : 
              "Saldo insuficiente!");
        return;
      }
      
      estado.apostaAtual = parseInt(valorApostaInput.value);
      estado.saldo -= estado.apostaAtual;
      estado.girando = true;
      
      atualizarUI();
      girarRoleta();
    });

    // Botão de voltar
    voltarBtn.addEventListener('click', () => {
      if (estado.girando) {
        alert("Aguarde a roleta parar antes de voltar!");
        return;
      }
      window.location.href = document.referrer || 'index.html';
    });
  }

  // Girar a roleta
  function girarRoleta() {
    // Selecionar resultado aleatório com probabilidades
    const random = Math.random() * 100;
    let resultado;
    let cumulativeProb = 0;

    for (const cor of cores) {
      cumulativeProb += cor.probability;
      if (random <= cumulativeProb) {
        resultado = cor;
        break;
      }
    }

    // Calcular rotação (5 voltas + posição do segmento)
    const voltas = 5;
    const rotation = (voltas * 360) + (360 - (resultado.deg + 30));
    
    // Aplicar animação
    wheel.style.transform = `rotate(${-rotation}deg)`;
    apostaBtn.disabled = true;

    // Processar resultado após animação
    setTimeout(() => {
      processarResultado(resultado);
    }, 4000);
  }

  // Processar resultado
  function processarResultado(resultado) {
    // Atualizar estatísticas
    estado.estatisticas[resultado.nome]++;
    estado.historico.unshift(resultado.nome);
    
    // Verificar vitória
    if (estado.corSelecionada === resultado.nome) {
      const payout = cores.find(c => c.nome === resultado.nome).payout;
      const ganho = estado.apostaAtual * payout;
      estado.saldo += ganho;
      
      // Efeito visual de vitória
      document.querySelector(`[data-cor="${resultado.nome}"]`).classList.add('vitoria');
      setTimeout(() => {
        document.querySelector(`[data-cor="${resultado.nome}"]`).classList.remove('vitoria');
      }, 2000);
    }

    // Resetar estado
    estado.girando = false;
    estado.apostaAtual = 0;
    
    // Verificar saldo
    if (estado.saldo <= 0) {
      alert("Seu saldo acabou! Recarregue para continuar jogando.");
    }
    
    // Atualizar UI
    atualizarUI();
    apostaBtn.disabled = false;
  }

  // Atualizar interface
  function atualizarUI() {
    saldoSpan.textContent = estado.saldo.toLocaleString('pt-BR');
    valorAtualSpan.textContent = valorApostaInput.value;
    
    // Atualizar estatísticas
    contVermelho.textContent = estado.estatisticas.vermelho;
    contPreto.textContent = estado.estatisticas.preto;
    contBranco.textContent = estado.estatisticas.branco;
    
    // Atualizar histórico
    historicoElement.innerHTML = '';
    estado.historico.slice(0, 10).forEach(cor => {
      const bola = document.createElement('div');
      bola.className = 'resultado-bola';
      bola.style.backgroundColor = cor === 'vermelho' ? '#E94560' : 
                                  cor === 'preto' ? '#000000' : '#F8F8F8';
      bola.style.color = cor === 'preto' ? '#FFFFFF' : '#000000';
      bola.textContent = cor.charAt(0).toUpperCase();
      historicoElement.appendChild(bola);
    });
    
    // Atualizar estado do botão
    apostaBtn.disabled = estado.girando || !estado.corSelecionada || estado.saldo < 10;
  }

  // Iniciar aplicação
  init();
});
