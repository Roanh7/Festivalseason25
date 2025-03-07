// Add Festival Card link to navigation

// Update this part of the addAccountLink function in navstatus.js
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