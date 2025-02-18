// navstatus.js

document.addEventListener('DOMContentLoaded', () => {
  // A) Hamburger-klik
  const navToggle = document.getElementById('navToggle'); // <div>☰</div>
  const navMenu = document.getElementById('navMenu');     // <ul>

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      // Toggle de .open class
      navMenu.classList.toggle('open');
    });
  }

  // B) Inlogstatus (optioneel)
  const userMenu = document.getElementById('userMenu');
  if (!userMenu) return;
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