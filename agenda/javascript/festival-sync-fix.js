// Enhanced festival-sync-fix.js

// Global mapping of problematic festival names for consistent lookup
const FESTIVAL_NAME_MAPPINGS = {
  // Lowercase keys for lookup, exact preservation for storage
  "strafwerk": "Strafwerk",
  "boothstock": "Boothstock Festival",
  "boothstockfestival": "Boothstock Festival",
  "toffler": "Toffler",
  "latinvillage": "Latin Village",
  "latin village": "Latin Village",
  "piv": "PIV",
  "mysteryland": "Mysteryland",
  "intothewoods": "Into the woods",
  "into the woods": "Into the woods",
  "909": "909",
  "freeyourmind": "Free Your Mind",
  "free your mind": "Free Your Mind",
  "freeyourmindkingsday": "Free your mind Kingsday",
  "free your mind kingsday": "Free your mind Kingsday",
  "lovelandkingsday": "Loveland Kingsday",
  "loveland kingsday": "Loveland Kingsday",
  "mysticgarden": "Mystic Garden Festival",
  "mystic garden": "Mystic Garden Festival",
  "diynamic": "Diynamic", 
  "openair": "Open Air",
  "open air": "Open Air",
  "keinemusik": "KeineMusik",
  "vunzigedeuntjes": "Vunzige Deuntjes",
  "vunzige deuntjes": "Vunzige Deuntjes",
  "noart": "No Art",
  "no art": "No Art",
  "parelsvandestad": "Parels van de stad",
  "parels van de stad": "Parels van de stad",
  "music on": "Music On",
  "musicon": "Music On",
  "awakeningsupclose": "Awakenings Upclose",
  "awakenings upclose": "Awakenings Upclose",
  "awakeningsfestival": "Awakenings Festival",
  "awakenings festival": "Awakenings Festival"
};

// More aggressive normalization function for festival names
function normalizeFestivalNameForLookup(name) {
  if (!name) return '';
  
  // Normalize for lookup: lowercase, remove spaces, remove special chars
  let normalized = name.trim().toLowerCase()
    .replace(/\s+/g, '')    // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
  
  // Debug logging
  console.log(`Normalized festival for lookup: "${name}" -> "${normalized}"`);
  
  return normalized;
}

// Function to find exact festival name from the database
function getCanonicalFestivalName(festivalName) {
  if (!festivalName) return '';
  
  // First try trimmed version (preserving case)
  const trimmedName = festivalName.trim();
  
  // Then normalize for lookup
  const normalizedName = normalizeFestivalNameForLookup(festivalName);
  
  // Check if it's in our mapping
  if (FESTIVAL_NAME_MAPPINGS[normalizedName]) {
    console.log(`Found mapping for "${festivalName}" -> "${FESTIVAL_NAME_MAPPINGS[normalizedName]}"`);
    return FESTIVAL_NAME_MAPPINGS[normalizedName];
  }
  
  // Return the trimmed original if no mapping found
  return trimmedName;
}

// Function to update checkboxes to match database
async function syncFestivalsWithDatabase() {
  console.log("Starting enhanced festival sync with database...");
  
  // Only run for logged-in users
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  
  if (!token || !userEmail) {
    console.log("User not logged in, skipping festival sync");
    return;
  }
  
  // Show a subtle loading state
  showSyncLoadingState();
  
  try {
    // Add cache buster to prevent cached responses
    const cacheBuster = Date.now();
    
    // Fetch all user's festival attendance data
    const response = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}&t=${cacheBuster}`);
    
    // Check for response errors
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${await response.text()}`);
    }
    
    // Parse the response data
    const data = await response.json();
    const userFestivals = data.festivals || [];
    
    console.log("Festivals from database:", userFestivals);
    
    // Create normalized lookup maps for faster matching
    const normalizedFestivals = {};
    const exactFestivals = {};
    
    userFestivals.forEach(fest => {
      // Exact name preservation
      exactFestivals[fest] = true;
      
      // Normalized for lookup
      const normalized = normalizeFestivalNameForLookup(fest);
      normalizedFestivals[normalized] = fest;
    });
    
    // Process all attendance checkboxes
    const attendCheckboxes = document.querySelectorAll('.attend-checkbox');
    console.log(`Processing ${attendCheckboxes.length} attendance checkboxes`);
    
    attendCheckboxes.forEach(checkbox => {
      const festName = checkbox.dataset.festival;
      if (!festName) {
        console.warn("Checkbox without festival name", checkbox);
        return;
      }
      
      // Try multiple matching strategies
      const exactMatch = exactFestivals[festName];
      const normalizedName = normalizeFestivalNameForLookup(festName);
      const normalizedMatch = normalizedFestivals[normalizedName];
      const canonicalMatch = getCanonicalFestivalName(festName);
      const canonicalInList = userFestivals.includes(canonicalMatch);
      
      // Check if festival is in user's selections by any method
      const isAttending = exactMatch || normalizedMatch || canonicalInList;
      
      console.log(`Festival "${festName}": Attending=${isAttending}`, {
        exactMatch,
        normalizedMatch,
        canonicalMatch,
        canonicalInList
      });
      
      // Update checkbox state
      checkbox.checked = isAttending;
      
      // Mark as synced from database
      if (isAttending) {
        checkbox.classList.add('db-synced');
      } else {
        checkbox.classList.remove('db-synced');
      }
    });
    
    // Now sync ticket checkboxes
    await syncTicketCheckboxes();
    
    // Update any card view checkboxes
    if (typeof updateCardCheckboxes === 'function') {
      updateCardCheckboxes();
    }
    
    console.log("Festival synchronization complete!");
  } catch (err) {
    console.error("Error synchronizing festivals:", err);
  } finally {
    // Hide loading state
    hideSyncLoadingState();
  }
}

// Sync ticket checkboxes
async function syncTicketCheckboxes() {
  const userEmail = localStorage.getItem('email');
  if (!userEmail) return;
  
  try {
    // Cache buster to prevent cached responses
    const cacheBuster = Date.now();
    
    // Fetch user's ticket data
    const response = await fetch(`/my-tickets?email=${encodeURIComponent(userEmail)}&t=${cacheBuster}`);
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const data = await response.json();
    const ticketData = data.tickets || [];
    
    console.log("Tickets from database:", ticketData);
    
    // Create lookup maps
    const exactTickets = {};
    const normalizedTickets = {};
    
    ticketData.forEach(fest => {
      exactTickets[fest] = true;
      const normalized = normalizeFestivalNameForLookup(fest);
      normalizedTickets[normalized] = fest;
    });
    
    // Process all ticket checkboxes
    const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');
    
    ticketCheckboxes.forEach(checkbox => {
      const festName = checkbox.dataset.festival;
      if (!festName) return;
      
      // Try multiple matching strategies
      const exactMatch = exactTickets[festName];
      const normalizedName = normalizeFestivalNameForLookup(festName);
      const normalizedMatch = normalizedTickets[normalizedName];
      const canonicalMatch = getCanonicalFestivalName(festName);
      const canonicalInList = ticketData.includes(canonicalMatch);
      
      // Check if ticket is purchased by any method
      const hasTicket = exactMatch || normalizedMatch || canonicalInList;
      
      console.log(`Festival "${festName}" ticket: Purchased=${hasTicket}`);
      
      // Update checkbox state
      checkbox.checked = hasTicket;
      
      // Mark as synced from database
      if (hasTicket) {
        checkbox.classList.add('db-synced');
      } else {
        checkbox.classList.remove('db-synced');
      }
    });
  } catch (err) {
    console.error("Error syncing ticket checkboxes:", err);
  }
}

// Helper functions for loading state
function showSyncLoadingState() {
  document.querySelectorAll('.attend-checkbox, .ticket-checkbox').forEach(cb => {
    cb.classList.add('sync-loading');
  });
}

function hideSyncLoadingState() {
  document.querySelectorAll('.attend-checkbox, .ticket-checkbox').forEach(cb => {
    cb.classList.remove('sync-loading');
  });
}

// Add styles for syncing feedback
function addSyncStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .attend-checkbox.sync-loading,
    .ticket-checkbox.sync-loading {
      opacity: 0.6;
    }
    
    .attend-checkbox.db-synced,
    .ticket-checkbox.db-synced {
      box-shadow: 0 0 3px #4CAF50;
    }
    
    /* Fix for checkbox visibility */
    .attend-checkbox, 
    .ticket-checkbox, 
    .attend-checkbox-card, 
    .ticket-checkbox-card {
      width: 22px !important;
      height: 22px !important;
      cursor: pointer;
      margin: 0 5px;
    }
  `;
  document.head.appendChild(styleEl);
}

// Function to directly fix a specific problematic festival
window.fixSpecificFestival = async function(festivalName) {
  console.log(`Manual fix requested for: ${festivalName}`);
  
  const userEmail = localStorage.getItem('email');
  if (!userEmail) {
    console.error("User not logged in, cannot fix festival");
    return false;
  }
  
  // Get canonical name
  const canonicalName = getCanonicalFestivalName(festivalName);
  
  // Make a direct server request to attend this festival
  try {
    const response = await fetch('/attend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        festival: canonicalName
      })
    });
    
    if (response.ok) {
      console.log(`Successfully fixed attendance for ${canonicalName}`);
      
      // Run full sync to update UI
      await syncFestivalsWithDatabase();
      return true;
    } else {
      console.error(`Failed to fix attendance for ${canonicalName}: ${await response.text()}`);
      return false;
    }
  } catch (err) {
    console.error(`Error fixing attendance for ${canonicalName}:`, err);
    return false;
  }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log("Initializing enhanced festival sync...");
  
  // Add styles
  addSyncStyles();
  
  // Initial sync with a delay to ensure everything is loaded
  setTimeout(() => {
    syncFestivalsWithDatabase();
  }, 500);
  
  // Listen for storage events (login/logout)
  window.addEventListener('storage', (event) => {
    if (event.key === 'token' || event.key === 'email') {
      syncFestivalsWithDatabase();
    }
  });
  
  // Re-sync when page becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncFestivalsWithDatabase();
    }
  });
  
  // Set up periodic re-sync every 15 seconds (if page is visible)
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      syncFestivalsWithDatabase();
    }
  }, 15000);
});

// Add functions for manual troubleshooting
window.debugFestivalSync = function() {
  syncFestivalsWithDatabase();
};

window.checkFestivalName = function(name) {
  const normalized = normalizeFestivalNameForLookup(name);
  const canonical = getCanonicalFestivalName(name);
  
  console.log({
    original: name,
    normalized: normalized,
    canonical: canonical,
    inMapping: !!FESTIVAL_NAME_MAPPINGS[normalized]
  });
  
  return {
    original: name,
    normalized: normalized, 
    canonical: canonical,
    inMapping: !!FESTIVAL_NAME_MAPPINGS[normalized]
  };
};

// Export functions globally
window.syncFestivalsWithDatabase = syncFestivalsWithDatabase;
window.syncTicketCheckboxes = syncTicketCheckboxes;
window.normalizeFestivalNameForLookup = normalizeFestivalNameForLookup;
window.getCanonicalFestivalName = getCanonicalFestivalName;