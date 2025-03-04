// navstatus.js

document.addEventListener('DOMContentLoaded', () => {
  // A) Hamburger-klik
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  // Fix for mobile menu: ensure it starts collapsed on mobile
  function updateMenuState() {
    if (window.innerWidth <= 768) {
      // On mobile devices, ensure the menu starts collapsed
      navMenu.classList.remove('open');
    } else {
      // On desktop, we want the menu to always be visible
      navMenu.classList.remove('open'); // Reset any 'open' state 
      navMenu.style.display = ''; // Let CSS handle the display 
    }
  }
  
  // Apply initial state
  if (navToggle && navMenu) {
    // First ensure proper initial state
    updateMenuState();
    
    // Add toggle event handler
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
    
    // Update menu on resize
    window.addEventListener('resize', updateMenuState);
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