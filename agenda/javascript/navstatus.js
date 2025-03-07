// navstatus.js - User Authentication and Navigation Status

document.addEventListener('DOMContentLoaded', () => {
  // Select navigation elements
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  // Ensure the elements exist before adding event listener
  if (navToggle && navMenu) {
    // Add click event listener to the hamburger toggle
    navToggle.addEventListener('click', () => {
      // Toggle the 'open' class on the nav menu
      navMenu.classList.toggle('open');
      
      // Optional: Toggle a class on the hamburger icon if you want visual feedback
      navToggle.classList.toggle('active');
    });

    // Close menu when clicking outside of it on mobile
    document.addEventListener('click', (event) => {
      // Check if we're on mobile
      if (window.innerWidth <= 768) {
        // If the click is outside the nav menu and not on the toggle
        if (!navMenu.contains(event.target) && event.target !== navToggle) {
          navMenu.classList.remove('open');
          navToggle.classList.remove('active');
        }
      }
    });

    // Close menu when a menu item is clicked
    const menuItems = navMenu.querySelectorAll('a');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navMenu.classList.remove('open');
          navToggle.classList.remove('active');
        }
      });
    });
  }
});

  // Navigation Authentication Logic
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const navMenu = document.getElementById('navMenu');
  const userMenu = document.getElementById('userMenu');

  // Helper function to create user display
  const createUserDisplay = (displayName) => {
    // Create desktop logout span
    const desktopUserSpan = document.createElement('span');
    desktopUserSpan.id = 'desktopUserSpan';
    desktopUserSpan.textContent = `Hallo, ${displayName}`;
    desktopUserSpan.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      window.location.href = 'login.html';
    });

    // Clear previous content
    userMenu.innerHTML = '';
    userMenu.appendChild(desktopUserSpan);
  }

  // If user is logged in
  if (token && email) {
    // Fetch display name
    fetch(`/display-name?email=${encodeURIComponent(email)}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fetch display name');
      })
      .then(data => {
        createUserDisplay(data.displayName);
      })
      .catch(error => {
        console.error('Error:', error);
        createUserDisplay(email);
      });
  }

// Authentication-related navigation links update
const addAccountAndFestivalCardLinks = () => {
  // First check if account link already exists to avoid duplicates
  const existingAccountLink = Array.from(navMenu.querySelectorAll('a')).find(a => 
    a.getAttribute('href') === 'account.html'
  );
  
  const existingFestivalCardLink = Array.from(navMenu.querySelectorAll('a')).find(a => 
    a.getAttribute('href') === 'festival-card.html'
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
  
  // Add Festival Card link if not already present
  if (!existingFestivalCardLink && token && email) {
    // Create new Festival Card link
    const festivalCardLi = document.createElement('li');
    const festivalCardLink = document.createElement('a');
    festivalCardLink.href = 'festival-card.html';
    festivalCardLink.textContent = 'Festival Card';
    
    // Add 'active' class if we're on the festival card page
    if (window.location.pathname.includes('festival-card.html')) {
      festivalCardLink.classList.add('active');
    }
    
    festivalCardLi.appendChild(festivalCardLink);
    
    // Insert at the appropriate position
    if (window.innerWidth <= 768 && document.getElementById('userNameSpan')) {
      const logoutLi = document.getElementById('userNameSpan').parentElement;
      navMenu.insertBefore(festivalCardLi, logoutLi);
    } else {
      navMenu.appendChild(festivalCardLi);
    }
  }
};
