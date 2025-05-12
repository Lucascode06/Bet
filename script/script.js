document.addEventListener('DOMContentLoaded', function() {
  // Elementos da UI
  const configToggle = document.getElementById('config-toggle');
  const configMenu = document.getElementById('config-menu');
  const saldoValor = document.querySelector('.saldo-valor');
  const notificationBadge = document.querySelector('.notification-badge');
  
  // Estado inicial
  let saldo = 100.00;
  let notificacoes = 3;

  // Funções
  function formatarSaldo() {
    saldoValor.textContent = saldo.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function atualizarNotificacoes() {
    // Simular novas notificações (substituir por lógica real)
    notificacoes = Math.floor(Math.random() * 5) + 1;
    notificationBadge.textContent = notificacoes;
    
    if (notificacoes > 0) {
      notificationBadge.style.display = 'flex';
      notificationBadge.classList.add('new-notification');
      setTimeout(() => {
        notificationBadge.classList.remove('new-notification');
      }, 1000);
    } else {
      notificationBadge.style.display = 'none';
    }
  }

  // Event Listeners
  configToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    configMenu.classList.toggle('active');
  });

  document.addEventListener('click', function() {
    configMenu.classList.remove('active');
  });

  configMenu.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Inicialização
  formatarSaldo();
  atualizarNotificacoes();

  // Simular atualizações periódicas (remover em produção)
  setInterval(atualizarNotificacoes, 10000);
});
