// navstatus.js

document.addEventListener('DOMContentLoaded', () => {
  // A) HAMBURGER TOGGLE
  const navToggle = document.getElementById('navToggle'); // hamburger
  const navMenu = document.getElementById('navMenu');     // ul-menu

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // B) LOGINSTATUS
  const userMenu = document.getElementById('userMenu');
  if (userMenu) {
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
  }
});