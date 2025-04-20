// reviews.js - Remove all custom user menu code as it's handled by navstatus.js

document.addEventListener('DOMContentLoaded', async () => {
  // DOM elements
  const rankingsContainer = document.getElementById('rankingsContainer');
  const userReviewsContainer = document.getElementById('userReviewsContainer');
  const yourReviewsSection = document.getElementById('your-reviews-section');
  const notLoggedInSection = document.getElementById('not-logged-in');
  const noFestivalsSection = document.getElementById('no-festivals');
  
  // Modal elements
  const ratingModal = document.getElementById('ratingModal');
  const modalFestivalName = document.getElementById('modalFestivalName');
  const stars = document.querySelectorAll('.star');
  const ratingValue = document.querySelector('.rating-value');
  const submitRatingBtn = document.getElementById('submitRating');
  const closeModalBtn = document.querySelector('.close-modal');
  
  // User authentication check
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  
  // Festival dates (same as in mijn-festivals.js)
  const festivalDates = {
    "Wavy": "2024-12-21",
    "DGTL": "2025-04-19",
    "Free your mind Kingsday": "2025-04-26",
    "Loveland (Burst) Kingsday": "2025-04-26",
    "Verbond": "2025-05-05",
    "Music On": "2025-05-10",
    "Awakenings Upclose": "2025-05-17",
    "Soenda": "2025-05-31",
    "909": "2025-06-07",
    "Diynamic": "2025-06-07",
    "Open Air": "2025-06-08",
    "Free Your Mind": "2025-06-08",
    "Mystic Garden Festival": "2025-06-14",
    "Awakenings Festival": "2025-07-11",
    "Tomorrowland": "2025-07-18",
    "Mysteryland": "2025-07-22",
    "No Art": "2025-07-26",
    "Loveland": "2025-08-09",
    "Strafwerk": "2025-08-16",
    "Latin Village": "2025-08-17",
    "Parels van de stad": "2025-09-13",
    "KeineMusik": "2025-07-05",
    "Vunzige Deuntjes": "2025-07-05",
    "Toffler": "2025-05-31",
    "Into the woods": "2025-09-19"
  };

  // Helper functions
  function formatDate(isoDate) {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Get all past festivals
  function getPastFestivals() {
    const now = new Date().setHours(0, 0, 0, 0);
    const pastFestivals = [];

    for (const [name, dateStr] of Object.entries(festivalDates)) {
      const festDate = new Date(dateStr).setHours(0, 0, 0, 0);
      if (festDate < now) {
        pastFestivals.push({
          name,
          date: dateStr,
          dateObj: new Date(dateStr)
        });
      }
    }

    // Sort by date (most recent first)
    return pastFestivals.sort((a, b) => b.dateObj - a.dateObj);
  }

  // Initialize modal functionality
  function setupModal() {
    let selectedRating = 0;
    let currentFestival = '';

    // Star rating selection
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        selectedRating = rating;
        updateStars(rating);
        ratingValue.textContent = `${rating}/10`;
        submitRatingBtn.disabled = false;
      });
    });

    // Update stars visual
    function updateStars(rating) {
      stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
    }

    // Reset modal state
    function resetModal() {
      selectedRating = 0;
      updateStars(0);
      ratingValue.textContent = '0/10';
      submitRatingBtn.disabled = true;
      // Do not reset currentFestival here, it will cause issues
    }

    // Open modal to rate a festival
    window.openRatingModal = function(festivalName) {
      console.log('Opening modal for festival:', festivalName);
      modalFestivalName.textContent = festivalName;
      currentFestival = festivalName; // Set the festival name
      resetModal();
      ratingModal.classList.add('show');
      ratingModal.classList.remove('hidden');
    };

    // Close modal
    function closeModal() {
      ratingModal.classList.remove('show');
      ratingModal.classList.add('hidden');
      resetModal();
    }

    // Close button and click outside
    closeModalBtn.addEventListener('click', closeModal);
    ratingModal.addEventListener('click', (e) => {
      if (e.target === ratingModal) {
        closeModal();
      }
    });

    // Submit rating
    submitRatingBtn.addEventListener('click', async () => {
      console.log('Submitting rating data:', {
        selectedRating,
        currentFestival,
        userEmail
      });
      
      if (selectedRating === 0 || !currentFestival || !userEmail) {
        console.error('Validation failed:', { selectedRating, currentFestival, userEmail });
        alert('Please select a rating and ensure you are logged in.');
        return;
      }

      try {
        const response = await fetch('/rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: userEmail,
            festival: currentFestival,
            rating: selectedRating
          })
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
          alert('Rating submitted successfully!');
          closeModal();
          // Refresh data to show the new rating
          await loadData();
        } else {
          const responseText = await response.text();
          console.error('Error response:', responseText);
          
          let errorMessage = 'Failed to submit rating';
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If not JSON, use the response text
            if (responseText) errorMessage = responseText;
          }
          
          alert(`Error: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Network error submitting your rating. Please try again.');
      }
    });
  }

  // Fetch festival ratings and user's attended festivals
  async function loadData() {
    try {
      // Get all past festivals
      const pastFestivals = getPastFestivals();
      
      // If there are no past festivals
      if (pastFestivals.length === 0) {
        rankingsContainer.innerHTML = `<div class="message-box">Er zijn geen festivals die al zijn geweest.</div>`;
        return;
      }

      // Fetch ratings for all past festivals
      const festivalRatings = await Promise.all(
        pastFestivals.map(async festival => {
          try {
            const response = await fetch(`/rating?festival=${encodeURIComponent(festival.name)}`);
            if (!response.ok) {
              throw new Error(`Error fetching rating for ${festival.name}`);
            }
            const data = await response.json();
            
            // Ensure avgRating is a number (not null or undefined)
            const avgRating = data.averageRating !== null && data.averageRating !== undefined 
                              ? parseFloat(data.averageRating) 
                              : 0;
            
            return {
              ...festival,
              avgRating,
              ratingCount: (data.ratings && data.ratings.length) || 0,
              ratings: data.ratings || []
            };
          } catch (error) {
            console.error(error);
            return {
              ...festival,
              avgRating: 0,
              ratingCount: 0,
              ratings: []
            };
          }
        })
      );

      // Sort by average rating (highest first)
      const rankedFestivals = festivalRatings
        .filter(f => f.ratingCount > 0) // Only include festivals with ratings
        .sort((a, b) => b.avgRating - a.avgRating);

      // Display rankings
      displayRankings(rankedFestivals);

      // If user is logged in, fetch their attended festivals
      if (token && userEmail) {
        const response = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user festivals');
        }
        
        const data = await response.json();
        const userFestivals = data.festivals || [];
        
        // Filter to only past festivals that user attended
        const userPastFestivals = pastFestivals.filter(festival => 
          userFestivals.includes(festival.name)
        );
        
        if (userPastFestivals.length > 0) {
          // Get user ratings for these festivals
          const userFestivalsWithRatings = userPastFestivals.map(festival => {
            const festWithRating = festivalRatings.find(f => f.name === festival.name);
            const userRating = festWithRating?.ratings?.find(r => r.user_email === userEmail)?.rating || null;
            
            return {
              ...festival,
              userRating
            };
          });
          
          // Display user's festivals to review
          displayUserFestivals(userFestivalsWithRatings);
          yourReviewsSection.classList.remove('hidden');
          noFestivalsSection.classList.add('hidden');
        } else {
          // User hasn't attended any past festivals
          noFestivalsSection.classList.remove('hidden');
          yourReviewsSection.classList.add('hidden');
        }
      } else {
        // User is not logged in
        notLoggedInSection.classList.remove('hidden');
        yourReviewsSection.classList.add('hidden');
        noFestivalsSection.classList.add('hidden');
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      rankingsContainer.innerHTML = `<div class="message-box">Er is een fout opgetreden bij het laden van de festival rankings.</div>`;
    }
  }

  // Display festival rankings
  function displayRankings(rankedFestivals) {
    if (rankedFestivals.length === 0) {
      rankingsContainer.innerHTML = `
        <div class="message-box">
          Er zijn nog geen ratings voor festivals.
        </div>
      `;
      return;
    }

    let html = '';
    rankedFestivals.forEach((festival, index) => {
      const rankClass = index < 3 ? `rank-${index + 1}` : '';
      
      // Ensure avgRating is a number before calling toFixed
      const avgRating = typeof festival.avgRating === 'number' ? festival.avgRating : 0;
      const formattedRating = avgRating.toFixed(1);
      
      html += `
        <div class="festival-rank-card ${rankClass}">
          <div class="rank-number">#${index + 1}</div>
          <div class="festival-info">
            <div class="festival-name">${festival.name}</div>
            <div class="festival-date">${formatDate(festival.date)}</div>
          </div>
          <div class="rating-display">
            <div class="rating-value">${formattedRating}</div>
            <div class="rating-count">${festival.ratingCount} ${festival.ratingCount === 1 ? 'rating' : 'ratings'}</div>
          </div>
        </div>
      `;
    });

    rankingsContainer.innerHTML = html;
  }

  // Display user's festivals to review
  function displayUserFestivals(userFestivals) {
    let html = '';
    
    userFestivals.forEach(festival => {
      const hasRated = festival.userRating !== null;
      
      html += `
        <div class="user-festival-card">
          <div class="user-festival-info">
            <div class="user-festival-name">${festival.name}</div>
            <div class="user-festival-date">${formatDate(festival.date)}</div>
          </div>
          <div class="user-rating-info">
            ${hasRated 
              ? `<div class="current-rating">Jouw rating: ${festival.userRating}/10</div>` 
              : ''}
            <button class="rating-btn" onclick="openRatingModal('${festival.name}')">
              ${hasRated ? 'Wijzig rating' : 'Geef rating'}
            </button>
          </div>
        </div>
      `;
    });
    
    userReviewsContainer.innerHTML = html;
  }

  // Initialize
  setupModal();
  await loadData();
});