// festival-card.js - Handles both personal and other users' festival cards

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements - Personal Card
  const notLoggedInSection = document.getElementById('not-logged-in');
  const myFestivalCard = document.getElementById('my-festival-card');
  const usernameDisplay = document.getElementById('username-display');
  const upcomingCountEl = document.getElementById('upcoming-count');
  const pastCountEl = document.getElementById('past-count');
  const totalCountEl = document.getElementById('total-count');
  
  // DOM Elements - Other Users Section
  const viewOtherUsers = document.getElementById('view-other-users');
  const userFestivalCard = document.getElementById('user-festival-card');
  const backToListBtn = document.getElementById('back-to-list');
  const userCardName = document.getElementById('user-card-name');
  const userUpcomingCount = document.getElementById('user-upcoming-count');
  const userPastCount = document.getElementById('user-past-count');
  const userTotalCount = document.getElementById('user-total-count');
  const userMedals = document.getElementById('user-medals');
  const commonFestivalsList = document.getElementById('common-festivals-list');
  
  // DOM Elements - New Collapsible Users List
  const toggleUsersListBtn = document.getElementById('toggle-users-list');
  const usersListContainer = document.getElementById('users-list-container');
  const usersList = document.getElementById('users-list');
  
  // DOM Elements - Streak Feature
  const currentStreakEl = document.getElementById('current-streak');
  const bestStreakEl = document.getElementById('best-streak');
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const currentUserEmail = localStorage.getItem('email');
  
  // Festival date information
  const festivalDates = {
    "Wavy": "2024-12-21",
    "DGTL": "2025-04-18",
    "Free your mind Kingsday": "2025-04-26",
    "Loveland Kingsday": "2025-04-26",
    "Verbond": "2025-05-05",
    "Awakenings Upclose": "2025-05-17",
    "PIV": "2025-05-30",
    "Soenda": "2025-05-31",
    "Toffler": "2025-05-31",
    "909": "2025-06-07",
    "Diynamic": "2025-06-07",
    "Open Air": "2025-06-08",
    "Free Your Mind": "2025-06-08",
    "Mystic Garden Festival": "2025-06-14",
    "Vunzige Deuntjes": "2025-07-05",
    "KeineMusik": "2025-07-05",
    "Boothstock Festival": "2025-07-12",
    "Awakenings Festival": "2025-07-11",
    "Tomorrowland": "2025-07-18",
    "Mysteryland": "2025-07-22",
    "No Art": "2025-07-26",
    "Loveland": "2025-08-09",
    "Strafwerk": "2025-08-16",
    "Latin Village": "2025-08-17",
    "Parels van de stad": "2025-09-13",
    "Into the woods": "2025-09-19"
  };
  
  // Festival prices for spending calculation
  const festivalPrices = {
    "Wavy": 26.04,
    "DGTL": 90.00,
    "Free your mind Kingsday": 33.33,
    "Loveland Kingsday": 51.00,
    "Verbond": 60.00,
    "Awakenings Upclose": 79.95,
    "PIV": 60.00,
    "Toffler": 50.00,
    "Soenda": 69.95,
    "Diynamic": 33.00,
    "909": 52.50,
    "Open Air": 63.00,
    "Free Your Mind": 54.75,
    "Mystic Garden Festival": 85.00,
    "Vunzige Deuntjes": 69.00,
    "KeineMusik": 100.00,
    "Boothstock Festival": 70.00,
    "Awakenings Festival": 109.00,
    "Tomorrowland": 105.00,
    "Mysteryland": 119.95,
    "No Art": 70.00,
    "Loveland": 82.50,
    "Latin Village": 50.00,
    "Strafwerk": 0.00, // Price not provided, setting to 0
    "Parels van de stad": 36.00,
    "Into the woods": 53.00
  };

  // Title based on points (same as in statistieken.js)
  function getUserTitle(points) {
    if (points >= 35) return "S-Team Hall of Famer";
    if (points >= 31) return "S-Team Sterspeler";
    if (points >= 26) return "S-Team Elite";
    if (points >= 21) return "Meester Schaatser";
    if (points >= 16) return "Schaatser";
    if (points >= 11) return "Casanova";
    if (points >= 6) return "Rookie Festivalganger";
    return "Chimang";
  }
  
  // Helper function to format date
  function formatDate(isoDate) {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  // Make the function available globally
  window.updateFestivalCardSpending = updateFestivalCardSpending;
  
  // Check if there are pending ticket updates from other pages
  const ticketsUpdated = localStorage.getItem('ticketsUpdated');
  if (ticketsUpdated === 'true') {
    // Clear the flag
    localStorage.removeItem('ticketsUpdated');
    
    // Re-load the spending data
    console.log('Detected ticket changes from another page, refreshing spending data...');
    setTimeout(() => {
      initializePage();
    }, 500);
  }
  
  // If user is not logged in, show message and return
  if (!token || !currentUserEmail) {
    notLoggedInSection.classList.remove('hidden');
    myFestivalCard.classList.add('hidden');
    viewOtherUsers.classList.add('hidden');
    return;
  }
  
  // If user is logged in, hide message and show cards
  notLoggedInSection.classList.add('hidden');
  myFestivalCard.classList.remove('hidden');
  viewOtherUsers.classList.remove('hidden');
  
  // Function to calculate spending on festivals, split between past and future
  async function calculateTotalSpending(festivals) {
    try {
      // First, get the user's email
      const userEmail = localStorage.getItem('email');
      if (!userEmail) return { pastSpent: "0.00", futureSpend: "0.00", totalSpent: "0.00" };
      
      // Fetch ticket purchase status from the server
      const ticketResponse = await fetch(`/my-tickets?email=${encodeURIComponent(userEmail)}`);
      if (!ticketResponse.ok) {
        console.error(`Error fetching ticket data: ${ticketResponse.status}`);
        return { pastSpent: "0.00", futureSpend: "0.00", totalSpent: "0.00" };
      }
      
      const ticketData = await ticketResponse.json();
      const purchasedTickets = ticketData.tickets || [];
      
      // Calculate spending split between past and future festivals
      let pastSpent = 0;
      let futureSpend = 0;
      const now = new Date();
      
      festivals.forEach(festName => {
        const dateStr = festivalDates[festName];
        if (!dateStr || festivalPrices[festName] === undefined) return;
        
        const festDate = new Date(dateStr);
        const ticketPurchased = purchasedTickets.includes(festName);
        
        // Check if festival is in the past or future
        if (festDate < now) {
          // Past festival - always count as spent
          pastSpent += festivalPrices[festName];
        } else {
          // Future festival - depend on ticket status
          if (ticketPurchased) {
            // Already purchased ticket - add to past spent
            pastSpent += festivalPrices[festName];
          } else {
            // Planning to attend but hasn't bought ticket - add to future spend
            futureSpend += festivalPrices[festName];
          }
        }
      });

      return {
        pastSpent: pastSpent.toFixed(2),     // Amount already spent
        futureSpend: futureSpend.toFixed(2), // Amount to be spent
        totalSpent: (pastSpent + futureSpend).toFixed(2) // Total overall
      };
    } catch (error) {
      console.error('Error calculating spending:', error);
      return { pastSpent: "0.00", futureSpend: "0.00", totalSpent: "0.00" };
    }
  }
  
  // Function to update spending display on the festival card
  async function updateFestivalCardSpending() {
    // Only proceed if we're on the festival card page
    if (!window.location.pathname.includes('festival-card.html')) {
      return;
    }
    
    try {
      // Get the logged-in user
      const userEmail = localStorage.getItem('email');
      if (!userEmail) return;
      
      // Get the user's festivals
      const response = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        console.error(`Error fetching user festivals: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      const userFestivals = data.festivals || [];
      
      // Calculate spending with ticket status
      const spendingData = await calculateTotalSpending(userFestivals);
      
      // Update the spending displays
      const pastSpentElement = document.getElementById('past-spending');
      const futureSpendElement = document.getElementById('future-spending');
      const totalSpendingElement = document.getElementById('total-spending');
      
      if (pastSpentElement) {
        pastSpentElement.textContent = `€${spendingData.pastSpent}`;
      }
      
      if (futureSpendElement) {
        futureSpendElement.textContent = `€${spendingData.futureSpend}`;
      }
      
      if (totalSpendingElement) {
        totalSpendingElement.textContent = `€${spendingData.totalSpent}`;
      }
    } catch (error) {
      console.error('Error updating festival card spending:', error);
    }
  }

  // Get user's title based on phone numbers count
  async function getUserTitleFromServer(userEmail) {
    try {
      // Fetch phone numbers from server
      const response = await fetch(`/my-phone-numbers?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch phone numbers: ${response.status}`);
      }
      
      const data = await response.json();
      const phoneNumbers = data.phoneNumbers || {};
      
      // Calculate total points (sum of all phone numbers)
      let totalPoints = 0;
      for (const festival in phoneNumbers) {
        totalPoints += phoneNumbers[festival];
      }
      
      // Get title based on total points
      return {
        title: getUserTitle(totalPoints),
        points: totalPoints
      };
    } catch (error) {
      console.error('Error fetching user title:', error);
      return { title: "Chimang", points: 0 }; // Default title
    }
  }

  // Load the user's display name (username or email)
  async function loadCurrentUserInfo() {
    try {
      const response = await fetch(`/display-name?email=${encodeURIComponent(currentUserEmail)}`);
      if (response.ok) {
        const data = await response.json();
        usernameDisplay.textContent = data.displayName;
        
        // Add user title
        const titleData = await getUserTitleFromServer(currentUserEmail);
        
        // Create or update user title element - MODIFIED PLACEMENT
        let userTitleElement = document.getElementById('user-title-display');
        if (!userTitleElement) {
          userTitleElement = document.createElement('div');
          userTitleElement.id = 'user-title-display';
          userTitleElement.className = 'user-title-display';
          // Insert directly after the username instead of using nextSibling
          usernameDisplay.parentNode.insertBefore(userTitleElement, usernameDisplay.nextSibling);
        }
        userTitleElement.textContent = `Titel: ${titleData.title}`;
        
        // Move the account link to a container for right alignment
        const accountLink = document.querySelector('.account-link');
        if (accountLink) {
          // Check if the container already exists
          let linkContainer = document.querySelector('.account-link-container');
          if (!linkContainer) {
            linkContainer = document.createElement('div');
            linkContainer.className = 'account-link-container';
            // Append the container to the user-info-bar
            usernameDisplay.parentNode.appendChild(linkContainer);
          }
          // Move the account link to the container
          linkContainer.appendChild(accountLink);
        }
      } else {
        // If unable to get display name, use email
        usernameDisplay.textContent = currentUserEmail;
      }
    } catch (error) {
      console.error('Error fetching display name:', error);
      usernameDisplay.textContent = currentUserEmail;
    }
  }
  
  // Load the user's festival data
  async function loadCurrentUserFestivals() {
    try {
      const response = await fetch(`/my-festivals?email=${encodeURIComponent(currentUserEmail)}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      const userFestivals = data.festivals || [];
      
      // Divide festivals into upcoming and past
      const now = new Date();
      let upcomingFests = [];
      let pastFests = [];
      
      userFestivals.forEach(name => {
        const dateStr = festivalDates[name];
        if (!dateStr) return; // Skip if festival date is not defined
        
        const festDate = new Date(dateStr);
        if (festDate > now) {
          upcomingFests.push(name);
        } else {
          pastFests.push(name);
        }
      });
      
      // Update the counters
      upcomingCountEl.textContent = upcomingFests.length;
      pastCountEl.textContent = pastFests.length;
      totalCountEl.textContent = userFestivals.length;
      
      // Update medals based on total past festivals
      updateMedals(pastFests.length, 'medal');
      
      // Calculate and display spending breakdown
      const spendingData = await calculateTotalSpending(userFestivals);
      
      // Update all spending displays
      const pastSpentElement = document.getElementById('past-spending');
      const futureSpendElement = document.getElementById('future-spending');
      const totalSpendingElement = document.getElementById('total-spending');
      
      if (pastSpentElement) {
        pastSpentElement.textContent = `€${spendingData.pastSpent}`;
      }
      
      if (futureSpendElement) {
        futureSpendElement.textContent = `€${spendingData.futureSpend}`;
      }
      
      if (totalSpendingElement) {
        totalSpendingElement.textContent = `€${spendingData.totalSpent}`;
      }
      
      return {
        upcoming: upcomingFests,
        past: pastFests,
        all: userFestivals,
        spendingData: {
          pastSpent: spendingData.pastSpent,
          futureSpend: spendingData.futureSpend,
          totalSpent: spendingData.totalSpent
        }
      };
    } catch (error) {
      console.error('Error fetching festival data:', error);
      
      // Show error message to user
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'Er is een probleem opgetreden bij het laden van je festival gegevens.';
      myFestivalCard.appendChild(errorDiv);
      
      return { upcoming: [], past: [], all: [], totalSpent: "0.00" };
    }
  }

  // Function to load streak information
  async function loadUserStreakInfo() {
    try {
      const userEmail = localStorage.getItem('email');
      
      if (!userEmail) {
        return; // User not logged in
      }
      
      const response = await fetch(`/user-streak?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update UI with streak information
      if (currentStreakEl && bestStreakEl) {
        // Store previous values for animation
        const prevCurrentStreak = parseInt(currentStreakEl.textContent) || 0;
        
        // Update values
        currentStreakEl.textContent = data.currentStreak;
        bestStreakEl.textContent = data.bestStreak;
        
        // Add animation if streak changed
        if (prevCurrentStreak !== data.currentStreak) {
          currentStreakEl.classList.add('streak-updated');
          
          // Remove animation class after it completes
          setTimeout(() => {
            currentStreakEl.classList.remove('streak-updated');
          }, 600);
        }
        
        // Update streak badges if function exists
        if (typeof updateStreakBadges === 'function') {
          updateStreakBadges(data.currentStreak, data.bestStreak);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error loading streak info:', error);
      
      // Show error in streak element if it exists
      if (currentStreakEl) {
        currentStreakEl.textContent = "?";
      }
      if (bestStreakEl) {
        bestStreakEl.textContent = "?";
      }
    }
  }
  
  // Load user's streak ranking
  async function loadStreakRanking() {
    try {
      const userEmail = localStorage.getItem('email');
      
      if (!userEmail) {
        return; // User not logged in
      }
      
      const response = await fetch(`/streak-ranking?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update rank display if elements exist
      const rankEl = document.getElementById('streak-rank');
      const percentileEl = document.getElementById('streak-percentile');
      
      if (rankEl) {
        rankEl.textContent = `#${data.rank} / ${data.totalUsers}`;
      }
      
      if (percentileEl) {
        percentileEl.textContent = `${data.percentile}%`;
      }
      
      return data;
    } catch (error) {
      console.error('Error loading streak ranking:', error);
    }
  }
  
  // Update medal display based on achievement
  function updateMedals(pastCount, elementIdPrefix) {
    // Define medal thresholds and their element IDs
    const medals = [
      { threshold: 1, id: `${elementIdPrefix}-1` },
      { threshold: 3, id: `${elementIdPrefix}-3` },
      { threshold: 5, id: `${elementIdPrefix}-5` },
      { threshold: 10, id: `${elementIdPrefix}-10` },
      { threshold: 15, id: `${elementIdPrefix}-15` },
      { threshold: 20, id: `${elementIdPrefix}-20` },
      { threshold: 21, id: `${elementIdPrefix}-20plus` } // 21+ festivals
    ];
    
    // Update each medal's appearance based on achievement
    medals.forEach(medal => {
      const medalElement = document.getElementById(medal.id);
      if (!medalElement) return;
      
      const statusElement = medalElement.querySelector('.medal-status');
      
      if (pastCount >= medal.threshold) {
        // Medal earned
        medalElement.classList.add('earned');
        statusElement.textContent = 'Behaald!';
      } else {
        // Medal not earned
        medalElement.classList.remove('earned');
        
        // Calculate how many more festivals needed
        const remaining = medal.threshold - pastCount;
        statusElement.textContent = `Nog ${remaining} te gaan`;
      }
    });
  }
  
  // Create user medals HTML for other users' cards
  function createMedalsHTML(pastCount) {
    const medalConfigs = [
      { threshold: 1, icon: "🥉", label: "Eerste Festival" },
      { threshold: 3, icon: "🥈", label: "3 Festivals" },
      { threshold: 5, icon: "🥇", label: "5 Festivals" },
      { threshold: 10, icon: "🏆", label: "10 Festivals" },
      { threshold: 15, icon: "💎", label: "15 Festivals" },
      { threshold: 20, icon: "👑", label: "20 Festivals" },
      { threshold: 21, icon: "⭐", label: "Festival Legende" }
    ];
    
    let html = '';
    
    medalConfigs.forEach(medal => {
      const earned = pastCount >= medal.threshold;
      const earnedClass = earned ? 'earned' : '';
      const status = earned ? 'Behaald!' : `Nog ${medal.threshold - pastCount} te gaan`;
      
      html += `
        <div class="medal ${earnedClass}">
          <div class="medal-icon">${medal.icon}</div>
          <div class="medal-label">${medal.label}</div>
          <div class="medal-status">${status}</div>
        </div>
      `;
    });
    
    return html;
  }
  
  // Create streak badges HTML for other users' cards
  function createStreakBadgesHTML(currentStreak, bestStreak) {
    const badgeConfigs = [
      { threshold: 3, icon: "🔥", label: "Streak van 3" },
      { threshold: 5, icon: "🔥🔥", label: "Streak van 5" },
      { threshold: 10, icon: "🔥🔥🔥", label: "Streak van 10" },
      { threshold: 15, icon: "⚡🔥⚡", label: "Streak van 15" },
      { threshold: 20, icon: "🌟🔥🌟", label: "Streak Master" },
      { threshold: 25, icon: "👑🔥👑", label: "Streak Legende" }
    ];
    
    let html = '';
    
    badgeConfigs.forEach(badge => {
      const earned = bestStreak >= badge.threshold;
      const earnedClass = earned ? 'earned' : '';
      const status = earned ? 'Behaald!' : `Nog ${badge.threshold - bestStreak} te gaan`;
      
      html += `
        <div class="badge ${earnedClass}">
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-title">${badge.label}</div>
          <div class="badge-status">${status}</div>
        </div>
      `;
    });
    
    return html;
  }
  
  // Load all users - FIXED VERSION
  async function loadAllUsers() {
    try {
      // Show loading indicator
      usersList.innerHTML = '<div class="loading-indicator">Gebruikers laden...</div>';
      
      // Fetch all users from the server
      const response = await fetch('/all-users');
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      const users = data.users || [];
      
      // Clear loading indicator
      usersList.innerHTML = '';
      
      // If no users found
      if (users.length === 0) {
        usersList.innerHTML = '<div class="loading-indicator">Geen gebruikers gevonden</div>';
        return;
      }
      
      // Display all users
      for (const user of users) {
        // Skip the current user
        if (user.email === currentUserEmail) continue;
        
        const displayName = user.username || user.email;
        const initial = displayName.charAt(0).toUpperCase();
        
        // Get user's title
        const titleData = await getUserTitleFromServer(user.email);
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.dataset.email = user.email;
        userItem.innerHTML = `
          <div class="user-avatar">${initial}</div>
          <div class="user-details">
            <div class="user-item-name">${displayName}</div>
            <div class="user-item-title">${titleData.title}</div>
            ${user.username ? `<div class="user-item-email">${user.email}</div>` : ''}
          </div>
        `;
        
        // Add click event to view user's festival card
        userItem.addEventListener('click', () => {
          loadUserFestivalCard(user.email, displayName, titleData.title, titleData.points);
        });
        
        usersList.appendChild(userItem);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      usersList.innerHTML = `
        <div class="loading-indicator">
          Er is een probleem opgetreden bij het laden van gebruikers. <br>
          Fout: ${error.message}
        </div>
      `;
    }
  }
  
  // Load user's festival card
  async function loadUserFestivalCard(userEmail, displayName, userTitle, titlePoints) {
    // Hide users list and show user festival card
    usersListContainer.classList.remove('active');
    userFestivalCard.classList.remove('hidden');
    
    // Update user card title
    userCardName.textContent = `${displayName}'s Festival Card`;
    
    // Add user title if provided, or fetch it
    if (!userTitle) {
      const titleData = await getUserTitleFromServer(userEmail);
      userTitle = titleData.title;
      titlePoints = titleData.points;
    }
    
    // Add or update title element - MODIFIED PLACEMENT
    let userTitleElement = document.getElementById('user-card-title');
    if (!userTitleElement) {
      userTitleElement = document.createElement('div');
      userTitleElement.id = 'user-card-title';
      userTitleElement.className = 'user-card-title';
      // Insert it directly after the userCardName element
      userCardName.parentNode.insertBefore(userTitleElement, userCardName.nextSibling);
    }
    
    // Updated format: "Titel: [title]"
    userTitleElement.textContent = `Titel: ${userTitle}`;
  
    
    try {
      // Get user's festivals
      const response = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      const userFestivals = data.festivals || [];
      
      // Get user's streak info
      const streakResponse = await fetch(`/user-streak?email=${encodeURIComponent(userEmail)}`);
      let streakData = { currentStreak: 0, bestStreak: 0 };
      
      if (streakResponse.ok) {
        streakData = await streakResponse.json();
      }
      
      // Divide festivals into upcoming and past
      const now = new Date();
      let upcomingFests = [];
      let pastFests = [];
      
      userFestivals.forEach(name => {
        const dateStr = festivalDates[name];
        if (!dateStr) return; // Skip if festival date is not defined
        
        const festDate = new Date(dateStr);
        if (festDate > now) {
          upcomingFests.push(name);
        } else {
          pastFests.push(name);
        }
      });
      
      // Update the counters
      userUpcomingCount.textContent = upcomingFests.length;
      userPastCount.textContent = pastFests.length;
      userTotalCount.textContent = userFestivals.length;
      
      // Update medals
      userMedals.innerHTML = createMedalsHTML(pastFests.length);
      
      // Calculate and display spending breakdown for the selected user
      const userSpendingData = await calculateTotalSpending(userFestivals);
      
      // Update all spending displays for the user
      const userPastSpentElement = document.getElementById('user-past-spending');
      const userFutureSpendElement = document.getElementById('user-future-spending');
      const userTotalSpendingElement = document.getElementById('user-total-spending');
      
      if (userPastSpentElement) {
        userPastSpentElement.textContent = `€${userSpendingData.pastSpent}`;
      }
      
      if (userFutureSpendElement) {
        userFutureSpendElement.textContent = `€${userSpendingData.futureSpend}`;
      }
      
      if (userTotalSpendingElement) {
        userTotalSpendingElement.textContent = `€${userSpendingData.totalSpent}`;
      }
      
      // Add streak information if container exists
      const userStreakContainer = document.getElementById('user-streak-container');
      if (userStreakContainer) {
        userStreakContainer.innerHTML = `
          <div class="user-streak-info">
            <div class="streak-box current-streak">
              <div class="streak-icon">🔥</div>
              <div class="streak-value">${streakData.currentStreak}</div>
              <div class="streak-label">Huidige Streak</div>
            </div>
            <div class="streak-box best-streak">
              <div class="streak-icon">🏆</div>
              <div class="streak-value">${streakData.bestStreak}</div>
              <div class="streak-label">Beste Streak</div>
            </div>
          </div>
          <div class="streak-badges">
            ${createStreakBadgesHTML(streakData.currentStreak, streakData.bestStreak)}
          </div>
        `;
      }
      
      // Find common festivals between current user and selected user
      const currentUserData = await loadCurrentUserFestivals();
      const commonFestivals = userFestivals.filter(festival => 
        currentUserData.all.includes(festival)
      );
      
      // Display common festivals
      if (commonFestivals.length === 0) {
        commonFestivalsList.innerHTML = `
          <div class="no-common-festivals">
            Geen gemeenschappelijke festivals gevonden.
          </div>
        `;
      } else {
        commonFestivalsList.innerHTML = '';
        
        // Sort common festivals chronologically
        commonFestivals.sort((a, b) => {
          const dateA = festivalDates[a] ? new Date(festivalDates[a]) : new Date(0);
          const dateB = festivalDates[b] ? new Date(festivalDates[b]) : new Date(0);
          return dateA - dateB;
        });
        
        commonFestivals.forEach(festival => {
          const dateStr = festivalDates[festival];
          const festivalElement = document.createElement('div');
          festivalElement.className = 'common-festival-item';
          
          const formattedDate = dateStr ? formatDate(dateStr) : 'Onbekende datum';
          
          festivalElement.innerHTML = `
            <div class="common-festival-name">${festival}</div>
            <div class="common-festival-date">${formattedDate}</div>
          `;
          
          commonFestivalsList.appendChild(festivalElement);
        });
      }
      
    } catch (error) {
      console.error('Error loading user festival card:', error);
      userFestivalCard.innerHTML = `
        <div class="error-message">
          Er is een probleem opgetreden bij het laden van deze Festival Card.
          <br>Fout: ${error.message}
        </div>
      `;
    }
  }
  
  // Initialize the page
  async function initializePage() {
    await loadCurrentUserInfo();
    const userData = await loadCurrentUserFestivals();
    await loadUserStreakInfo();
    await loadStreakRanking();
    
    // No need to update spending displays here as it's already handled in loadCurrentUserFestivals
  }
  
  // Call the initialization function
  initializePage();
  
  // Set up collapsible users list
  toggleUsersListBtn.addEventListener('click', () => {
    // Toggle active class on button
    toggleUsersListBtn.classList.toggle('active');
    
    // Toggle active class on content
    const isActive = usersListContainer.classList.toggle('active');
    
    // Toggle icon text
    const icon = toggleUsersListBtn.querySelector('.collapsible-icon');
    if (icon) {
      icon.textContent = isActive ? '▲' : '▼';
    }
    
    // Load users when opening for the first time
    if (isActive && (!usersList.children.length || usersList.querySelector('.loading-indicator'))) {
      loadAllUsers();
    }
  });
  
  // Back to list button
  backToListBtn.addEventListener('click', () => {
    userFestivalCard.classList.add('hidden');
    usersListContainer.classList.add('active');
  });
  
  // Function to update streak badges
  window.updateStreakBadges = function(currentStreak, bestStreak) {
    const streakThresholds = [3, 5, 10, 15, 20, 25];
    
    streakThresholds.forEach(threshold => {
      const badgeElement = document.getElementById(`badge-streak-${threshold}`);
      if (badgeElement) {
        const statusElement = badgeElement.querySelector('.badge-status');
        
        if (bestStreak >= threshold) {
          badgeElement.classList.add('earned');
          statusElement.textContent = 'Behaald!';
        } else {
          badgeElement.classList.remove('earned');
          statusElement.textContent = `Nog ${threshold - bestStreak} te gaan`;
        }
      }
    });
  };
});

