const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  errorDiv.textContent = '';
  const login = form.login.value.trim();
  const password = form.password.value.trim();
  if(login === '' || password === '') {
    errorDiv.textContent = 'Por favor, preencha todos os campos.';
    return;
  }
  // For demonstration: just show an alert; in real app, you'd authenticate here.
  alert(`Login: ${login}\nSenha: ${'*'.repeat(password.length)}\n\nLogin bem-sucedido (simulado).`);
  form.reset();
});