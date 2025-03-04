// navstatus.js

document.addEventListener('DOMContentLoaded', () => {
  // A) Hamburger-klik
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    // Add toggle event handler
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
    
    // Reset menu state when window resizes to desktop view
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        navMenu.classList.remove('open'); // Remove open class on desktop
      }
    });
  }

  // B) Inlogstatus
  const userMenu = document.getElementById('userMenu');
  if (!userMenu) return;

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  if (token && email) {
    userMenu.innerHTML = `<span id="userNameSpan" style="cursor:pointer;">Hallo, ${email}</span>`;
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