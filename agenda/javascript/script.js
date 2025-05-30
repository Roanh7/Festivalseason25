//  script.js 

// ================================
// 1. COUNTDOWN-DEEL
// ================================
const festivals = [
  { name: "Wavy", date: "2024-12-21" },
  { name: "DGTL", date: "2025-04-19" },
  { name: "Loveland (Burst) Kingsday", date: "2025-04-26" },
  { name: "Verbond", date: "2025-05-05" },
  { name: "Music On", date: "2025-05-10" },
  { name: "Awakenings Upclose", date: "2025-05-17" },
  { name: "PIV", date: "2025-05-30" },
  { name: "Soenda", date: "2025-05-31" },
  { name: "Toffler", date: "2025-05-31" },
  { name: "909", date: "2025-06-07" },
  { name: "Diynamic", date: "2025-06-07" },
  { name: "Open Air", date: "2025-06-08" },
  { name: "Free Your Mind", date: "2025-06-08" },
  { name: "Mystic Garden Festival", date: "2025-06-14" },
  { name: "Thuishaven Colyn", date: "2025-06-21" },
  { name: "Vunzige Deuntjes", date: "2025-07-05" },
  { name: "KeineMusik", date: "2025-07-05" },
  { name: "Boothstock Festival", date: "2025-07-12" },
  { name: "Awakenings Festival", date: "2025-07-11" },
  { name: "Tomorrowland", date: "2025-07-18" },
  { name: "Mysteryland", date: "2025-07-22" },
  { name: "No Art", date: "2025-07-26" },
  { name: "Loveland", date: "2025-08-09" },
  { name: "Circoloco", date: "2025-09-13" },
  { name: "Latin Village", date: "2025-08-17" },
  { name: "Parels van de stad", date: "2025-09-13" },
  { name: "Into the woods", date: "2025-09-19" }
];

// Festival prices for spending calculation
const festivalPrices = {
  "Wavy": 26.04,
  "DGTL": 120.00,
  "Free your mind Kingsday": 33.33,
  "Loveland (Burst) Kingsday": 51.00,
  "Verbond": 60.00,
  "Music On": 130.00,
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
  "Thuishaven Colyn": 35.00,
  "Boothstock Festival": 70.00,
  "Awakenings Festival": 109.00,
  "Tomorrowland": 105.00,
  "Mysteryland": 119.95,
  "No Art": 70.00,
  "Loveland": 82.50,
  "Latin Village": 50.00,
  "Circoloco": 100.00, // Price not provided, setting to 0
  "Parels van de stad": 36.00,
  "Into the woods": 53.00
};

function updateCountdown() {
  const now = new Date();
  let nextFestival = null;

  // Find the next upcoming festival based on date
  for (const festival of festivals) {
    const festivalDate = new Date(festival.date);
    if (festivalDate > now) {
      nextFestival = festival;
      break;
    }
  }

  // If there are no future festivals, show "END OF SEASON"
  if (!nextFestival) {
    document.getElementById("festival-name").textContent = "END OF SEASON";
    document.getElementById("countdown").innerHTML = '<div class="no-festivals">Het festivalseizoen is afgelopen</div>';
    return;
  }

  // Update festival name
  document.getElementById("festival-name").textContent = nextFestival.name;

  // Calculate time difference
  const festivalDate = new Date(nextFestival.date);
  const diff = festivalDate - now;

  if (diff <= 0) {
    // Festival is already ongoing or just ended
    setTimeout(updateCountdown, 1000);
    return;
  }

  // Calculate time units
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Update DOM with padded values
  document.getElementById("days").textContent = days.toString().padStart(2, '0');
  document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
  document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
  
  // Get seconds element
  const secondsEl = document.getElementById("seconds");
  // Update seconds
  secondsEl.textContent = seconds.toString().padStart(2, '0');
  
  // Add pulse animation when seconds change
  secondsEl.classList.add('seconds-animate');
  setTimeout(() => {
    secondsEl.classList.remove('seconds-animate');
  }, 500);

  // Add pulse animation to days when they change
  if (seconds === 0 && minutes === 0 && hours === 0) {
    const daysEl = document.getElementById("days");
    daysEl.classList.add('animate-pulse');
    setTimeout(() => {
      daysEl.classList.remove('animate-pulse');
    }, 1000);
  }

  // Schedule the next update
  setTimeout(updateCountdown, 1000);
}

// Run the countdown immediately
updateCountdown();

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

// ================================
// 2. SPELER-STATS (popup)
// ================================
document.addEventListener("DOMContentLoaded", () => {
  // Player stats data - same as original
  const playerStats = {
    "Roan": {
      position: "Keeper",
      age: 23,
      rating: "Rating: 82",
      skills: ["Vibes brengen", "Communicatie", "Voorraad regelen"]
    },
    "Muc": {
      position: "Verdediger",
      age: 32,
      rating: "Rating: 90",
      skills: ["TikTok famous", "Capsuleren", "Overzicht", "Is arts (alleen na 23:00)"]
    },
    "Rick": {
      position: "Verdediger",
      age: 26,
      rating: "Rating: 79",
      skills: ["1-op-1 verdedigen", "Vibes brengen", "Jokes maken", "Houd van grote billen"]
    },
    "Chip": {
      position: "Middenvelder",
      age: 31,
      rating: "Rating: 88",
      skills: ["Uithoudingsvermogen", "Teamleider", "Driver"]
    },
    "Jef": {
      position: "Aanvaller",
      age: 29,
      rating: "Rating: ???",
      skills: ["CHEATCODE ACTIVATED", "Glow in the dark ogen", "Regelt de beste afters"]
    },
    // Bench player stats
    "Avend": {
      position: "Verdediger",
      age: 25,
      rating: "Rating: 70",
      skills: ["Fatoe's maken", "Klein", "Kleine blaas"]
    },
    "Awdar": {
      position: "Verdediger",
      age: 24,
      rating: "Rating: 75",
      skills: ["Vibed heel het feest lang", "Voorziet iedereen van een sigaret", "Gekke handschoen"]
    },
    "Faro": {
      position: "Verdediger",
      age: 28,
      rating: "Rating: 78",
      skills: ["Prins", "Model", "Geil"]
    },
    "Hamada": {
      position: "Aanvaller",
      age: 25,
      rating: "Rating: 83",
      skills: ["Lang", "Lijkt op de eifeltoren", "Niet te missen op de dansvloer"]
    },
    "Joost": {
      position: "Middenvelder",
      age: 27,
      rating: "Rating: 77",
      skills: ["Veteraan in de game", "Positie vasthouden", "Lange jan"]
    },
    "Kosjber": {
      position: "Middenvelder",
      age: 29,
      rating: "Rating: 85",
      skills: ["Techniek", "Veld overzicht", "Overal te vinden"]
    },
    "Menno": {
      position: "Verdediger",
      age: 18,
      rating: "Rating: 68.5",
      skills: ["Breed", "Breed voor shit", "Filmt heel het feest", "Is een lolbroek", "Heeft wifey sindskort"]
    },
    "MD": {
      position: "Aanvaller",
      age: 29,
      rating: "Rating: 90",
      skills: ["Blauwe cheat code ogen", "Gezelligheid", "Rivaal van Messi", "Kon pro worden, maar kreeg knie blessure"]
    },
    "Shawkat": {
      position: "Keeper",
      age: 24,
      rating: "Rating: 75",
      skills: ["Cheat code ogen", "Gaat door rollecoster", "Warmte bron"]
    },
    "Tom": {
      position: "Bank",
      age: 25,
      rating: "Rating: 80",
      skills: ["Heeft wifey", "Hele dag jokes maken", "captain team-W"]
    },
    "Trim": {
      position: "Aanvaller",
      age: 32,
      rating: "Rating: 70",
      skills: ["Is met pensioen", "veteraan in de game"]
    },
    "Zana": {
      position: "Middenvelder",
      age: 33,
      rating: "Rating: 79",
      skills: ["Surpise act van elke festival", "captain in de lucht"]
    }
  };

  // Create enhanced popup template
  const popupTemplate = `
    <div id="player-stats-popup" class="popup hidden">
      <div class="popup-overlay"></div>
      <div class="popup-content">
        <div class="player-stats">
          <div class="rating-section">
            <div class="rating-box">
              <p class="rating-label">Rating: 82</p>
              <div class="player-position">Midfielder</div>
            </div>
          </div>
          <div class="info-section">
            <p><strong>Naam:</strong> <span id="player-name">Roan</span></p>
            <p><strong>Leeftijd:</strong> <span id="player-age">23</span></p>
          </div>
        </div>
        <div class="skills-section">
          <h3>Skills:</h3>
          <ul id="player-skills">
            <!-- Skills will be added dynamically -->
          </ul>
        </div>
        <button id="close-popup" class="close-popup-btn">Terug</button>
      </div>
    </div>
  `;

  // Replace the old popup with our new template
  const oldPopup = document.getElementById("player-stats-popup");
  if (oldPopup) {
    oldPopup.remove();
  }
  document.body.insertAdjacentHTML('beforeend', popupTemplate);
  
  // Function to display player stats in popup
  const showPopup = (playerName) => {
    const stats = playerStats[playerName];
    if (stats) {
      const popup = document.getElementById("player-stats-popup");
      const ratingSection = popup.querySelector(".rating-section");
      const ratingLabel = popup.querySelector(".rating-label");
      const playerPositionEl = popup.querySelector(".player-position");
      
      // Update player data
      document.getElementById("player-name").textContent = playerName;
      document.getElementById("player-age").textContent = stats.age;
      ratingLabel.textContent = stats.rating;
      playerPositionEl.textContent = stats.position;
      
      // Remove any previous position classes
      ratingSection.className = "rating-section";
      
      // Add position-specific class for styling
      let positionClass = "";
      switch(stats.position.toLowerCase()) {
        case "keeper":
          positionClass = "player-position-keeper";
          break;
        case "verdediger":
          positionClass = "player-position-defender";
          break;
        case "middenvelder":
          positionClass = "player-position-midfielder";
          break;
        case "aanvaller":
          positionClass = "player-position-striker";
          break;
        default:
          positionClass = "player-position-bank";
      }
      ratingSection.classList.add(positionClass);

      // Update skills
      const skillsList = document.getElementById("player-skills");
      skillsList.innerHTML = ""; 
      stats.skills.forEach(skill => {
        const li = document.createElement("li");
        li.textContent = skill;
        skillsList.appendChild(li);
      });
      
      // Show popup with animation
      popup.classList.remove("hidden");
    }
  };

  // Set click handlers for player elements
  document.querySelectorAll(".player").forEach(player => {
    player.addEventListener("click", () => {
      const playerName = player.nextElementSibling?.textContent.trim();
      if (playerName) {
        showPopup(playerName);
      }
    });
  });

  // Set click handlers for player names
  document.querySelectorAll(".player-name").forEach(name => {
    name.addEventListener("click", () => {
      const playerName = name.textContent.trim();
      showPopup(playerName);
    });
  });

  // Make bench players clickable
  document.querySelectorAll(".bank-player").forEach(player => {
    player.addEventListener("click", () => {
      const playerName = player.textContent.trim();
      showPopup(playerName);
    });
  });

  // Close button handler
  document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("player-stats-popup").classList.add("hidden");
  });

  // Make showPopup available globally
  window.showPopup = showPopup;
  
  // Add popup styles for enhanced visual experience
  const styleElement = document.createElement('style');
  styleElement.textContent = `
  /* Enhanced Player Stats Popup Styles */

  /* Base popup styling */
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
  }

  .popup.hidden {
    display: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Enhanced popup content */
  .popup-content {
    background: linear-gradient(to bottom, #ffffff, #f4f9f4);
    border: none;
    border-radius: 16px;
    padding: 0;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    transform: translateY(0);
    animation: slideUp 0.4s ease-out;
  }

  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Player header with colored background based on position */
  .player-stats {
    padding: 0;
  }

  .rating-section {
    color: white;
    padding: 25px 20px;
    text-align: center;
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    position: relative;
    overflow: hidden;
  }

  /* Add a subtle pattern overlay to the header */
  .rating-section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
    z-index: 0;
  }

  .rating-box {
    position: relative;
    z-index: 1;
  }

  .rating-label {
    font-size: 2.2rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    letter-spacing: 1px;
  }

  .player-position {
    font-size: 1rem;
    text-transform: uppercase;
    margin-top: 5px;
    letter-spacing: 1px;
    opacity: 0.9;
  }

  /* Player info section */
  .info-section {
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .info-section p {
    margin: 8px 0;
    font-size: 1.1rem;
    color: #333;
  }

  .info-section strong {
    color: #2E7D32;
    font-weight: 600;
  }

  /* Skills section */
  .skills-section {
    padding: 15px 20px 20px;
  }

  .skills-section h3 {
    color: #2E7D32;
    margin-bottom: 12px;
    font-size: 1.3rem;
    font-weight: 600;
    position: relative;
    padding-bottom: 8px;
  }

  .skills-section h3:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: #4CAF50;
    border-radius: 2px;
  }

  #player-skills {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  #player-skills li {
    padding: 8px 0;
    position: relative;
    padding-left: 28px;
    font-size: 1rem;
    color: #444;
  }

  #player-skills li:before {
    content: '✓';
    position: absolute;
    left: 0;
    top: 8px;
    color: #4CAF50;
    font-weight: bold;
  }

  /* Close button */
  .close-popup-btn {
    width: 100%;
    padding: 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .close-popup-btn:hover {
    background-color: #3d9140;
  }

  .close-popup-btn:active {
    transform: scale(0.98);
  }

  /* Position-based variations for header */
  .player-position-keeper .rating-section {
    background: linear-gradient(135deg, #FFC107, #FF8F00);
  }

  .player-position-defender .rating-section {
    background: linear-gradient(135deg, #2196F3, #0D47A1);
  }

  .player-position-midfielder .rating-section {
    background: linear-gradient(135deg, #9C27B0, #6A1B9A);
  }

  .player-position-striker .rating-section {
    background: linear-gradient(135deg, #F44336, #B71C1C);
  }

  .player-position-bank .rating-section {
    background: linear-gradient(135deg, #607D8B, #455A64);
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .popup-content {
      width: 95%;
    }
    
    .rating-label {
      font-size: 1.8rem;
    }
    
    .info-section p {
      font-size: 1rem;
    }
  }
  `;
  
  document.head.appendChild(styleElement);
});

// ================================
// 3. FESTIVAL-LINKS
// ================================
const festivalLinks = {
  "Wavy": "https://www.wavyfestival.nl",
  "DGTL": "https://www.dgtl.nl",
  "Free your mind Kingsday": "https://www.freeyourmindfestival.nl",
  "Loveland (Burst) Kingsday": "https://www.loveland.nl",
  "Verbond": "https://hetamsterdamsverbond.nl",
  "Music On": "https://www.musiconfestival.nl",
  "Awakenings Upclose": "https://www.awakenings.nl",
  "Soenda": "https://www.soenda.com",
  "909": "https://www.909festival.nl",
  "Open Air": "https://www.amsterdamopenair.nl",
  "Diynamic": "https://www.amsterdamopenair.nl",
  "Free Your Mind": "https://www.freeyourmindfestival.nl",
  "Mystic Garden Festival": "https://www.mysticgardenfestival.nl",
  "Awakenings Festival": "https://www.awakenings.nl",
  "Tomorrowland": "https://www.tomorrowland.com",
  "Mysteryland": "https://www.mysteryland.com",
  "No Art": "https://www.noartfestival.com",
  "Loveland": "https://www.loveland.nl",
  "Vunzige Deuntjes": "https://www.vunzigedeuntjes.nl",
  "Latin Village": "https://www.latinvillage.nl",
  "Circoloco": "https://www.strafwerkfestival.nl",
  "Parels van de stad": "https://www.parelsvandestad.nl",
  "Toffler": "https://tofflerfestival.nl",
  "PIV": "https://pivrecords.com/pages/piv-10-years",
  "Into the woods": "https://www.intothewoodsfestival.nl"
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll(".festival-link").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const festivalName = event.target.dataset.name;
      if (festivalLinks[festivalName]) {
        window.open(festivalLinks[festivalName], "_blank");
      } else {
        alert("Website niet gevonden voor " + festivalName);
      }
    });
  });
});

// ================================
// 4. FESTIVAL ATTENDANCE & TICKET PURCHASE (DB-based)
// ================================
document.addEventListener('DOMContentLoaded', async () => {
  // 4a) Check of user is ingelogd
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');

  // Zoek de checkboxes
  const attendCheckboxes = document.querySelectorAll('.attend-checkbox');
  const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');

  // Update attendee button text based on festival date
  const updateButtonText = () => {
    const now = new Date();
    
    // Get all attendee buttons
    const attendeeButtons = document.querySelectorAll('.attendees-btn');
    
    attendeeButtons.forEach(btn => {
      const festName = btn.dataset.festival;
      
      // Find the matching festival to get the date
      const festival = festivals.find(f => f.name === festName);
      
      if (festival) {
        const festDate = new Date(festival.date);
        
        // Update the button text based on if the date is in the past
        if (festDate < now) {
          btn.textContent = "Wie zijn er hier geweest?";
        } else {
          btn.textContent = "Wie gaan er nog meer?";
        }
      }
    });
  };
  
  // Call the function to update button text
  updateButtonText();

  // If user is not logged in, disable checkboxes and return
  if (!token || !userEmail) {
    attendCheckboxes.forEach(cb => {
      cb.disabled = true;
    });
    
    ticketCheckboxes.forEach(cb => {
      cb.disabled = true;
    });
    
    return; 
  }

  // Function to update spending display on the Festival Card page
  // Call this whenever ticket checkbox state changes
  async function updateFestivalCardSpending() {
    // Only proceed if we have a logged-in user
    const userEmail = localStorage.getItem('email');
    if (!userEmail) return;
    
    try {
      // Fetch the user's festivals and ticket status
      const response = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
      const ticketResponse = await fetch(`/my-tickets?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok || !ticketResponse.ok) {
        console.error(`Error fetching data: ${response.status} / ${ticketResponse.status}`);
        return;
      }
      
      const data = await response.json();
      const ticketData = await ticketResponse.json();
      
      const attendingFestivals = data.festivals || [];
      const purchasedTickets = ticketData.tickets || [];
      
      // Calculate spending split between past and future, and already purchased vs to be purchased
      let pastSpent = 0;
      let futureSpend = 0;
      const now = new Date();
      
      attendingFestivals.forEach(fest => {
        if (festivalPrices[fest] === undefined) return;
        
        const festInfo = festivals.find(f => f.name === fest);
        if (!festInfo) return;
        
        const festDate = new Date(festInfo.date);
        const ticketPurchased = purchasedTickets.includes(fest);
        
        if (festDate < now) {
          // Past festival - already spent (assuming they purchased the ticket if they attended)
          pastSpent += festivalPrices[fest];
        } else {
          // Future festival - categorize based on ticket purchase status
          if (ticketPurchased) {
            // Already purchased this ticket
            pastSpent += festivalPrices[fest];
          } else {
            // Planning to attend but hasn't bought ticket yet
            futureSpend += festivalPrices[fest];
          }
        }
      });
      
      // Store spending data for other pages
      localStorage.setItem('pastSpent', pastSpent.toFixed(2));
      localStorage.setItem('futureSpend', futureSpend.toFixed(2));
      localStorage.setItem('totalSpending', (pastSpent + futureSpend).toFixed(2));
      
      // If on festival card page, update the displays
      if (window.location.pathname.includes('festival-card.html')) {
        const pastSpendingElement = document.getElementById('past-spending');
        const futureSpendingElement = document.getElementById('future-spending');
        const totalSpendingElement = document.getElementById('total-spending');
        
        if (pastSpendingElement) {
          pastSpendingElement.textContent = `€${pastSpent.toFixed(2)}`;
        }
        
        if (futureSpendingElement) {
          futureSpendingElement.textContent = `€${futureSpend.toFixed(2)}`;
        }
        
        if (totalSpendingElement) {
          totalSpendingElement.textContent = `€${(pastSpent + futureSpend).toFixed(2)}`;
        }
      }
    } catch (error) {
      console.error('Error calculating spending:', error);
    }
  }

  // If user is logged in, fetch their festivals and ticket status
  try {
    // Show loading state
    console.log("Fetching user data for:", userEmail);
    
    // Add a visual loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.background = 'rgba(255, 255, 255, 0.8)';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    loadingIndicator.style.zIndex = '1000';
    loadingIndicator.textContent = 'Laden van je festival selecties...';
    document.body.appendChild(loadingIndicator);
    
    // Fetch attending status
    const resp = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
    
    // Fetch ticket purchase status
    const ticketResp = await fetch(`/my-tickets?email=${encodeURIComponent(userEmail)}`);
    
    // Remove loading indicator
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    
    // Check if responses are ok
    if (!resp.ok || !ticketResp.ok) {
      const errorText = await resp.text();
      throw new Error(`Server returned ${resp.status}: ${errorText}`);
    }
    
    // Parse JSON responses
    let data, ticketData;
    try {
      data = await resp.json();
      ticketData = await ticketResp.json();
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
    }
    
    // Get user festivals and ticket statuses
    const userFestivals = data.festivals || [];
    const userTickets = ticketData.tickets || [];
    
    console.log("User festivals loaded:", userFestivals);
    console.log("User tickets loaded:", userTickets);

    // First mark all attendance checkboxes based on userFestivals
    attendCheckboxes.forEach(cb => {
      const festName = cb.dataset.festival;
      if (userFestivals.includes(festName)) {
        cb.checked = true;
        console.log(`Festival "${festName}" is checked for attendance`);
      } else {
        cb.checked = false;
      }
    });
    
    // Then mark all ticket checkboxes based on userTickets
    ticketCheckboxes.forEach(cb => {
      const festName = cb.dataset.festival;
      if (userTickets.includes(festName)) {
        cb.checked = true;
        console.log(`Festival "${festName}" is checked for ticket purchased`);
      } else {
        cb.checked = false;
      }
    });
    
    // Initialize spending display
    await updateFestivalCardSpending();
    
    // Now set up event listeners for attendance changes
    attendCheckboxes.forEach(cb => {
      const festName = cb.dataset.festival;
      
      // Remove any existing event listeners to avoid duplicates
      cb.removeEventListener('change', cb.changeHandler);
      
      // Create a new handler function and store a reference to it
      cb.changeHandler = async function() {
        try {
          if (cb.checked) {
            console.log(`Marking festival "${festName}" as attending`);
            cb.classList.add('updating');
            
            // POST /attend
            const response = await fetch('/attend', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, festival: festName })
            });
            
            cb.classList.remove('updating');
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error attending festival: ${errorText}`);
              cb.checked = false;
              return;
            }
            
            console.log(`Successfully marked "${festName}" as attending`);
            
            // Update spending data after checking
            await updateFestivalCardSpending();
          } else {
            console.log(`Unmarking festival "${festName}" as attending`);
            cb.classList.add('updating');
            
            // If attendance is being unchecked, also uncheck the ticket purchase
            const ticketCheckbox = document.querySelector(`.ticket-checkbox[data-festival="${festName}"]`);
            if (ticketCheckbox && ticketCheckbox.checked) {
              ticketCheckbox.checked = false;
              
              // Update ticket status on the server
              await fetch('/ticket', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, festival: festName })
              });
            }
            
            // DELETE /attend
            const response = await fetch('/attend', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, festival: festName })
            });
            
            cb.classList.remove('updating');
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error unattending festival: ${errorText}`);
              cb.checked = true;
              return;
            }
            
            console.log(`Successfully unmarked "${festName}" as attending`);
            
            // Update spending data after unchecking
            await updateFestivalCardSpending();
          }
          
          // Sync the state with other views
          syncCheckboxes(festName, cb.checked, 'attend');
          
        } catch (err) {
          cb.classList.remove('updating');
          console.error(`Failed to update attendance for "${festName}":`, err);
          alert(`Er ging iets mis bij het bijwerken van je festivalstatus. Probeer het later opnieuw.`);
        }
      };
      
      // Add the change event listener
      cb.addEventListener('change', cb.changeHandler);
    });
    
    // Set up event listeners for ticket purchase changes
    ticketCheckboxes.forEach(cb => {
      const festName = cb.dataset.festival;
      
      // Remove any existing event listeners to avoid duplicates
      cb.removeEventListener('change', cb.ticketHandler);
      
      // Create a new handler function and store a reference to it
      cb.ticketHandler = async function() {
        try {
          // First, check if the user is attending this festival
          const attendCheckbox = document.querySelector(`.attend-checkbox[data-festival="${festName}"]`);
          
          if (!attendCheckbox || !attendCheckbox.checked) {
            // Cannot purchase ticket if not attending
            cb.checked = false;
            alert(`Je moet eerst aangeven dat je naar "${festName}" wilt gaan voordat je een ticket kunt kopen.`);
            return;
          }
          
          if (cb.checked) {
            console.log(`Marking festival "${festName}" as ticket purchased`);
            cb.classList.add('updating');
            
            // POST /ticket
            const response = await fetch('/ticket', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, festival: festName })
            });
            
            cb.classList.remove('updating');
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error marking ticket as purchased: ${errorText}`);
              cb.checked = false;
              return;
            }
            
            console.log(`Successfully marked "${festName}" ticket as purchased`);
            
            // Update spending data after checking
            await updateFestivalCardSpending();
            
            // Flag that tickets have been updated for other pages
            localStorage.setItem('ticketsUpdated', 'true');
            localStorage.setItem('lastTicketUpdate', Date.now().toString());
          } else {
            console.log(`Unmarking festival "${festName}" ticket as purchased`);
            cb.classList.add('updating');
            
            // DELETE /ticket
            const response = await fetch('/ticket', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, festival: festName })
            });
            
            cb.classList.remove('updating');
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error unmarking ticket as purchased: ${errorText}`);
              cb.checked = true;
              return;
            }
            
            console.log(`Successfully unmarked "${festName}" ticket as purchased`);
            
            // Update spending data after unchecking
            await updateFestivalCardSpending();
            
            // Flag that tickets have been updated for other pages
            localStorage.setItem('ticketsUpdated', 'true');
            localStorage.setItem('lastTicketUpdate', Date.now().toString());
          }
          
          // Sync the state with other views
          syncCheckboxes(festName, cb.checked, 'ticket');
          
        } catch (err) {
          cb.classList.remove('updating');
          console.error(`Failed to update ticket status for "${festName}":`, err);
          alert(`Er ging iets mis bij het bijwerken van je ticketstatus. Probeer het later opnieuw.`);
        }
      };
      
      // Add the change event listener
      cb.addEventListener('change', cb.ticketHandler);
    });

    // Now sync all checkboxes between table and card view
    syncAllCheckboxes(userFestivals, userTickets);

  } catch (err) {
    console.error('Fout bij ophalen festivals uit DB:', err);
    
    // Create a user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.color = 'red';
    errorMessage.style.padding = '10px';
    errorMessage.style.margin = '10px 0';
    errorMessage.style.backgroundColor = '#ffeeee';
    errorMessage.style.borderRadius = '5px';
    errorMessage.style.textAlign = 'center';
    errorMessage.innerHTML = `
      <p>Er is een probleem opgetreden bij het laden van je festivalgegevens.</p>
      <p>Probeer de pagina te vernieuwen of later opnieuw in te loggen.</p>
      <p>Fout: ${err.message}</p>
    `;
    
    // Insert error message at the top of main content
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.insertBefore(errorMessage, mainElement.firstChild);
    }
  }
});

// Helper function to sync all checkboxes between table and card views
function syncAllCheckboxes(userFestivals, userTickets) {
  // First sync table checkboxes for attendance based on server data
  document.querySelectorAll('.attend-checkbox').forEach(tableCheckbox => {
    const festName = tableCheckbox.dataset.festival;
    const isChecked = userFestivals.includes(festName);
    
    // Update the checkbox in table view
    tableCheckbox.checked = isChecked;
    
    // Find and update the corresponding card view checkbox
    syncCheckboxes(festName, isChecked, 'attend');
  });
  
  // Then sync table checkboxes for tickets based on server data
  document.querySelectorAll('.ticket-checkbox').forEach(tableCheckbox => {
    const festName = tableCheckbox.dataset.festival;
    const isChecked = userTickets.includes(festName);
    
    // Update the checkbox in table view
    tableCheckbox.checked = isChecked;
    
    // Find and update the corresponding card view checkbox
    syncCheckboxes(festName, isChecked, 'attend');
  });
  
  // Then sync table checkboxes for tickets based on server data
  document.querySelectorAll('.ticket-checkbox').forEach(tableCheckbox => {
    const festName = tableCheckbox.dataset.festival;
    const isChecked = userTickets.includes(festName);
    
    // Update the checkbox in table view
    tableCheckbox.checked = isChecked;
    
    // Find and update the corresponding card view checkbox
    syncCheckboxes(festName, isChecked, 'ticket');
  });
}

// Helper function to sync checkboxes between views
function syncCheckboxes(festivalName, isChecked, type) {
  const selector = type === 'attend' ? '.attend-checkbox' : '.ticket-checkbox';
  const cardSelector = type === 'attend' ? '.attend-checkbox-card' : '.ticket-checkbox-card';
  const mobileSelector = type === 'attend' ? '.attend-checkbox-mobile' : '.ticket-checkbox-mobile';
  
  // Update table view checkboxes
  const tableCheckboxes = document.querySelectorAll(`${selector}[data-festival="${festivalName}"]`);
  tableCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
  
  // Update card view checkboxes
  const cardCheckboxes = document.querySelectorAll(`${cardSelector}[data-festival="${festivalName}"]`);
  cardCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
  
  // Update mobile view checkboxes if they exist
  const mobileCheckboxes = document.querySelectorAll(`${mobileSelector}[data-festival="${festivalName}"]`);
  mobileCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
}

// Add extra event listener to sync card view checkbox changes back to table view
document.addEventListener('DOMContentLoaded', () => {
  // Synchronize attendance checkboxes
  document.querySelectorAll('.attend-checkbox-card').forEach(cardCheckbox => {
    const festName = cardCheckbox.dataset.festival;
    
    // Remove existing event listeners to avoid duplicates
    cardCheckbox.removeEventListener('change', cardCheckbox.changeHandler);
    
    // Create new handler and store reference
    cardCheckbox.changeHandler = function() {
      console.log(`Card checkbox for ${festName} attendance changed to ${cardCheckbox.checked}`);
      
      // Find the corresponding table checkbox
      const tableCheckbox = document.querySelector(`.attend-checkbox[data-festival="${festName}"]`);
      if (tableCheckbox) {
        // Update the checked state
        tableCheckbox.checked = cardCheckbox.checked;
        
        // If unchecking attendance, also uncheck ticket purchase
        if (!cardCheckbox.checked) {
          const ticketCardCheckbox = document.querySelector(`.ticket-checkbox-card[data-festival="${festName}"]`);
          if (ticketCardCheckbox) {
            ticketCardCheckbox.checked = false;
          }
          
          const ticketTableCheckbox = document.querySelector(`.ticket-checkbox[data-festival="${festName}"]`);
          if (ticketTableCheckbox) {
            ticketTableCheckbox.checked = false;
          }
        }
        
        // Trigger the change event to run the server update
        tableCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    
    // Add the event listener
    cardCheckbox.addEventListener('change', cardCheckbox.changeHandler);
  });
  
  // Synchronize ticket purchase checkboxes
  document.querySelectorAll('.ticket-checkbox-card').forEach(cardCheckbox => {
    const festName = cardCheckbox.dataset.festival;
    
    // Remove existing event listeners to avoid duplicates
    cardCheckbox.removeEventListener('change', cardCheckbox.ticketHandler);
    
    // Create new handler and store reference
    cardCheckbox.ticketHandler = function() {
      console.log(`Card checkbox for ${festName} ticket purchase changed to ${cardCheckbox.checked}`);
      
      // Find the corresponding table checkbox
      const tableCheckbox = document.querySelector(`.ticket-checkbox[data-festival="${festName}"]`);
      if (tableCheckbox) {
        // Update the checked state
        tableCheckbox.checked = cardCheckbox.checked;
        
        // Ticket can only be purchased if attending
        const attendCardCheckbox = document.querySelector(`.attend-checkbox-card[data-festival="${festName}"]`);
        if (!attendCardCheckbox || !attendCardCheckbox.checked) {
          cardCheckbox.checked = false;
          alert(`Je moet eerst aangeven dat je naar "${festName}" wilt gaan voordat je een ticket kunt kopen.`);
          return;
        }
        
        // Trigger the change event to run the server update
        tableCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Flag that tickets have been updated
        localStorage.setItem('ticketsUpdated', 'true');
        localStorage.setItem('lastTicketUpdate', Date.now().toString());
      }
    };
    
    // Add the event listener
    cardCheckbox.addEventListener('change', cardCheckbox.ticketHandler);
  });
  
  // Attendee buttons functionality
  const attendeeButtons = document.querySelectorAll('.attendees-btn');

  attendeeButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const festName = btn.dataset.festival;

      try {
        console.log(`Fetching attendees for festival "${festName}"`);
        
        // Add temporary loading indicator
        const originalText = btn.textContent;
        btn.textContent = "Laden...";
        btn.disabled = true;
        
        // Fetch the other users
        const resp = await fetch(`/festival-attendees?festival=${encodeURIComponent(festName)}`);
        
        // Restore button state
        btn.textContent = originalText;
        btn.disabled = false;
        
        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(`Server returned ${resp.status}: ${errorText}`);
        }
        
        let result;
        try {
          result = await resp.json(); 
        } catch (jsonError) {
          throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
        }

        // Remove current user from list if desired
        const userEmail = localStorage.getItem('email') || '';
        const others = result.attendees.filter(u => u !== userEmail);

        console.log(`Found ${others.length} other attendees for "${festName}"`);

        // Determine message based on festival date
        const festival = festivals.find(f => f.name === festName);
        const isPast = festival && isFestivalInPast(festival.date);
        
        const messagePrefix = isPast ? 
          `Niemand anders is naar ${festName} geweest.` : 
          `Niemand anders heeft zich nog aangemeld voor ${festName}.`;
        
        const listPrefix = isPast ?
          `De volgende gebruikers zijn naar ${festName} geweest:` :
          `De volgende gebruikers gaan naar ${festName}:`;

        if (others.length === 0) {
          alert(messagePrefix);
        } else {
          alert(`${listPrefix}\n\n• ${others.join('\n• ')}`);
        }

      } catch (err) {
        console.error('Fout bij ophalen andere gebruikers:', err);
        alert(`Er ging iets mis bij het ophalen van de aanwezigen: ${err.message}`);
      }
    });
  });
});

// Add CSS to show updating state
document.addEventListener('DOMContentLoaded', () => {
  // Create style element for checkbox visual feedback
  const style = document.createElement('style');
  style.textContent = `
    .attend-checkbox.updating,
    .attend-checkbox-card.updating,
    .ticket-checkbox.updating,
    .ticket-checkbox-card.updating {
      opacity: 0.5;
      cursor: wait;
    }
    
    /* Styling for ticket purchase checkbox label */
    .ticket-label {
      display: inline-block;
      margin-left: 10px;
      color: #4CAF50;
      font-weight: bold;
    }
    
    /* Style for the ticket purchase checkbox */
    .ticket-checkbox {
      margin-left: 5px;
    }
    
    /* Tooltip style */
    .ticket-tooltip {
      position: relative;
      display: inline-block;
      cursor: help;
      font-size: 14px;
      color: #666;
      margin-left: 5px;
    }
    
    .ticket-tooltip .tooltip-text {
      visibility: hidden;
      width: 250px;
      background-color: #555;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 125%;
      left: 50%;
      margin-left: -125px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .ticket-tooltip:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
});

// Function to update attend button text based on festival date
document.addEventListener('DOMContentLoaded', function() {
  // Update "Ga ik?" text for past festivals in table view
  document.querySelectorAll('#festivalTbody tr').forEach(row => {
    const dateCell = row.querySelector('td:nth-child(5)'); // Date column
    if (!dateCell) return;
    
    const dateText = dateCell.textContent.trim();
    const isPast = isFestivalInPast(dateText);
    
    if (isPast) {
      // Find the table header and update it
      const tableHeaders = document.querySelectorAll('thead th');
      tableHeaders.forEach(th => {
        if (th.textContent.trim() === 'Ga ik?') {
          th.textContent = 'Ben ik hier geweest?';
        }
      });
      
      // Update the attend column for this row
      const attendCell = row.querySelector('td:nth-child(2)'); // "Ga ik?" column
      if (attendCell) {
        // Try to find and update all text nodes in the cell that contain "Ga ik?"
        const findAndReplaceText = (element) => {
          // Skip elements that handle their own text via the card view
          if (element.classList && (element.classList.contains('festival-card') || 
              element.classList.contains('card-view'))) {
            return;
          }
          
          // Process element's child nodes
          for (let i = 0; i < element.childNodes.length; i++) {
            const node = element.childNodes[i];
            if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('Ga ik?')) {
              node.textContent = node.textContent.replace('Ga ik?', 'Ben ik hier geweest?');
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              findAndReplaceText(node);
            }
          }
        };
        
        findAndReplaceText(attendCell);
        
        // Look for any label elements specifically
        const labels = attendCell.querySelectorAll('label');
        labels.forEach(label => {
          if (label.textContent.includes('Ga ik?')) {
            label.textContent = label.textContent.replace('Ga ik?', 'Ben ik hier geweest?');
          }
        });
      }
    }
  });
  
  // Also update card view labels if they exist
  document.querySelectorAll('.festival-card').forEach(card => {
    const dateEl = card.querySelector('.festival-detail');
    if (!dateEl) return;
    
    const dateText = dateEl.textContent.replace('Datum:', '').trim();
    const isPast = isFestivalInPast(dateText);
    
    if (isPast) {
      const attendSpan = card.querySelector('.action-attend span');
      if (attendSpan && attendSpan.textContent.trim() === 'Ga ik?') {
        attendSpan.textContent = 'Ben ik hier geweest?';
      }
    }
  });
});