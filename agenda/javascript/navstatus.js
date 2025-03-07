// navstatus.js

document.addEventListener('DOMContentLoaded', async () => {
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

  // B) Add Account link to navigation menu
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  
  // Ensure Account link is only visible when logged in
  const addAccountLink = () => {
    // First check if account link already exists to avoid duplicates
    const existingAccountLink = Array.from(navMenu.querySelectorAll('a')).find(a => 
      a.getAttribute('href') === 'account.html'
    );
    
    if (!existingAccountLink && token && email) {
      // Create new Account link
      const accountLi = document.createElement('li');
      const accountLink = document.createElement('a');
      accountLink.href = 'account.html';
      accountLink.textContent = 'Mijn Account';
      
      // Add 'active' class if we're on the account page
      if (window.location.pathname.includes('account.html')) {
        accountLink.classList.add('active');
      }
      
      accountLi.appendChild(accountLink);
      
      // Insert before the last item if on mobile (which would be the logout item)
      if (window.innerWidth <= 768 && document.getElementById('userNameSpan')) {
        const logoutLi = document.getElementById('userNameSpan').parentElement;
        navMenu.insertBefore(accountLi, logoutLi);
      } else {
        // Otherwise append to the end
        navMenu.appendChild(accountLi);
      }
    }
  };
  
  // Call this function initially
  if (navMenu) {
    addAccountLink();
  }

  // C) Inlogstatus + Username display
  const userMenu = document.getElementById('userMenu');
  if (!userMenu) return;

  // Function to get display name (username or email)
  const getDisplayName = async (email) => {
    try {
      const response = await fetch(`/display-name?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        return data.displayName;
      }
    } catch (error) {
      console.error('Error fetching display name:', error);
    }
    return email; // Fallback to email
  };

  if (token && email) {
    // Fetch display name
    const displayName = await getDisplayName(email);
    
    // Voor mobiel: plaatsen we de user span direct in de navigatielijst als laatste item
    if (window.innerWidth <= 768) {
      const logoutLi = document.createElement('li');
      logoutLi.innerHTML = `<a href="#" id="userNameSpan" style="cursor:pointer;">Uitloggen (${displayName})</a>`;
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
      userMenu.innerHTML = `<a href="#" id="desktopUserSpan" style="color: white; text-decoration: none; font-weight: bold; padding: 0.5rem 1rem; cursor: pointer;">Uitloggen (${displayName})</a>`;
      
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
  window.addEventListener('resize', async () => {
    if (!token || !email) return;
    
    // Fetch display name
    const displayName = await getDisplayName(email);
    
    if (window.innerWidth <= 768) {
      // Als er nog geen logout item is, voeg het toe 
      if (!document.getElementById('userNameSpan')) {
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" id="userNameSpan" style="cursor:pointer;">Uitloggen (${displayName})</a>`;
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
      
      // Update the account link if needed
      addAccountLink();
      
      userMenu.innerHTML = '';
    } else {
      // Voor desktop
      userMenu.innerHTML = `<a href="#" id="desktopUserSpan" style="color: white; text-decoration: none; font-weight: bold; padding: 0.5rem 1rem; cursor: pointer;">Uitloggen (${displayName})</a>`;
      
      document.getElementById('desktopUserSpan').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Wil je uitloggen?')) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          window.location.reload();
        }
      });
      
      // Update the account link if needed
      addAccountLink();
      
      // Verwijder het logout menu-item als het bestaat
      const logoutLi = document.getElementById('userNameSpan');
      if (logoutLi && logoutLi.parentElement) {
        logoutLi.parentElement.remove();
      }
    }
  });
});