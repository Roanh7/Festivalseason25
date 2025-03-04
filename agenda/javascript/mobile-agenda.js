// Add this code to a new file called mobile-agenda.js in your javascript folder

document.addEventListener('DOMContentLoaded', function() {
  // Only run this code on mobile devices
  if (window.innerWidth <= 768) {
    createMobileView();
  }
  
  // Also check on resize
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      createMobileView();
    } else {
      // If we resize back to desktop, restore the original table if it was hidden
      const originalTable = document.querySelector('.table-container');
      const mobileView = document.getElementById('mobile-festival-list');
      if (originalTable && mobileView) {
        originalTable.style.display = '';
        mobileView.style.display = 'none';
      }
    }
  });
  
  function createMobileView() {
    // Check if mobile view already exists
    if (document.getElementById('mobile-festival-list')) {
      return;
    }
    
    // Get the original table
    const originalTable = document.querySelector('.table-container');
    if (!originalTable) return;
    
    // Create a new container for mobile view
    const mobileView = document.createElement('div');
    mobileView.id = 'mobile-festival-list';
    mobileView.className = 'mobile-festival-list';
    
    // Get all table rows (skip the header)
    const rows = document.querySelectorAll('#festivalTbody tr');
    
    // Process each row into a card
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return; // Skip if not enough data
      
      const festivalCard = document.createElement('div');
      festivalCard.className = 'festival-card';
      
      // Keep the highlighting
      if (row.classList.contains('highlight-green')) {
        festivalCard.classList.add('highlight-green');
      } else if (row.classList.contains('highlight-yellow')) {
        festivalCard.classList.add('highlight-yellow');
      }
      
      // Get important data
      const number = cells[0].textContent;
      const checkbox = cells[1].querySelector('input').cloneNode(true);
      const attendeesBtn = cells[2].querySelector('button').cloneNode(true);
      const date = cells[3].textContent;
      const nameLink = cells[4].innerHTML; // Using innerHTML to keep the link
      const location = cells.length > 5 ? cells[5].textContent : '';
      const price = cells.length > 6 ? cells[6].textContent : '';
      const recovery = cells.length > 7 ? cells[7].textContent : '';
      const chipScale = cells.length > 8 ? cells[8].textContent : '';
      
      // Build the card
      festivalCard.innerHTML = `
        <div class="festival-header">
          <span class="festival-number">${number}</span>
          <div class="festival-name">${nameLink}</div>
        </div>
        <div class="festival-details">
          <div class="festival-detail"><strong>Datum:</strong> ${date}</div>
          <div class="festival-detail"><strong>Locatie:</strong> ${location}</div>
          <div class="festival-detail"><strong>Prijs:</strong> ${price}</div>
          <div class="festival-detail"><strong>Hersteltijd:</strong> ${recovery}</div>
          <div class="festival-detail"><strong>Chip Scale:</strong> ${chipScale}</div>
        </div>
        <div class="festival-actions">
          <div class="action-attend">
            <label>
              <span>Ga ik?</span>
              <div class="checkbox-container"></div>
            </label>
          </div>
          <div class="action-others"></div>
        </div>
      `;
      
      // Add the original checkbox and button to maintain functionality
      festivalCard.querySelector('.checkbox-container').appendChild(checkbox);
      festivalCard.querySelector('.action-others').appendChild(attendeesBtn);
      
      mobileView.appendChild(festivalCard);
    });
    
    // Insert the mobile view after the countdown and hide the original table
    const countdownContainer = document.getElementById('countdown-container');
    if (countdownContainer && countdownContainer.parentNode) {
      countdownContainer.parentNode.insertBefore(mobileView, originalTable);
      originalTable.style.display = 'none';
    }
  }
});