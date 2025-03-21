// festival-sync-fix.js - Add this as a new file or merge into script.js

// Function to normalize festival names for comparison
function normalizeFestivalName(name) {
  // Remove extra whitespace, convert to lowercase for case-insensitive comparison
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Enhanced festival checkbox synchronization function
function syncFestivalsWithDatabase() {
  console.log("Starting festival synchronization with database...");
  
  // Only run this if the user is logged in
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  
  if (!token || !userEmail) {
    console.log("User not logged in, skipping festival sync");
    return;
  }
  
  // Fetch user's festivals from the server
  fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}&timestamp=${Date.now()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const userFestivals = data.festivals || [];
      
      // Log all festivals from database for debugging
      console.log("Festivals from database:", userFestivals);
      
      // Get all attendance checkboxes on the page
      const attendCheckboxes = document.querySelectorAll('.attend-checkbox');
      console.log(`Found ${attendCheckboxes.length} festival checkboxes on page`);
      
      // Create normalized map of festivals for efficient lookup
      const normalizedFestivals = {};
      userFestivals.forEach(fest => {
        normalizedFestivals[normalizeFestivalName(fest)] = fest;
      });
      
      // Process each checkbox
      attendCheckboxes.forEach(checkbox => {
        const festName = checkbox.dataset.festival;
        if (!festName) {
          console.warn("Found checkbox without festival name", checkbox);
          return;
        }
        
        const normalizedFestName = normalizeFestivalName(festName);
        
        // Check if this festival is in the user's selected festivals
        const matchFound = normalizedFestName in normalizedFestivals;
        
        // Log for debugging
        console.log(`Festival "${festName}" (normalized: "${normalizedFestName}") - Database match: ${matchFound}`);
        
        // Set the checkbox state based on database
        checkbox.checked = matchFound;
        
        // Also fetch ticket purchase info for this festival
        if (matchFound) {
          // Apply visual highlight to show the checkbox is database-synced
          checkbox.classList.add('db-synced');
        }
      });
      
      // Now sync ticket checkboxes
      syncTicketCheckboxes();
      
      // Also update the card view if it exists
      updateCardCheckboxes();
      
      console.log("Festival synchronization complete");
    })
    .catch(err => {
      console.error("Error synchronizing festivals with database:", err);
    });
}

// Function to sync ticket checkboxes
function syncTicketCheckboxes() {
  const userEmail = localStorage.getItem('email');
  if (!userEmail) return;
  
  // Fetch user's ticket information
  fetch(`/my-tickets?email=${encodeURIComponent(userEmail)}&timestamp=${Date.now()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const purchasedTickets = data.tickets || [];
      
      // Log all tickets from database for debugging
      console.log("Tickets from database:", purchasedTickets);
      
      // Create normalized map of tickets for efficient lookup
      const normalizedTickets = {};
      purchasedTickets.forEach(fest => {
        normalizedTickets[normalizeFestivalName(fest)] = fest;
      });
      
      // Get all ticket checkboxes
      const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');
      
      // Process each checkbox
      ticketCheckboxes.forEach(checkbox => {
        const festName = checkbox.dataset.festival;
        if (!festName) return;
        
        const normalizedFestName = normalizeFestivalName(festName);
        
        // Check if this festival is in the user's purchased tickets
        const ticketPurchased = normalizedFestName in normalizedTickets;
        
        // Log for debugging
        console.log(`Festival "${festName}" ticket status - Database match: ${ticketPurchased}`);
        
        // Set the checkbox state based on database
        checkbox.checked = ticketPurchased;
        
        if (ticketPurchased) {
          // Apply visual highlight to show the checkbox is database-synced
          checkbox.classList.add('db-synced');
        }
      });
    })
    .catch(err => {
      console.error("Error synchronizing ticket information:", err);
    });
}

// Function to update card view checkboxes
function updateCardCheckboxes() {
  // Find all card view checkboxes and update them to match the table checkboxes
  document.querySelectorAll('.attend-checkbox-card').forEach(cardCheckbox => {
    const festName = cardCheckbox.dataset.festival;
    if (!festName) return;
    
    const tableCheckbox = document.querySelector(`.attend-checkbox[data-festival="${festName}"]`);
    if (tableCheckbox) {
      cardCheckbox.checked = tableCheckbox.checked;
    }
  });
  
  document.querySelectorAll('.ticket-checkbox-card').forEach(cardCheckbox => {
    const festName = cardCheckbox.dataset.festival;
    if (!festName) return;
    
    const tableCheckbox = document.querySelector(`.ticket-checkbox[data-festival="${festName}"]`);
    if (tableCheckbox) {
      cardCheckbox.checked = tableCheckbox.checked;
    }
  });
}

// Add a style for database-synced checkboxes
function addDatabaseSyncStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .db-synced {
      /* Optional: add a subtle visual indicator for checkboxes that were synced from DB */
      /* box-shadow: 0 0 3px #4CAF50; */
    }
    
    /* Ensure checkboxes are more visible */
    .attend-checkbox, .ticket-checkbox, 
    .attend-checkbox-card, .ticket-checkbox-card {
      width: 20px !important;
      height: 20px !important;
      cursor: pointer;
      margin: 0 5px;
    }
  `;
  document.head.appendChild(style);
}

// Run the synchronization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add styles
  addDatabaseSyncStyle();
  
  // Initial sync
  syncFestivalsWithDatabase();
  
  // Listen for storage events (login/logout)
  window.addEventListener('storage', (event) => {
    if (event.key === 'token' || event.key === 'email') {
      syncFestivalsWithDatabase();
    }
  });
  
  // Re-sync when page becomes visible again (user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncFestivalsWithDatabase();
    }
  });
});

// Expose function globally for manual synchronization if needed
window.syncFestivalsWithDatabase = syncFestivalsWithDatabase;