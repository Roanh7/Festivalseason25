// Updated navstatus.js script with separate greeting and logout functionality

document.addEventListener('DOMContentLoaded', () => {
  // Select navigation elements
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  // Ensure the elements exist before adding event listener
  if (navToggle && navMenu) {
    // Add click event listener to the hamburger toggle
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      
      // Toggle the 'open' class on the nav menu
      navMenu.classList.toggle('open');
      
      // Toggle active class on the hamburger icon for rotation animation
      navToggle.classList.toggle('active');
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', (event) => {
      // If the menu is open and the click is outside the menu and not on the toggle
      if (navMenu.classList.contains('open') && 
          !navMenu.contains(event.target) && 
          event.target !== navToggle) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
      }
    });

    // Prevent clicks on the menu from closing it
    navMenu.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    // Close menu when a menu item is clicked
    const menuItems = navMenu.querySelectorAll('a');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const userMenu = document.getElementById('userMenu');

  // Select login and register nav items to hide when logged in
  const loginNavItem = Array.from(navMenu?.querySelectorAll('li') || []).find(item => 
    item.querySelector('a[href="login.html"]')
  );
  
  const registerNavItem = Array.from(navMenu?.querySelectorAll('li') || []).find(item => 
    item.querySelector('a[href="register.html"]')
  );
  
  // Modified: Create separate greeting and logout elements
  const createUserDisplay = (displayName) => {
    // Create the container for user info in navbar
    const userInfoContainer = document.createElement('div');
    userInfoContainer.id = 'userInfoContainer';
    userInfoContainer.className = 'user-info-container';
    
    // Create greeting span
    const greetingSpan = document.createElement('span');
    greetingSpan.id = 'userGreeting';
    greetingSpan.className = 'user-greeting';
    greetingSpan.textContent = `Hallo, ${displayName}`;
    
    // Create logout button
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logoutButton';
    logoutButton.className = 'logout-button';
    logoutButton.textContent = 'Uitloggen';
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      window.location.href = 'login.html';
    });

    // Add elements to container
    userInfoContainer.appendChild(greetingSpan);
    userInfoContainer.appendChild(logoutButton);

    // Clear previous content
    if (userMenu) {
      userMenu.innerHTML = '';
      userMenu.appendChild(userInfoContainer);
    }
    
    // Hide login and register items if they exist
    if (loginNavItem) loginNavItem.style.display = 'none';
    if (registerNavItem) registerNavItem.style.display = 'none';
    
    // Add mobile logout option
    if (navMenu) {
      // Check if mobile logout already exists
      const existingMobileLogout = navMenu.querySelector('.mobile-logout');
      if (!existingMobileLogout && window.innerWidth <= 768) {
        const mobileLogoutLi = document.createElement('li');
        mobileLogoutLi.className = 'mobile-logout';
        const mobileLogoutLink = document.createElement('a');
        mobileLogoutLink.href = '#';
        mobileLogoutLink.textContent = `Uitloggen (${displayName})`;
        mobileLogoutLink.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          window.location.href = 'login.html';
        });
        mobileLogoutLi.appendChild(mobileLogoutLink);
        navMenu.appendChild(mobileLogoutLi);
      }
    }
  };

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
  } else {
    // User is not logged in, make sure login/register are visible
    if (loginNavItem) loginNavItem.style.display = '';
    if (registerNavItem) registerNavItem.style.display = '';
    
    // Clear user menu
    if (userMenu) {
      userMenu.innerHTML = '';
    }
  }

  // Authentication-related navigation links update
  const addAccountAndFestivalCardLinks = () => {
    if (!navMenu) return;
    
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
      
      // Insert before the last item or logout if it exists
      const mobileLogout = navMenu.querySelector('.mobile-logout');
      if (mobileLogout) {
        navMenu.insertBefore(accountLi, mobileLogout);
      } else {
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
      const mobileLogout = navMenu.querySelector('.mobile-logout');
      const accountLink = Array.from(navMenu.querySelectorAll('a')).find(a => 
        a.getAttribute('href') === 'account.html'
      );
      
      if (accountLink && accountLink.parentElement) {
        navMenu.insertBefore(festivalCardLi, accountLink.parentElement.nextSibling);
      } else if (mobileLogout) {
        navMenu.insertBefore(festivalCardLi, mobileLogout);
      } else {
        navMenu.appendChild(festivalCardLi);
      }
    }
  };
  
  // Call function to update navigation
  addAccountAndFestivalCardLinks();
});