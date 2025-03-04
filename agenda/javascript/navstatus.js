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
    // Voor mobiel: plaatsen we de user span direct in de navigatielijst als laatste item
    if (window.innerWidth <= 768) {
      const logoutLi = document.createElement('li');
      logoutLi.innerHTML = `<a href="#" id="userNameSpan" style="cursor:pointer;">Uitloggen (${email})</a>`;
      navMenu.appendChild(logoutLi);
      
      document.getElementById('userNameSpan').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Wil je uitloggen?')) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          window.location.reload();
        }
      });
      
      // Leeg de userMenu div zodat de twee niet tegelijk zichtbaar zijn
      userMenu.innerHTML = '';
    } else {
      // Voor desktop: gebruiken we de normale rechter userMenu
      // Changed styling to match navbar
      userMenu.innerHTML = `<a href="#" id="desktopUserSpan" style="color: white; text-decoration: none; font-weight: bold; padding: 0.5rem 1rem; cursor: pointer;">Uitloggen (${email})</a>`;
      
      document.getElementById('desktopUserSpan').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Wil je uitloggen?')) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          window.location.reload();
        }
      });
    }
  } else {
    userMenu.textContent = '';
  }
  
  // Update login display on resize
  window.addEventListener('resize', () => {
    if (!token || !email) return;
    
    if (window.innerWidth <= 768) {
      // Als er nog geen logout item is, voeg het toe 
      if (!document.getElementById('userNameSpan')) {
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" id="userNameSpan" style="cursor:pointer;">Uitloggen (${email})</a>`;
        navMenu.appendChild(logoutLi);
        
        document.getElementById('userNameSpan').addEventListener('click', (e) => {
          e.preventDefault();
          if (confirm('Wil je uitloggen?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            window.location.reload();
          }
        });
      }
      userMenu.innerHTML = '';
    } else {
      // Voor desktop
      userMenu.innerHTML = `<a href="#" id="desktopUserSpan" style="color: white; text-decoration: none; font-weight: bold; padding: 0.5rem 1rem; cursor: pointer;">Uitloggen (${email})</a>`;
      
      document.getElementById('desktopUserSpan').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Wil je uitloggen?')) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          window.location.reload();
        }
      });
      
      // Verwijder het logout menu-item als het bestaat
      const logoutLi = document.getElementById('userNameSpan');
      if (logoutLi && logoutLi.parentElement) {
        logoutLi.parentElement.remove();
      }
    }
  });
});