// Modification for agenda/javascript/card-view.js to improve checkbox layout

document.addEventListener('DOMContentLoaded', function() {
  // Run this code for all screen sizes, not just mobile
  createCardView();
  
  // Function to check if a festival date is in the past
  function isFestivalInPast(dateStr) {
    const now = new Date();
    
    // Handle date ranges like "18-20 april 2025"
    if (dateStr.includes('-')) {
      dateStr = dateStr.split('-')[1]; // Use the end date
    }
    
    // Parse date in Dutch format
    const months = {
      'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
      'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
    };
    
    const parts = dateStr.trim().split(' ');
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = months[parts[1].toLowerCase()];
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        const festDate = new Date(year, month, day);
        return festDate < now;
      }
    }
    
    return false;
  }
  
  function createCardView() {
    // Check if card view already exists
    if (document.getElementById('festival-card-list')) {
      // Update the existing checkboxes to match table
      updateCardCheckboxes();
      return;
    }
    
    // Get the original table
    const originalTable = document.querySelector('.table-container');
    if (!originalTable) return;
    
    // Create a new container for card view
    const cardView = document.createElement('div');
    cardView.id = 'festival-card-list';
    cardView.className = 'festival-card-list';
    
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
      const attendCheckbox = cells[1].querySelector('input');
      const ticketCheckbox = cells[2].querySelector('input');
      const attendeesBtn = cells[3].querySelector('button');
      const date = cells[4].textContent;
      const nameCell = cells[5];
      const nameLink = nameCell.querySelector('a');
      const festivalName = nameLink ? nameLink.getAttribute('data-name') : cells[5].textContent;
      const location = cells.length > 6 ? cells[6].textContent : '';
      const price = cells.length > 7 ? cells[7].textContent : '';
      const recovery = cells.length > 8 ? cells[8].textContent : '';
      const chipScale = cells.length > 9 ? cells[9].textContent : '';
      
      // Store the festival name as data attribute for easier reference
      if (attendCheckbox && attendCheckbox.dataset.festival) {
        festivalCard.dataset.festival = attendCheckbox.dataset.festival;
      }
      
      // Check if the festival date is in the past
      const isPast = isFestivalInPast(date);
      
      // Build the card with improved layout
      festivalCard.innerHTML = `
        <div class="festival-header">
          <span class="festival-number">${number}</span>
          <div class="festival-name">
            ${nameLink ? `<a href="#" class="festival-link" data-name="${festivalName}">${festivalName}</a>` : festivalName}
          </div>
        </div>
        <div class="festival-details">
          <div class="festival-detail"><strong>Datum:</strong> ${date}</div>
          <div class="festival-detail"><strong>Locatie:</strong> ${location}</div>
          <div class="festival-detail"><strong>Prijs:</strong> ${price}</div>
          <div class="festival-detail"><strong>Hersteltijd:</strong> ${recovery}</div>
          <div class="festival-detail"><strong>Chip Scale:</strong> ${chipScale}</div>
        </div>
        <div class="festival-actions">
          <div class="action-checkboxes">
            <div class="action-attend">
              <label>
                <span>Ga ik?</span>
                <div class="checkbox-container"></div>
              </label>
            </div>
            <div class="action-ticket">
              <label>
                <span>Ticket?</span>
                <div class="ticket-checkbox-container"></div>
              </label>
            </div>
          </div>
          <div class="action-others"></div>
        </div>
      `;
      
      // Create a new attendance checkbox element for the card view
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'attend-checkbox-card';
      
      // Copy data attributes and checked state from original checkbox
      if (attendCheckbox) {
        checkbox.dataset.festival = attendCheckbox.dataset.festival;
        // Set the initial checked state based on the table checkbox
        checkbox.checked = attendCheckbox.checked;
        
        // Sync checkbox state between table and card view
        checkbox.addEventListener('change', function() {
          // When card checkbox changes, update the table checkbox
          attendCheckbox.checked = checkbox.checked;
          
          // If unchecking attendance, also uncheck ticket purchase
          if (!checkbox.checked) {
            const ticketCheckboxCard = festivalCard.querySelector('.ticket-checkbox-card');
            if (ticketCheckboxCard) {
              ticketCheckboxCard.checked = false;
            }
          }
          
          // Trigger the original checkbox's change event to maintain backend functionality
          const event = new Event('change', { bubbles: true });
          attendCheckbox.dispatchEvent(event);
        });
      }
      
      // Add attendance checkbox to the card
      festivalCard.querySelector('.checkbox-container').appendChild(checkbox);
      
      // Create a new ticket checkbox for card view
      const ticketCheckboxCard = document.createElement('input');
      ticketCheckboxCard.type = 'checkbox';
      ticketCheckboxCard.className = 'ticket-checkbox-card';
      
      // Copy data attributes and checked state from original ticket checkbox
      if (ticketCheckbox) {
        ticketCheckboxCard.dataset.festival = ticketCheckbox.dataset.festival;
        // Set the initial checked state based on the table checkbox
        ticketCheckboxCard.checked = ticketCheckbox.checked;
        
        // Sync checkbox state between table and card view
        ticketCheckboxCard.addEventListener('change', function() {
          // Check if user is attending first
          if (!checkbox.checked) {
            alert(`Je moet eerst aangeven dat je naar "${festivalName}" wilt gaan voordat je een ticket kunt kopen.`);
            ticketCheckboxCard.checked = false;
            return;
          }
          
          // When card checkbox changes, update the table checkbox
          ticketCheckbox.checked = ticketCheckboxCard.checked;
          // Trigger the original checkbox's change event to maintain backend functionality
          const event = new Event('change', { bubbles: true });
          ticketCheckbox.dispatchEvent(event);
        });
      }
      
      // Add ticket checkbox to the card
      festivalCard.querySelector('.ticket-checkbox-container').appendChild(ticketCheckboxCard);
      
      // Clone and add the attendees button
      if (attendeesBtn) {
        const clonedBtn = attendeesBtn.cloneNode(true);
        
        // Update the button text based on past/future date
        if (isPast) {
          clonedBtn.textContent = "Wie zijn er hier geweest?";
        } else {
          clonedBtn.textContent = "Wie gaan er nog meer?";
        }
        
        festivalCard.querySelector('.action-others').appendChild(clonedBtn);
        
        // Ensure event listeners are preserved by manually adding them
        clonedBtn.addEventListener('click', function() {
          attendeesBtn.click();
        });
      }
      
      cardView.appendChild(festivalCard);
    });
    
    // Insert the card view after the countdown and hide the original table
    const countdownContainer = document.getElementById('countdown-container');
    if (countdownContainer && countdownContainer.parentNode) {
      const filterBar = document.querySelector('.filter-bar') || document.querySelector('.mobile-filter-bar');
      if (filterBar) {
        filterBar.after(cardView);
      } else {
        countdownContainer.parentNode.insertBefore(cardView, originalTable);
      }
      originalTable.style.display = 'none';
    }
    
    // Make sure card checkboxes match table checkboxes initially
    updateCardCheckboxes();
    
    // Add event listeners to festival links in card view
    setupCardFestivalLinks();
    
    // Add custom CSS to improve the layout
    addCustomStyles();
  }
  
  // Add custom CSS to improve the layout
  function addCustomStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Improved card view styles */
      .festival-actions {
        display: flex;
        flex-direction: column;
        padding-top: 0.8rem;
        border-top: 1px solid #eee;
        gap: 10px;
      }
      
      .action-checkboxes {
        display: flex;
        gap: 20px;
        justify-content: flex-start;
        align-items: center;
      }
      
      .action-attend, .action-ticket {
        display: flex;
        align-items: center;
      }
      
      .action-attend label, .action-ticket label {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .action-attend span, .action-ticket span {
        font-weight: bold;
        min-width: 50px;
      }
      
      .action-ticket span {
        color: #4CAF50;
      }
      
      .attend-checkbox-card, .ticket-checkbox-card {
        width: 20px;
        height: 20px;
        margin: 0;
        cursor: pointer;
      }
      
      .action-others {
        margin-top: 10px;
        width: 100%;
      }
      
      .action-others button {
        width: 100%;
      }
      
      /* Mobile optimizations */
      @media (max-width: 768px) {
        .action-checkboxes {
          justify-content: space-between;
          width: 100%;
        }
        
        .action-attend span, .action-ticket span {
          font-size: 0.9rem;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Add event listeners to festival links in the card view
  function setupCardFestivalLinks() {
    // Get the festival links from the table version of the site to access URLs
    const festivalLinks = {};
    
    // First, create a mapping of festival names to their URLs from the table version
    document.querySelectorAll(".table-container .festival-link").forEach(link => {
      const festivalName = link.dataset.name;
      if (festivalName) {
        // Store the festival name and associated URL in our dictionary
        festivalLinks[festivalName] = link;
      }
    });
    
    // Now add click event listeners to card festival links
    document.querySelectorAll("#festival-card-list .festival-link").forEach(link => {
      link.addEventListener("click", function(event) {
        event.preventDefault();
        const festivalName = this.dataset.name;
        
        if (festivalName && festivalLinks[festivalName]) {
          // Trigger the original link's click event to maintain the same behavior
          festivalLinks[festivalName].click();
        }
      });
    });
  }
  
  // Function to update card checkboxes from table view
  function updateCardCheckboxes() {
    // Update attendance checkboxes
    const tableCheckboxes = document.querySelectorAll('.attend-checkbox');
    tableCheckboxes.forEach(tableCheckbox => {
      const festivalName = tableCheckbox.dataset.festival;
      if (festivalName) {
        // Find the corresponding card and checkbox
        const card = document.querySelector(`.festival-card[data-festival="${festivalName}"]`);
        if (card) {
          const cardCheckbox = card.querySelector('.attend-checkbox-card');
          if (cardCheckbox) {
            // Sync the checked state
            cardCheckbox.checked = tableCheckbox.checked;
          }
        }
      }
    });
    
    // Update ticket checkboxes
    const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');
    ticketCheckboxes.forEach(tableCheckbox => {
      const festivalName = tableCheckbox.dataset.festival;
      if (festivalName) {
        // Find the corresponding card and checkbox
        const card = document.querySelector(`.festival-card[data-festival="${festivalName}"]`);
        if (card) {
          const cardCheckbox = card.querySelector('.ticket-checkbox-card');
          if (cardCheckbox) {
            // Sync the checked state
            cardCheckbox.checked = tableCheckbox.checked;
          }
        }
      }
    });
  }
  
  // Set up filtering functionality for all screen sizes
  setupFilterButtons();
  
  function setupFilterButtons() {
    // Create filter bar if it doesn't exist
    if (!document.querySelector('.filter-bar')) {
      createFilterBar();
    }
    
    const filterUpcoming = document.getElementById('filterUpcoming');
    const filterAll = document.getElementById('filterAll');
    const filterAttending = document.getElementById('filterAttending');
    const filterPastAttended = document.getElementById('filterPastAttended');
    
    if (filterUpcoming && filterAll && filterAttending && filterPastAttended) {
      // Get the current date
      const now = new Date();
      
      // Show only upcoming festivals
      filterUpcoming.addEventListener('click', function() {
        const cards = document.querySelectorAll('.festival-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
          const dateText = card.querySelector('.festival-detail:nth-child(1)').textContent;
          const dateMatch = dateText.match(/Datum:\s*(.+)/);
          if (dateMatch) {
            const festDate = parseDate(dateMatch[1]);
            if (festDate && festDate > now) {
              card.style.display = '';
              visibleCount++;
            } else {
              card.style.display = 'none';
            }
          }
        });
        
        // Show message if no results
        showNoResultsMessageIfNeeded(visibleCount, 'Er zijn geen aankomende festivals.');
        
        // Highlight the active filter
        setActiveFilter(filterUpcoming);
      });
      
      // Show all festivals
      filterAll.addEventListener('click', function() {
        const cards = document.querySelectorAll('.festival-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
          card.style.display = '';
          visibleCount++;
        });
        
        // Remove no results message if it exists
        const noResultsMsg = document.getElementById('no-filter-results');
        if (noResultsMsg) noResultsMsg.remove();
        
        // Highlight the active filter
        setActiveFilter(filterAll);
      });
      
      // Show only festivals you're attending
      filterAttending.addEventListener('click', function() {
        const cards = document.querySelectorAll('.festival-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
          // Look for the checkbox
          const checkbox = card.querySelector('.attend-checkbox-card');
          if (checkbox && checkbox.checked) {
            card.style.display = '';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });
        
        // Show message if no results
        showNoResultsMessageIfNeeded(visibleCount, 'Je hebt nog geen festivals geselecteerd.');
        
        // Highlight the active filter
        setActiveFilter(filterAttending);
      });
      
      // Show only past festivals you've attended
      filterPastAttended.addEventListener('click', function() {
        const cards = document.querySelectorAll('.festival-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
          const dateText = card.querySelector('.festival-detail:nth-child(1)').textContent;
          const dateMatch = dateText.match(/Datum:\s*(.+)/);
          const checkbox = card.querySelector('.attend-checkbox-card');
          
          // Check if it's in the past AND the checkbox is checked
          if (dateMatch && checkbox) {
            const festDate = parseDate(dateMatch[1]);
            if (festDate && festDate < now && checkbox.checked) {
              card.style.display = '';
              visibleCount++;
            } else {
              card.style.display = 'none';
            }
          } else {
            card.style.display = 'none';
          }
        });
        
        // Show message if no results
        showNoResultsMessageIfNeeded(visibleCount, 'Je bent nog niet naar festivals geweest.');
        
        // Highlight the active filter
        setActiveFilter(filterPastAttended);
      });
      
      // Set 'All' as the default active filter
      setActiveFilter(filterAll);
    }
  }
  
  // Helper function to create filter bar
  function createFilterBar() {
    const filterBar = document.createElement('div');
    filterBar.className = 'filter-bar';
    filterBar.innerHTML = `
      <button class="filter-button" id="filterUpcoming">Aankomende</button>
      <button class="filter-button active-filter" id="filterAll">Alle</button>
      <button class="filter-button" id="filterAttending">Ik ga</button>
      <button class="filter-button" id="filterPastAttended">Waar ben ik geweest</button>
    `;
    
    const countdownContainer = document.getElementById('countdown-container');
    if (countdownContainer) {
      countdownContainer.after(filterBar);
    }
  }
  
  // Helper function to show "no results" message when needed
  function showNoResultsMessageIfNeeded(visibleCount, message) {
    // Add a message if no festivals match the filter
    const noResultsMsg = document.getElementById('no-filter-results');
    const cardList = document.getElementById('festival-card-list');
    
    if (visibleCount === 0) {
      if (!noResultsMsg) {
        const msg = document.createElement('div');
        msg.id = 'no-filter-results';
        msg.className = 'no-results-message';
        msg.textContent = message;
        
        if (cardList) {
          cardList.appendChild(msg);
        }
      }
    } else if (noResultsMsg) {
      noResultsMsg.remove();
    }
  }
  
  // Helper function to highlight the active filter
  function setActiveFilter(activeButton) {
    const filterUpcoming = document.getElementById('filterUpcoming');
    const filterAll = document.getElementById('filterAll');
    const filterAttending = document.getElementById('filterAttending');
    const filterPastAttended = document.getElementById('filterPastAttended');
    
    if (filterUpcoming && filterAll && filterAttending && filterPastAttended) {
      [filterUpcoming, filterAll, filterAttending, filterPastAttended].forEach(btn => {
        btn.classList.remove('active-filter');
      });
      activeButton.classList.add('active-filter');
    }
  }
  
  // Helper to parse dates like "21 december 2024"
  function parseDate(dateStr) {
    const months = {
      'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
      'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
    };
    
    // Handle date ranges like "18-20 april 2025"
    if (dateStr.includes('-')) {
      dateStr = dateStr.split('-')[1];
    }
    
    const parts = dateStr.trim().split(' ');
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = months[parts[1].toLowerCase()];
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return null;
  }
});