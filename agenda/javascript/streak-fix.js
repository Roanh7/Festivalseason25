// This file contains the fixes for the Festival Streak functionality
// Add this code to your festival-card.js file or create a new file and include it

// Wait for document to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the festival card page
  if (window.location.href.includes('festival-card.html')) {
    // Add our retry and fix logic
    initializeStreakFix();
  }
});

// Main function to initialize the streak fix
function initializeStreakFix() {
  console.log('Initializing streak fix...');
  
  // Add manual recalculation button
  addRecalculateButton();
  
  // Add styles for the button
  addRecalculateButtonStyles();
  
  // Try to load streak info with retry
  loadStreakWithRetry();
}

// Add a recalculate button to the UI
function addRecalculateButton() {
  // Find the streak section
  const streakSection = document.querySelector('.streak-section');
  if (!streakSection) {
    console.error('Streak section not found');
    return;
  }
  
  // Check if button already exists
  if (document.getElementById('recalculate-streak-btn')) return;
  
  // Create button
  const button = document.createElement('button');
  button.id = 'recalculate-streak-btn';
  button.className = 'btn recalculate-btn';
  button.textContent = 'Recalculate Streak';
  button.addEventListener('click', manualRecalculateStreak);
  
  // Create a container for the button
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'recalculate-btn-container';
  buttonContainer.appendChild(button);
  
  // Add to the streak section
  streakSection.appendChild(buttonContainer);
  
  console.log('Recalculate button added');
}

// Add CSS styles for the recalculate button
function addRecalculateButtonStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .recalculate-btn-container {
      text-align: center;
      margin-top: 1rem;
    }
    
    .recalculate-btn {
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }
    
    .recalculate-btn:hover {
      background-color: #45a049;
      transform: translateY(-2px);
    }
    
    .recalculate-btn:active {
      transform: translateY(0);
    }
    
    /* Make the streak box show a loading state */
    .streak-loading .streak-value {
      opacity: 0.5;
    }
    
    /* Animation for streak update */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    .streak-updated {
      animation: pulse 0.5s ease;
      color: #4CAF50 !important;
    }
  `;
  document.head.appendChild(style);
  console.log('Styles added');
}

// Load streak with retry logic
async function loadStreakWithRetry(retryCount = 0) {
  const maxRetries = 3;
  const currentStreakEl = document.getElementById('current-streak');
  const bestStreakEl = document.getElementById('best-streak');
  
  if (!currentStreakEl || !bestStreakEl) {
    console.error('Streak elements not found');
    return;
  }
  
  try {
    console.log(`Attempt ${retryCount + 1} to load streak info`);
    
    // Show loading state
    currentStreakEl.parentElement.classList.add('streak-loading');
    bestStreakEl.parentElement.classList.add('streak-loading');
    
    // If streak shows as "?", set it to 0 first
    if (currentStreakEl.textContent === "?") {
      currentStreakEl.textContent = "0";
    }
    if (bestStreakEl.textContent === "?") {
      bestStreakEl.textContent = "0";
    }
    
    // Get user email from localStorage
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      console.error('No user email found in localStorage');
      return;
    }
    
    // Add timestamp to prevent caching
    const response = await fetch(`/user-streak?email=${encodeURIComponent(userEmail)}&t=${Date.now()}`);
    const data = await response.json();
    
    console.log('Streak data received:', data);
    
    // Update UI with streak information
    const prevCurrentStreak = parseInt(currentStreakEl.textContent) || 0;
    
    // Set the values (ensuring they're numbers)
    const newCurrentStreak = parseInt(data.currentStreak) || 0;
    const newBestStreak = parseInt(data.bestStreak) || 0;
    
    currentStreakEl.textContent = newCurrentStreak;
    bestStreakEl.textContent = newBestStreak;
    
    // Remove loading state
    currentStreakEl.parentElement.classList.remove('streak-loading');
    bestStreakEl.parentElement.classList.remove('streak-loading');
    
    // Add animation if streak changed
    if (prevCurrentStreak !== newCurrentStreak) {
      currentStreakEl.classList.add('streak-updated');
      
      // Remove animation class after it completes
      setTimeout(() => {
        currentStreakEl.classList.remove('streak-updated');
      }, 600);
    }
    
    console.log(`Streak updated: current=${newCurrentStreak}, best=${newBestStreak}`);
    
    // If the streak is still showing as 0 but user has attended festivals,
    // automatically try to recalculate
    if (newCurrentStreak === 0) {
      const pastCount = parseInt(document.getElementById('past-count')?.textContent || "0");
      if (pastCount > 0) {
        console.log(`User has ${pastCount} past festivals but streak is 0. Auto-recalculating...`);
        await manualRecalculateStreak();
      }
    }
    
  } catch (error) {
    console.error('Error loading streak info:', error);
    
    // Remove loading state
    if (currentStreakEl) {
      currentStreakEl.parentElement.classList.remove('streak-loading');
    }
    if (bestStreakEl) {
      bestStreakEl.parentElement.classList.remove('streak-loading');
    }
    
    // Retry if we haven't reached max retries
    if (retryCount < maxRetries) {
      console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => {
        loadStreakWithRetry(retryCount + 1);
      }, 1000 * (retryCount + 1)); // Exponential backoff
    } else {
      console.log('Max retries reached. Giving up.');
      
      // Set default values after all retries fail
      if (currentStreakEl) {
        currentStreakEl.textContent = "0";
      }
      if (bestStreakEl) {
        bestStreakEl.textContent = "0";
      }
    }
  }
}

// Function to manually recalculate streak
async function manualRecalculateStreak() {
  const currentStreakEl = document.getElementById('current-streak');
  const bestStreakEl = document.getElementById('best-streak');
  const recalcButton = document.getElementById('recalculate-streak-btn');
  
  if (!currentStreakEl || !bestStreakEl) {
    console.error('Streak elements not found');
    return;
  }
  
  try {
    // Show loading state
    if (recalcButton) {
      recalcButton.disabled = true;
      recalcButton.textContent = 'Recalculating...';
    }
    
    currentStreakEl.parentElement.classList.add('streak-loading');
    bestStreakEl.parentElement.classList.add('streak-loading');
    
    // Get user email
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      throw new Error('No user email found');
    }
    
    console.log('Manually recalculating streak...');
    
    // Call our new simplified endpoint
    const response = await fetch('/recalculate-streak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: userEmail })
    });
    
    const data = await response.json();
    console.log('Recalculation response:', data);
    
    // Update UI
    const newCurrentStreak = parseInt(data.currentStreak) || 0;
    const newBestStreak = parseInt(data.bestStreak) || 0;
    
    currentStreakEl.textContent = newCurrentStreak;
    bestStreakEl.textContent = newBestStreak;
    
    // Add animation
    currentStreakEl.classList.add('streak-updated');
    setTimeout(() => {
      currentStreakEl.classList.remove('streak-updated');
    }, 600);
    
    // Remove loading state
    currentStreakEl.parentElement.classList.remove('streak-loading');
    bestStreakEl.parentElement.classList.remove('streak-loading');
    
    console.log(`Streak recalculated: current=${newCurrentStreak}, best=${newBestStreak}`);
    
  } catch (error) {
    console.error('Error recalculating streak:', error);
    alert('Error recalculating streak. Please try again later.');
  } finally {
    // Reset button state
    if (recalcButton) {
      recalcButton.disabled = false;
      recalcButton.textContent = 'Recalculate Streak';
    }
    
    // Make sure loading state is removed
    if (currentStreakEl) {
      currentStreakEl.parentElement.classList.remove('streak-loading');
    }
    if (bestStreakEl) {
      bestStreakEl.parentElement.classList.remove('streak-loading');
    }
  }
}

// Add an initialization function to trigger after page load
window.fixStreakDisplay = function() {
  console.log('Manual streak fix triggered');
  loadStreakWithRetry();
};

// Run initialization
console.log('Streak fix script loaded');