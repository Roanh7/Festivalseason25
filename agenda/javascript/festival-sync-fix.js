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

// Improved festival synchronization fix
// Add this code to your agenda/javascript/festival-sync-fix.js file

// Enhanced function to normalize festival names for comparison
function normalizeFestivalName(name) {
  if (!name) return '';
  
  // Trim whitespace, convert to lowercase, and remove any special characters
  return name.trim().toLowerCase()
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .replace(/[^a-z0-9\s]/g, ''); // Remove special characters
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
  
  // Add cache buster to prevent caching issues
  const cacheBuster = new Date().getTime();
  
  // Fetch user's festivals from the server
  fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}&t=${cacheBuster}`)
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
        const normalized = normalizeFestivalName(fest);
        normalizedFestivals[normalized] = fest;
        console.log(`Normalized festival: "${fest}" -> "${normalized}"`);
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
        // Try both exact match and normalized match
        const exactMatch = userFestivals.includes(festName);
        const normalizedMatch = normalizedFestName in normalizedFestivals;
        const matchFound = exactMatch || normalizedMatch;
        
        // Log for debugging
        console.log(`Festival "${festName}" (normalized: "${normalizedFestName}") - Database match: ${matchFound} (exact: ${exactMatch}, normalized: ${normalizedMatch})`);
        
        // Set the checkbox state based on database
        checkbox.checked = matchFound;
        
        // Apply visual highlight to show the checkbox is database-synced
        if (matchFound) {
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

// Enhanced ticket checkbox synchronization
function syncTicketCheckboxes() {
  const userEmail = localStorage.getItem('email');
  if (!userEmail) return;
  
  // Add cache buster
  const cacheBuster = new Date().getTime();
  
  // Fetch user's ticket information
  fetch(`/my-tickets?email=${encodeURIComponent(userEmail)}&t=${cacheBuster}`)
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
        const normalized = normalizeFestivalName(fest);
        normalizedTickets[normalized] = fest;
        console.log(`Normalized ticket: "${fest}" -> "${normalized}"`);
      });
      
      // Get all ticket checkboxes
      const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');
      
      // Process each checkbox
      ticketCheckboxes.forEach(checkbox => {
        const festName = checkbox.dataset.festival;
        if (!festName) return;
        
        const normalizedFestName = normalizeFestivalName(festName);
        
        // Check if this festival is in the user's purchased tickets
        // Try both exact match and normalized match
        const exactMatch = purchasedTickets.includes(festName);
        const normalizedMatch = normalizedFestName in normalizedTickets;
        const ticketPurchased = exactMatch || normalizedMatch;
        
        // Log for debugging
        console.log(`Festival "${festName}" ticket status - Database match: ${ticketPurchased} (exact: ${exactMatch}, normalized: ${normalizedMatch})`);
        
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

// Run the synchronization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add styles
  addDatabaseSyncStyle();
  
  // Initial sync with a small delay to ensure everything else is loaded
  setTimeout(syncFestivalsWithDatabase, 300);
  
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
  
  // Set up periodic re-sync every 30 seconds
  setInterval(syncFestivalsWithDatabase, 30000);
});

// Expose function globally for manual synchronization if needed
window.syncFestivalsWithDatabase = syncFestivalsWithDatabase;

// Add this to your agenda/javascript/festival-sync-fix.js file

// Define the known problematic festivals with their exact names in the database
const problemFestivalsMap = {
  'strafwerk': 'Strafwerk',
  'boothstock': 'Boothstock Festival',
  'boothstock festival': 'Boothstock Festival',
  'toffler': 'Toffler',
  'latin village': 'Latin Village',
  'latinvillage': 'Latin Village',
  'piv': 'PIV',
  'mysteryland': 'Mysteryland',
  'into the woods': 'Into the woods',
  'intothewoods': 'Into the woods'
};

// Modified normalizeFestivalName function to handle known problematic festivals
function normalizeFestivalName(name) {
  if (!name) return '';
  
  // First, check if this is a known problematic festival
  const lowerName = name.trim().toLowerCase().replace(/\s+/g, ' ');
  if (problemFestivalsMap[lowerName]) {
    console.log(`Using explicit mapping for festival: "${name}" -> "${problemFestivalsMap[lowerName]}"`);
    return problemFestivalsMap[lowerName];
  }
  
  // Special case handling for known variants without spaces
  const noSpacesLower = lowerName.replace(/\s+/g, '');
  if (problemFestivalsMap[noSpacesLower]) {
    console.log(`Using no-spaces mapping for festival: "${name}" -> "${problemFestivalsMap[noSpacesLower]}"`);
    return problemFestivalsMap[noSpacesLower];
  }
  
  // If not a known problematic festival, normalize as usual
  return name.trim();
}

// Function to fix problem festivals directly
function fixProblemFestivals() {
  console.log("Checking for problem festivals...");
  
  // Only run this if the user is logged in
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  
  if (!token || !userEmail) {
    console.log("User not logged in, skipping problem festival fix");
    return;
  }
  
  // Get all attendance checkboxes on the page
  const attendCheckboxes = document.querySelectorAll('.attend-checkbox');
  
  // Check each known problem festival
  Object.entries(problemFestivalsMap).forEach(([normalizedName, correctName]) => {
    // Find if there's a checkbox for this festival
    const matchingCheckboxes = Array.from(attendCheckboxes).filter(checkbox => {
      const cbFestName = checkbox.dataset.festival;
      if (!cbFestName) return false;
      
      const cbNormalized = cbFestName.trim().toLowerCase().replace(/\s+/g, ' ');
      return cbNormalized === normalizedName || 
             cbNormalized === correctName.toLowerCase() ||
             cbNormalized.replace(/\s+/g, '') === normalizedName.replace(/\s+/g, '');
    });
    
    if (matchingCheckboxes.length > 0) {
      console.log(`Found ${matchingCheckboxes.length} checkboxes for problem festival: ${correctName}`);
      
      // For each matching checkbox, ensure it's marked if it should be
      matchingCheckboxes.forEach(checkbox => {
        // If the checkbox is already checked, skip
        if (checkbox.checked) {
          console.log(`Checkbox for ${correctName} is already checked`);
          return;
        }
        
        // Otherwise, force a check to the server
        console.log(`Forcing check for ${correctName}`);
        
        // Make a direct server request to attend this festival
        fetch('/attend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: userEmail,
            festival: correctName
          })
        })
        .then(response => {
          if (response.ok) {
            console.log(`Successfully forced attendance for ${correctName}`);
            // Update the checkbox
            checkbox.checked = true;
            // Also update card view
            updateCardCheckboxes();
          } else {
            console.error(`Failed to force attendance for ${correctName}`);
          }
        })
        .catch(err => {
          console.error(`Error forcing attendance for ${correctName}:`, err);
        });
      });
    } else {
      console.log(`No checkbox found for problem festival: ${correctName}`);
    }
  });
}

// Add the fix call to the initialization
document.addEventListener('DOMContentLoaded', () => {
  // Add styles
  addDatabaseSyncStyle();
  
  // Initial sync with a small delay to ensure everything else is loaded
  setTimeout(() => {
    syncFestivalsWithDatabase();
    
    // Run the problem festival fix after sync completes
    setTimeout(fixProblemFestivals, 1000);
  }, 300);
  
  // Rest of your existing event listeners...
});

// We can also create a function to directly fix a specific problem festival
window.fixSpecificFestival = function(festivalName) {
  console.log(`Manual fix requested for: ${festivalName}`);
  
  const userEmail = localStorage.getItem('email');
  if (!userEmail) {
    console.error("User not logged in, cannot fix festival");
    return false;
  }
  
  // Normalize the festival name
  const normalizedName = festivalName.trim().toLowerCase();
  
  // Find the correct name in our mapping
  const correctName = problemFestivalsMap[normalizedName] || festivalName;
  
  // Make a direct server request to attend this festival
  return fetch('/attend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: userEmail,
      festival: correctName
    })
  })
  .then(response => {
    if (response.ok) {
      console.log(`Successfully fixed attendance for ${correctName}`);
      
      // Find and update any checkboxes for this festival
      const checkboxes = document.querySelectorAll(`.attend-checkbox[data-festival="${festivalName}"]`);
      checkboxes.forEach(checkbox => {
        checkbox.checked = true;
      });
      
      // Update card view
      updateCardCheckboxes();
      return true;
    } else {
      console.error(`Failed to fix attendance for ${correctName}`);
      return false;
    }
  })
  .catch(err => {
    console.error(`Error fixing attendance for ${correctName}:`, err);
    return false;
  });
};

// Add an auto-fix function for all known problems
window.fixAllProblemFestivals = async function() {
  const userEmail = localStorage.getItem('email');
  if (!userEmail) {
    console.error("User not logged in, cannot fix festivals");
    return { success: false, error: "Not logged in" };
  }
  
  console.log("Attempting to fix all known problem festivals...");
  
  try {
    // Call our special server endpoint to fix all problem festivals
    const response = await fetch('/fix-problem-festivals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: userEmail })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Fix result:", result);
    
    // Refresh the UI to reflect the changes
    syncFestivalsWithDatabase();
    
    return { success: true, result };
  } catch (err) {
    console.error("Error fixing all problem festivals:", err);
    return { success: false, error: err.message };
  }
};

// Add to your festival-sync-fix.js
function showLoadingState() {
  document.querySelectorAll('.attend-checkbox, .ticket-checkbox').forEach(cb => {
    cb.disabled = true;
    cb.classList.add('loading');
  });
  
  // Add a message at the top of the table
  const table = document.querySelector('.table-container');
  if (table) {
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'sync-loading-msg';
    loadingMsg.className = 'loading-message';
    loadingMsg.textContent = 'Laden van festivalkeuzes...';
    table.prepend(loadingMsg);
  }
}

function hideLoadingState() {
  document.querySelectorAll('.attend-checkbox, .ticket-checkbox').forEach(cb => {
    cb.disabled = false;
    cb.classList.remove('loading');
  });
  
  const loadingMsg = document.getElementById('sync-loading-msg');
  if (loadingMsg) loadingMsg.remove();
}

// Add to festival-sync-fix.js
function syncFestivalsWithDatabase() {
  // Check cache first
  const cachedData = localStorage.getItem('festivalSyncCache');
  const cacheTimestamp = localStorage.getItem('festivalSyncTimestamp');
  
  // Use cache if it's less than 5 minutes old
  if (cachedData && cacheTimestamp) {
    const now = Date.now();
    const cacheAge = now - parseInt(cacheTimestamp);
    
    if (cacheAge < 5 * 60 * 1000) { // 5 minutes
      console.log('Using cached festival data');
      applyFestivalDataFromCache(JSON.parse(cachedData));
      return;
    }
  }
  
  // Proceed with normal synchronization...
}