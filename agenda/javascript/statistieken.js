// statistieken.js - Add inline user scores display functionality

// This added code goes at the end of the statistieken.js file
document.addEventListener('DOMContentLoaded', function() {
  // Create the modal HTML and append to body
  const modalHTML = `
    <div id="user-scores-modal" class="scores-modal hidden">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="detail-modal-title">Gebruiker Scores</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div id="user-total" class="user-total">
            <span class="total-label">Totaal aantal amsjes:</span>
            <span id="total-score" class="total-score">0</span>
            <span class="festivals-count">(<span id="festivals-count">0</span> festivals)</span>
          </div>
          <div id="scores-list" class="scores-list">
            <div class="loading">Laden van festivalscores...</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-button">Sluiten</button>
        </div>
      </div>
    </div>
  `;
  
  // Check if the modal already exists
  if (!document.getElementById('user-scores-modal')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log("User scores modal added to body");
  }
  
  // Add modal styles if not already added
  if (!document.getElementById('user-scores-modal-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'user-scores-modal-styles';
    styleElement.textContent = `
      .scores-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .scores-modal.hidden {
        display: none;
      }
      
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .modal-content {
        background-color: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: modal-appear 0.3s ease;
      }
      
      @keyframes modal-appear {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        background-color: #4CAF50;
        color: white;
        border-radius: 8px 8px 0 0;
      }
      
      .modal-header h3 {
        margin: 0;
        font-size: 1.2rem;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: white;
        padding: 0;
        line-height: 1;
      }
      
      .modal-body {
        padding: 20px;
        max-height: calc(80vh - 130px);
        overflow-y: auto;
      }
      
      .modal-footer {
        padding: 15px 20px;
        text-align: right;
        border-top: 1px solid #eee;
      }
      
      .modal-button {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.3s;
      }
      
      .modal-button:hover {
        background-color: #45a049;
      }
      
      /* User total score styles */
      .user-total {
        text-align: center;
        margin-bottom: 20px;
        padding: 10px;
        background-color: #f8f8f8;
        border-radius: 8px;
      }
      
      .total-score {
        font-size: 2rem;
        font-weight: bold;
        color: #4CAF50;
        margin: 0 10px;
      }
      
      .total-label, .festivals-count {
        color: #666;
      }
      
      /* Scores list styles */
      .scores-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .score-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-radius: 6px;
        background-color: #f9f9f9;
        transition: transform 0.2s ease;
      }
      
      .score-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 3px 5px rgba(0,0,0,0.1);
      }
      
      .festival-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      
      .festival-name {
        font-weight: bold;
      }
      
      .festival-date {
        font-size: 0.85rem;
        color: #777;
      }
      
      .festival-score {
        font-size: 1.2rem;
        font-weight: bold;
        color: #4CAF50;
        background-color: #f0f9f0;
        padding: 5px 10px;
        border-radius: 4px;
        border: 1px solid #c8e6c9;
      }
      
      .loading {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
      }
      
      .no-scores {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
      }
      
      /* For ranking colors */
      .score-item.rank-1 {
        border-left: 4px solid #FFD700;
      }
      
      .score-item.rank-2 {
        border-left: 4px solid #C0C0C0;
      }
      
      .score-item.rank-3 {
        border-left: 4px solid #CD7F32;
      }
    `;
    document.head.appendChild(styleElement);
    console.log("User scores modal styles added");
  }
  
  // Get DOM elements
  const scoresModal = document.getElementById('user-scores-modal');
  const modalTitle = document.getElementById('detail-modal-title');
  const totalScore = document.getElementById('total-score');
  const festivalsCount = document.getElementById('festivals-count');
  const scoresList = document.getElementById('scores-list');
  const closeButton = scoresModal.querySelector('.modal-close');
  const closeFooterButton = scoresModal.querySelector('.modal-button');
  const overlay = scoresModal.querySelector('.modal-overlay');
  
  // Close modal functions
  function closeModal() {
    scoresModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  
  closeButton.addEventListener('click', closeModal);
  closeFooterButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  // Add keydown event to close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !scoresModal.classList.contains('hidden')) {
      closeModal();
    }
  });
  
  // Function to format date as DD-MM-YYYY
  function formatDate(dateString) {
    if (!dateString) return 'Onbekende datum';
    
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString;
    }
  }
  
  // Festival dates information for display
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
  
  // Function to open the modal with user festival scores
  window.showUserScores = async function(userEmail, displayName, totalPhoneCount, festivalCount) {
    console.log("showUserScores called with:", {
      userEmail,
      displayName,
      totalPhoneCount,
      festivalCount
    });
    
    modalTitle.textContent = `${displayName || userEmail} - Festival Scores`;
    totalScore.textContent = totalPhoneCount;
    festivalsCount.textContent = festivalCount;
    
    // Show loading state
    scoresList.innerHTML = '<div class="loading">Laden van festivalscores...</div>';
    
    // Show the modal
    scoresModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    try {
      // Fetch detailed scores for the user
      const response = await fetch(`/my-phone-numbers?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      const phoneNumbers = data.phoneNumbers || {};
      
      console.log("Received phone numbers data:", phoneNumbers);
      
      // Convert to array format for easier sorting
      const scores = Object.entries(phoneNumbers).map(([festival, score]) => ({
        festival,
        score,
        date: festivalDates[festival] || null
      }));
      
      console.log("Transformed scores array:", scores);
      
      // If we have a total score but no individual scores, we need to fetch user festival attendance
      if (scores.length === 0 && totalPhoneCount > 0) {
        try {
          // Get the user's attended festivals
          const attendanceResponse = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
          
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            const attendedFestivals = attendanceData.festivals || [];
            
            // If there's exactly one festival, we can assume that's where the score came from
            if (attendedFestivals.length === 1 && totalPhoneCount > 0) {
              scores.push({
                festival: attendedFestivals[0],
                score: totalPhoneCount, // Use the total as the score for this festival
                date: festivalDates[attendedFestivals[0]] || null
              });
            } else if (attendedFestivals.length > 0) {
              // For multiple festivals, we don't know the distribution
              // So we'll just show attended festivals without scores
              attendedFestivals.forEach(festival => {
                if (!phoneNumbers[festival]) { // Only add if not already in phoneNumbers
                  scores.push({
                    festival: festival,
                    score: '?', // Unknown distribution
                    date: festivalDates[festival] || null
                  });
                }
              });
            }
          }
        } catch (e) {
          console.error('Error fetching attended festivals:', e);
        }
      }
      
      // Display the scores
      if (scores.length === 0) {
        scoresList.innerHTML = '<div class="no-scores">Geen festivalscores gevonden voor deze gebruiker.</div>';
        return;
      }
      
      // Sort scores from highest to lowest, then by date if scores are equal
      scores.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score; // Higher scores first
        }
        
        // If scores are equal, sort by date (most recent first)
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        
        return 0;
      });
      
      let scoresHTML = '';
      
      scores.forEach((item, index) => {
        // Add special class for top 3 scores
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        
        scoresHTML += `
          <div class="score-item ${rankClass}">
            <div class="festival-info">
              <div class="festival-name">${item.festival}</div>
              <div class="festival-date">${formatDate(item.date)}</div>
            </div>
            <div class="festival-score">${item.score}</div>
          </div>
        `;
      });
      
      scoresList.innerHTML = scoresHTML;
      
    } catch (error) {
      console.error('Error fetching user scores:', error);
      scoresList.innerHTML = `
        <div class="error-message" style="color:red; text-align:center;">
          Er is een fout opgetreden bij het ophalen van de scores.<br>
          Probeer het later opnieuw.
        </div>
      `;
    }
  };
  
  // Make user rank cards clickable
  function setupUserCardClicks() {
    document.querySelectorAll('.user-rank-card').forEach(card => {
      // Make sure card has dataset attributes
      if (!card.dataset.email && card.querySelector('.user-name')) {
        const nameElement = card.querySelector('.user-name');
        const userEmail = nameElement.textContent.trim();
        card.dataset.email = userEmail;
        card.dataset.username = userEmail;
        console.log(`Added dataset attributes to card for ${userEmail}`);
      }
      
      // Only add event listener if it doesn't already have one
      if (!card.hasClickListener) {
        card.addEventListener('click', function() {
          const userEmail = this.dataset.email;
          const displayName = this.dataset.username || this.querySelector('.user-name')?.textContent;
          
          // Get the total points value
          const pointsDisplay = this.querySelector('.phone-count');
          const totalPoints = pointsDisplay ? parseInt(pointsDisplay.textContent) : 0;
          
          // Get the festival count
          const festivalCountEl = this.querySelector('.user-festivals-count');
          let festivalCount = 0;
          
          if (festivalCountEl) {
            const countText = festivalCountEl.textContent;
            const match = countText.match(/(\d+)/);
            festivalCount = match ? parseInt(match[1]) : 0;
          }
          
          console.log("User card clicked:", {
            email: userEmail,
            name: displayName,
            totalPoints: totalPoints,
            festivalCount: festivalCount
          });
          
          // Show the scores modal
          showUserScores(userEmail, displayName, totalPoints, festivalCount);
        });
        
        // Add cursor style to indicate clickable
        card.style.cursor = 'pointer';
        
        // Mark as having a listener to avoid duplicates
        card.hasClickListener = true;
        
        console.log(`Added click listener to card for ${card.dataset.email || 'unknown'}`);
      }
    });
  }
  
  // Call setupUserCardClicks on DOMContentLoaded and after any potential delay
  setupUserCardClicks();
  
  // Run setup again after a delay to catch any dynamically created elements
  setTimeout(setupUserCardClicks, 1000);
  
  // Set up MutationObserver to handle dynamically added user cards
  const rankingsContainer = document.getElementById('rankingsContainer');
  
  if (rankingsContainer) {
    const observer = new MutationObserver(() => {
      console.log("DOM mutation detected, setting up user card clicks");
      setupUserCardClicks();
    });
    
    observer.observe(rankingsContainer, { 
      childList: true, 
      subtree: true 
    });
    
    console.log("MutationObserver set up for rankingsContainer");
  }
  
  console.log("User scores display functionality initialized");
});