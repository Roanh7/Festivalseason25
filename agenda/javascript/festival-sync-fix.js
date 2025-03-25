// festival-sync-fix.js - Fix for attendance checkboxes not syncing properly on page load

/**
 * This script fixes issues with attendance and ticket checkboxes not being properly 
 * initialized after page reload. The problem was that the checkboxes would be checked 
 * based on user interaction, but after refreshing the page, they wouldn't reflect 
 * the actual data stored in the database.
 * 
 * The main issue was a race condition between different parts of the page initialization,
 * and the checkbox states not being properly synchronized between table and card views.
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Festival Sync Fix: Starting initialization");

// Only run on pages with checkboxes (agenda page)
if (!document.querySelector('.attend-checkbox, .attend-checkbox-card')) {
  console.log("Festival Sync Fix: No checkboxes found, skipping");
  return;
}

// Check if user is logged in
const token = localStorage.getItem('token');
const userEmail = localStorage.getItem('email');

if (!token || !userEmail) {
  console.log("Festival Sync Fix: User not logged in, skipping");
  return; // Not logged in, no need to sync
}

// Create a loading indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.id = 'sync-loading-indicator';
loadingIndicator.style.position = 'fixed';
loadingIndicator.style.bottom = '20px';
loadingIndicator.style.right = '20px';
loadingIndicator.style.background = '#4CAF50';
loadingIndicator.style.color = 'white';
loadingIndicator.style.padding = '8px 12px';
loadingIndicator.style.borderRadius = '4px';
loadingIndicator.style.zIndex = '1000';
loadingIndicator.style.opacity = '0.8';
loadingIndicator.textContent = 'Syncing attendance data...';
document.body.appendChild(loadingIndicator);

try {
console.log("Festival Sync Fix: Fetching attendance and ticket data...");

// Fetch festival attendance data with retry logic
let attendanceResponse, ticketResponse;
let retries = 0;
const maxRetries = 3;

while (retries < maxRetries) {
  try {
    // Fetch both in parallel for efficiency
    [attendanceResponse, ticketResponse] = await Promise.all([
      fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`),
      fetch(`/my-tickets?email=${encodeURIComponent(userEmail)}`)
    ]);
    
    if (attendanceResponse.ok && ticketResponse.ok) {
      break; // Both requests successful, exit retry loop
    }
    
    // If we get here, at least one request failed
    console.warn(`Festival Sync Fix: Fetch attempt ${retries + 1} failed, retrying...`);
    retries++;
    
    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
  } catch (fetchError) {
    console.error("Festival Sync Fix: Network error during fetch:", fetchError);
    retries++;
    
    if (retries >= maxRetries) {
      throw fetchError; // Rethrow if we've exhausted retries
    }
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
  }
}

if (!attendanceResponse.ok || !ticketResponse.ok) {
  throw new Error(`Failed to fetch data after ${maxRetries} attempts: ${attendanceResponse?.status || 'N/A'} / ${ticketResponse?.status || 'N/A'}`);
}

// Parse the response data
const attendanceData = await attendanceResponse.json();
const ticketData = await ticketResponse.json();

const userFestivals = attendanceData.festivals || [];
const userTickets = ticketData.tickets || [];

console.log(`Festival Sync Fix: User is attending ${userFestivals.length} festivals`);
console.log(`Festival Sync Fix: User has purchased tickets for ${userTickets.length} festivals`);

// Ensure we have some data before proceeding
if (userFestivals.length === 0 && userTickets.length === 0) {
  console.log("Festival Sync Fix: No attendance or ticket data found");
  return; // No need to update anything
}

// Now correctly set the checkbox states
const attendCheckboxes = document.querySelectorAll('.attend-checkbox');
const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');

if (attendCheckboxes.length === 0) {
  console.warn("Festival Sync Fix: No attendance checkboxes found in table view");
}

// First reset all checkboxes to avoid any cached state issues
attendCheckboxes.forEach(cb => {
  cb.checked = false;
});

ticketCheckboxes.forEach(cb => {
  cb.checked = false;
});

// Then set the attendance checkboxes based on server data
attendCheckboxes.forEach(cb => {
  const festName = cb.dataset.festival;
  if (userFestivals.includes(festName)) {
    cb.checked = true;
    console.log(`Festival Sync Fix: Setting attendance checkbox for "${festName}" to checked`);
  }
});

// Finally set the ticket checkboxes based on server data
ticketCheckboxes.forEach(cb => {
  const festName = cb.dataset.festival;
  if (userTickets.includes(festName)) {
    cb.checked = true;
    console.log(`Festival Sync Fix: Setting ticket checkbox for "${festName}" to checked`);
  }
});

// Also sync the card view checkboxes if they exist or wait for them to be created
syncCardViewCheckboxes(userFestivals, userTickets);

// Add a final check after a bit of time to ensure everything is synced
// This handles cases where card view is created after this script runs
setTimeout(() => {
  syncAllCheckboxes(userFestivals, userTickets);
  console.log("Festival Sync Fix: Final checkbox sync completed");
}, 1500);

console.log("Festival Sync Fix: Initial sync completed successfully!");
} catch (error) {
console.error("Festival Sync Fix: Error synchronizing attendance data:", error);

// Try a simplified approach as a fallback
try {
  console.log("Festival Sync Fix: Attempting simplified fallback sync...");
  
  // Directly sync from the window.festivals array 
  if (typeof window.festivals !== 'undefined' && Array.isArray(window.festivals)) {
    console.log("Festival Sync Fix: Using window.festivals as data source");
    
    // Fetch user's festivals directly from localStorage (if it was cached there)
    const cachedFestivals = localStorage.getItem('userFestivals');
    const cachedTickets = localStorage.getItem('userTickets');
    
    if (cachedFestivals || cachedTickets) {
      console.log("Festival Sync Fix: Found cached festival data in localStorage");
      
      let userFestivals = [];
      let userTickets = [];
      
      try {
        if (cachedFestivals) userFestivals = JSON.parse(cachedFestivals);
        if (cachedTickets) userTickets = JSON.parse(cachedTickets);
        
        // Use the cached data to update checkboxes
        syncAllCheckboxes(userFestivals, userTickets);
      } catch (parseError) {
        console.error("Festival Sync Fix: Error parsing cached data:", parseError);
      }
    }
  }
} catch (fallbackError) {
  console.error("Festival Sync Fix: Fallback sync also failed:", fallbackError);
}
} finally {
// Remove loading indicator
if (loadingIndicator && loadingIndicator.parentNode) {
  setTimeout(() => {
    loadingIndicator.style.opacity = '0';
    loadingIndicator.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      loadingIndicator.remove();
    }, 500);
  }, 1000);
}

// Add a MutationObserver to catch dynamically added checkboxes
try {
  const observer = new MutationObserver((mutations) => {
    let checkboxesAdded = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any new checkboxes were added
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            const hasCheckboxes = node.querySelector && (
              node.querySelector('.attend-checkbox') || 
              node.querySelector('.ticket-checkbox') ||
              node.querySelector('.attend-checkbox-card') ||
              node.querySelector('.ticket-checkbox-card')
            );
            
            if (hasCheckboxes || 
                node.classList && (
                  node.classList.contains('attend-checkbox') || 
                  node.classList.contains('ticket-checkbox') ||
                  node.classList.contains('attend-checkbox-card') ||
                  node.classList.contains('ticket-checkbox-card')
                )) {
              checkboxesAdded = true;
            }
          }
        });
      }
    });
    
    // If new checkboxes were added, try to sync them
    if (checkboxesAdded) {
      console.log("Festival Sync Fix: New checkboxes detected, attempting to sync");
      
      // Get the current data and sync
      const userEmail = localStorage.getItem('email');
      if (userEmail) {
        fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`)
          .then(res => res.json())
          .then(data => {
            const userFestivals = data.festivals || [];
            
            // Cache the data for potential fallback use
            localStorage.setItem('userFestivals', JSON.stringify(userFestivals));
            
            fetch(`/my-tickets?email=${encodeURIComponent(userEmail)}`)
              .then(res => res.json())
              .then(ticketData => {
                const userTickets = ticketData.tickets || [];
                
                // Cache the data for potential fallback use
                localStorage.setItem('userTickets', JSON.stringify(userTickets));
                
                // Sync all checkboxes with the new data
                syncAllCheckboxes(userFestivals, userTickets);
              })
              .catch(err => console.error("Festival Sync Fix: Error fetching ticket data in observer:", err));
          })
          .catch(err => console.error("Festival Sync Fix: Error fetching festival data in observer:", err));
      }
    }
  });
  
  // Start observing the document for changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  console.log("Festival Sync Fix: MutationObserver started to catch new checkboxes");
} catch (observerError) {
  console.error("Festival Sync Fix: Error setting up MutationObserver:", observerError);
}
}
});

// Helper function to sync card view checkboxes
function syncCardViewCheckboxes(userFestivals, userTickets) {
// Wait a bit to ensure card view has been created
setTimeout(() => {
// Look for card view checkboxes
const attendCardCheckboxes = document.querySelectorAll('.attend-checkbox-card');
const ticketCardCheckboxes = document.querySelectorAll('.ticket-checkbox-card');

if (attendCardCheckboxes.length > 0) {
  console.log("Festival Sync Fix: Syncing card view checkboxes...");
  
  // First reset all card checkboxes to avoid any cached state issues
  attendCardCheckboxes.forEach(cb => {
    cb.checked = false;
  });
  
  ticketCardCheckboxes.forEach(cb => {
    cb.checked = false;
  });
  
  // Update attendance checkboxes in card view
  attendCardCheckboxes.forEach(cb => {
    const festName = cb.dataset.festival;
    if (userFestivals.includes(festName)) {
      cb.checked = true;
      console.log(`Festival Sync Fix: Setting card attendance checkbox for "${festName}" to checked`);
    }
  });
  
  // Update ticket checkboxes in card view
  ticketCardCheckboxes.forEach(cb => {
    const festName = cb.dataset.festival;
    if (userTickets.includes(festName)) {
      cb.checked = true;
      console.log(`Festival Sync Fix: Setting card ticket checkbox for "${festName}" to checked`);
    }
  });
} else {
  console.log("Festival Sync Fix: No card view checkboxes found yet, will retry later");
  
  // If card view doesn't exist yet, try again after a delay
  // This handles cases where card view is created dynamically after page load
  setTimeout(() => {
    const retryAttendCardCheckboxes = document.querySelectorAll('.attend-checkbox-card');
    
    if (retryAttendCardCheckboxes.length > 0) {
      console.log("Festival Sync Fix: Card view checkboxes found on retry, syncing now");
      syncCardViewCheckboxes(userFestivals, userTickets);
    }
  }, 1000);
}
}, 500);
}

// Comprehensive function to sync all checkboxes in both views
function syncAllCheckboxes(userFestivals, userTickets) {
console.log("Festival Sync Fix: Performing comprehensive checkbox sync");

// Handle table view checkboxes
const attendCheckboxes = document.querySelectorAll('.attend-checkbox');
const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');

// Handle card view checkboxes
const attendCardCheckboxes = document.querySelectorAll('.attend-checkbox-card');
const ticketCardCheckboxes = document.querySelectorAll('.ticket-checkbox-card');

// Update attendance checkboxes in both views
const updateAttendanceCheckboxes = (checkboxes) => {
checkboxes.forEach(cb => {
  const festName = cb.dataset.festival;
  if (festName) {
    const shouldBeChecked = userFestivals.includes(festName);
    
    // Only update if needed to avoid triggering unnecessary events
    if (cb.checked !== shouldBeChecked) {
      cb.checked = shouldBeChecked;
      console.log(`Festival Sync Fix: Updated ${cb.className} for "${festName}" to ${shouldBeChecked}`);
    }
  }
});
};

// Update ticket checkboxes in both views
const updateTicketCheckboxes = (checkboxes) => {
checkboxes.forEach(cb => {
  const festName = cb.dataset.festival;
  if (festName) {
    const shouldBeChecked = userTickets.includes(festName);
    
    // Only update if needed to avoid triggering unnecessary events
    if (cb.checked !== shouldBeChecked) {
      cb.checked = shouldBeChecked;
      console.log(`Festival Sync Fix: Updated ${cb.className} for "${festName}" to ${shouldBeChecked}`);
    }
  }
});
};

// Apply updates to all checkbox types
updateAttendanceCheckboxes(attendCheckboxes);
updateAttendanceCheckboxes(attendCardCheckboxes);
updateTicketCheckboxes(ticketCheckboxes);
updateTicketCheckboxes(ticketCardCheckboxes);
}