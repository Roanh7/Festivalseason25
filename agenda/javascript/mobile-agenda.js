// mobile-agenda.js - Fixed version with proper state synchronization

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
      // Instead of returning, let's update the existing checkboxes
      updateMobileCheckboxes();
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
      const checkboxCell = cells[1].querySelector('input');
      const attendeesBtn = cells[2].querySelector('button');
      const date = cells[3].textContent;
      const nameLink = cells[4].innerHTML; // Using innerHTML to keep the link
      const location = cells.length > 5 ? cells[5].textContent : '';
      const price = cells.length > 6 ? cells[6].textContent : '';
      const recovery = cells.length > 7 ? cells[7].textContent : '';
      const chipScale = cells.length > 8 ? cells[8].textContent : '';
      
      // Store the festival name as data attribute for easier reference
      if (checkboxCell && checkboxCell.dataset.festival) {
        festivalCard.dataset.festival = checkboxCell.dataset.festival;
      }
      
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
      
      // Important: Create a new checkbox element for the mobile view
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'attend-checkbox-mobile';
      
      // Copy data attributes and checked state from original checkbox
      if (checkboxCell) {
        checkbox.dataset.festival = checkboxCell.dataset.festival;
        // CRUCIAL: Set the initial checked state based on the table checkbox
        checkbox.checked = checkboxCell.checked;
        
        // Sync checkbox state between table and card view
        checkbox.addEventListener('change', function() {
          // When mobile checkbox changes, update the table checkbox
          checkboxCell.checked = checkbox.checked;
          // Trigger the original checkbox's change event to maintain backend functionality
          const event = new Event('change', { bubbles: true });
          checkboxCell.dispatchEvent(event);
        });
        
        // Listen for changes to the table checkbox as well (two-way binding)
        checkboxCell.addEventListener('change', function() {
          // When table checkbox changes, update the mobile checkbox
          checkbox.checked = checkboxCell.checked;
        });
      }
      
      // Add checkbox to the card
      festivalCard.querySelector('.checkbox-container').appendChild(checkbox);
      
      // Clone and add the attendees button
      if (attendeesBtn) {
        const clonedBtn = attendeesBtn.cloneNode(true);
        festivalCard.querySelector('.action-others').appendChild(clonedBtn);
        
        // Ensure event listeners are preserved by manually adding them
        clonedBtn.addEventListener('click', function() {
          attendeesBtn.click();
        });
      }
      
      mobileView.appendChild(festivalCard);
    });
    
    // Insert the mobile view after the countdown and hide the original table
    const countdownContainer = document.getElementById('countdown-container');
    if (countdownContainer && countdownContainer.parentNode) {
      const mobileFilterBar = document.querySelector('.mobile-filter-bar');
      if (mobileFilterBar) {
        mobileFilterBar.after(mobileView);
      } else {
        countdownContainer.parentNode.insertBefore(mobileView, originalTable);
      }
      originalTable.style.display = 'none';
    }
  }
  
  // Function to update mobile checkboxes from table view (for existing mobile view)
  function updateMobileCheckboxes() {
    const tableCheckboxes = document.querySelectorAll('.attend-checkbox');
    tableCheckboxes.forEach(tableCheckbox => {
      const festivalName = tableCheckbox.dataset.festival;
      if (festivalName) {
        // Find the corresponding mobile card and checkbox
        const mobileCard = document.querySelector(`.festival-card[data-festival="${festivalName}"]`);
        if (mobileCard) {
          const mobileCheckbox = mobileCard.querySelector('.attend-checkbox-mobile');
          if (mobileCheckbox) {
            // Sync the checked state
            mobileCheckbox.checked = tableCheckbox.checked;
          }
        }
      }
    });
  }
});