// navstatus.js

document.addEventListener('DOMContentLoaded', () => {
  const userMenu = document.getElementById('userMenu');
  if (!userMenu) return; // geen userMenu op deze pagina

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  if (token && email) {
    userMenu.innerHTML = `<span id="userNameSpan">Hier uitloggen, ${email}</span>`;
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