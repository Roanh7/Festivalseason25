// festival-ratings-modal.js
// Script to display individual ratings for a festival when clicked in the rankings

document.addEventListener('DOMContentLoaded', function() {
  // Create the modal HTML and append to body
  const modalHTML = `
    <div id="ratings-detail-modal" class="ratings-modal hidden">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="detail-modal-title">Festival Ratings</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div id="festival-average" class="festival-average">
            <span class="average-label">Gemiddelde score:</span>
            <span id="average-rating" class="average-rating">0.0</span>
            <span class="total-count">(<span id="ratings-count">0</span> ratings)</span>
          </div>
          <div id="ratings-list" class="ratings-list">
            <div class="loading">Laden van beoordelingen...</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-button">Sluiten</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get DOM elements
  const ratingsModal = document.getElementById('ratings-detail-modal');
  const modalTitle = document.getElementById('detail-modal-title');
  const averageRating = document.getElementById('average-rating');
  const ratingsCount = document.getElementById('ratings-count');
  const ratingsList = document.getElementById('ratings-list');
  const closeButton = ratingsModal.querySelector('.modal-close');
  const closeFooterButton = ratingsModal.querySelector('.modal-button');
  const overlay = ratingsModal.querySelector('.modal-overlay');
  
  // Create CSS styles for the modal
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .ratings-modal {
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
    
    .ratings-modal.hidden {
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
    
    /* Festival average rating styles */
    .festival-average {
      text-align: center;
      margin-bottom: 20px;
      padding: 10px;
      background-color: #f8f8f8;
      border-radius: 8px;
    }
    
    .average-rating {
      font-size: 2rem;
      font-weight: bold;
      color: #4CAF50;
      margin: 0 10px;
    }
    
    .average-label, .total-count {
      color: #666;
    }
    
    /* Ratings list styles */
    .ratings-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .rating-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-radius: 6px;
      background-color: #f9f9f9;
      transition: transform 0.2s ease;
    }
    
    .rating-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 3px 5px rgba(0,0,0,0.1);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #4CAF50;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
    }
    
    .user-name {
      font-weight: bold;
    }
    
    .user-rating {
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
    
    .no-ratings {
      text-align: center;
      padding: 20px;
      color: #666;
      font-style: italic;
    }
  `;
  document.head.appendChild(styleElement);
  
  // Close modal functions
  function closeModal() {
    ratingsModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  
  closeButton.addEventListener('click', closeModal);
  closeFooterButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  // Add keydown event to close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !ratingsModal.classList.contains('hidden')) {
      closeModal();
    }
  });
  
  // Function to open the modal with festival details
  window.showFestivalRatings = async function(festivalName, avgRating, count) {
    modalTitle.textContent = `${festivalName} - Ratings`;
    averageRating.textContent = avgRating;
    ratingsCount.textContent = count;
    
    // Show loading state
    ratingsList.innerHTML = '<div class="loading">Laden van beoordelingen...</div>';
    
    // Show the modal
    ratingsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    try {
      // Fetch detailed ratings for the festival
      const response = await fetch(`/rating?festival=${encodeURIComponent(festivalName)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      const ratings = data.ratings || [];
      
      // Display the ratings
      if (ratings.length === 0) {
        ratingsList.innerHTML = '<div class="no-ratings">Geen beoordelingen gevonden voor dit festival.</div>';
        return;
      }
      
      // Sort ratings from highest to lowest
      ratings.sort((a, b) => b.rating - a.rating);
      
      let ratingsHTML = '';
      
      ratings.forEach(rating => {
        const userEmail = rating.user_email;
        const userRating = rating.rating;
        const initial = userEmail.charAt(0).toUpperCase();
        
        ratingsHTML += `
          <div class="rating-item">
            <div class="user-info">
              <div class="user-avatar">${initial}</div>
              <div class="user-name">${userEmail}</div>
            </div>
            <div class="user-rating">${userRating}/10</div>
          </div>
        `;
      });
      
      ratingsList.innerHTML = ratingsHTML;
      
    } catch (error) {
      console.error('Error fetching festival ratings:', error);
      ratingsList.innerHTML = `
        <div class="error-message" style="color:red; text-align:center;">
          Er is een fout opgetreden bij het ophalen van de beoordelingen.<br>
          Probeer het later opnieuw.
        </div>
      `;
    }
  };
  
  // Make festival rank cards clickable
  function setupFestivalCardClicks() {
    document.querySelectorAll('.festival-rank-card').forEach(card => {
      card.addEventListener('click', function() {
        const festivalName = this.querySelector('.festival-name').textContent;
        const ratingDisplay = this.querySelector('.rating-value');
        const ratingCountDisplay = this.querySelector('.rating-count');
        
        // Extract the average rating value
        const avgRating = ratingDisplay ? ratingDisplay.textContent : '0.0';
        
        // Extract the count (format: "5 ratings")
        let count = 0;
        if (ratingCountDisplay) {
          const countText = ratingCountDisplay.textContent;
          count = parseInt(countText) || 0;
        }
        
        // Show the ratings modal
        showFestivalRatings(festivalName, avgRating, count);
      });
      
      // Add cursor style to indicate clickable while preserving original design
      card.style.cursor = 'pointer';
    });
  }
  
  // Initial setup
  setupFestivalCardClicks();
  
  // Set up MutationObserver to handle dynamically added festival cards
  const rankingsContainer = document.getElementById('rankingsContainer');
  
  if (rankingsContainer) {
    const observer = new MutationObserver(() => {
      setupFestivalCardClicks();
    });
    
    observer.observe(rankingsContainer, { 
      childList: true, 
      subtree: true 
    });
  }
});