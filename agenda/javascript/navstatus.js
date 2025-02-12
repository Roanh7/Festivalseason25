document.addEventListener('DOMContentLoaded', () => {
  const userMenu = document.getElementById('userMenu');
  if (!userMenu) return; // Als een pagina geen userMenu-div heeft

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  if (token && email) {
    userMenu.innerHTML = `<span id="userNameSpan">uitloggen, ${email}</span>`;
    document.getElementById('userNameSpan').addEventListener('click', () => {
      if (confirm('Wil je uitloggen?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        window.location.reload();
      }
    });
  } else {
    userMenu.textContent = '';
  }
});