// Update to script.js - Add custom popup for attendees

// ================================
// 1. COUNTDOWN-DEEL
// ================================
const festivals = [
  { name: "Wavy", date: "2024-12-21" },
  { name: "DGTL", date: "2025-04-18" },
  { name: "Free your mind Kingsday", date: "2025-04-26" },
  { name: "Loveland Kingsday", date: "2025-04-26" },
  { name: "Verbond", date: "2025-05-05" },
  { name: "Awakenings Upclose", date: "2025-05-17" },
  { name: "PIV", date: "2025-05-30" },
  { name: "Soenda", date: "2025-05-31" },
  { name: "Toffler", date: "2025-05-31" },
  { name: "909", date: "2025-06-07" },
  { name: "Diynamic", date: "2025-06-07" },
  { name: "Open Air", date: "2025-06-08" },
  { name: "Free Your Mind", date: "2025-06-08" },
  { name: "Mystic Garden Festival", date: "2025-06-14" },
  { name: "Vunzige Deuntjes", date: "2025-07-05" },
  { name: "KeineMusik", date: "2025-07-05" },
  { name: "Boothstock Festival", date: "2025-07-12" },
  { name: "Awakenings Festival", date: "2025-07-11" },
  { name: "Tomorrowland", date: "2025-07-18" },
  { name: "Mysteryland", date: "2025-07-22" },
  { name: "No Art", date: "2025-07-26" },
  { name: "Loveland", date: "2025-08-09" },
  { name: "Strafwerk", date: "2025-08-16" },
  { name: "Latin Village", date: "2025-08-17" },
  { name: "Parels van de stad", date: "2025-09-13" },
  { name: "Into the woods", date: "2025-09-19" },
];

function updateCountdown() {
  const now = new Date();
  let nextFestival = null;

  // Zoek het eerstvolgende festival op basis van datum
  for (const festival of festivals) {
    const festivalDate = new Date(festival.date);
    if (festivalDate > now) {
      nextFestival = festival;
      break;
    }
  }

  // Als er geen toekomstige festivals zijn, toon "END OF SEASON"
  if (!nextFestival) {
    document.getElementById("festival-name").textContent = "END OF SEASON";
    document.getElementById("countdown").textContent = "";
    return;
  }

  // Update festivalnaam
  document.getElementById("festival-name").textContent = nextFestival.name;

  // Bereken het verschil
  const festivalDate = new Date(nextFestival.date);
  const diff = festivalDate - now;

  if (diff <= 0) {
    // Festival is al bezig of net afgelopen
    setTimeout(updateCountdown, 1000);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Update DOM
  document.getElementById("days").textContent = days.toString().padStart(2, '0');
  document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
  document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
  document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
}

// Elke seconde update
setInterval(updateCountdown, 1000);
updateCountdown(); // direct uitvoeren

// Function to check if a festival date is in the past
function isFestivalInPast(festivalDate) {
  const now = new Date();
  const festDate = new Date(festivalDate);
  return festDate < now;
}

// ================================
// 2. SPELER-STATS (popup)
// ================================
document.addEventListener("DOMContentLoaded", () => {
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
    }
  };

  const showPopup = (playerName) => {
    const stats = playerStats[playerName];
    if (stats) {
      // Update popup
      document.getElementById("player-name").textContent = playerName;
      document.getElementById("player-age").textContent = stats.age;
      document.querySelector(".rating-label").textContent = stats.rating;

      const skillsList = document.getElementById("player-skills");
      skillsList.innerHTML = ""; 
      stats.skills.forEach(skill => {
        const li = document.createElement("li");
        li.textContent = skill;
        skillsList.appendChild(li);
      });
      // Toon popup
      document.getElementById("player-stats-popup").classList.remove("hidden");
    }
  };

  // Klik op player-cirkeltje
  document.querySelectorAll(".player").forEach(player => {
    player.addEventListener("click", () => {
      const playerName = player.nextElementSibling?.textContent.trim();
      if (playerName) {
        showPopup(playerName);
      }
    });
  });

  // Klik op de naam
  document.querySelectorAll(".player-name").forEach(name => {
    name.addEventListener("click", () => {
      const playerName = name.textContent.trim();
      showPopup(playerName);
    });
  });

  // Sluiten
  document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("player-stats-popup").classList.add("hidden");
  });
});

// ================================
// 3. FESTIVAL-LINKS
// ================================
const festivalLinks = {
  "Wavy": "https://www.wavyfestival.nl",
  "DGTL": "https://www.dgtl.nl",
  "Free your mind Kingsday": "https://www.freeyourmindfestival.nl",
  "Loveland Kingsday": "https://www.loveland.nl",
  "Verbond": "https://hetamsterdamsverbond.nl",
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
  "Strafwerk": "https://www.strafwerkfestival.nl",
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
// 4. FESTIVAL ATTENDANCE (DB-based)
// ================================
document.addEventListener('DOMContentLoaded', async () => {
  // 4a) Check of user is ingelogd
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');

  // Zoek de checkboxes
  const checkboxes = document.querySelectorAll('.attend-checkbox');

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
    checkboxes.forEach(cb => {
      cb.disabled = true;
    });
    return; 
  }

  // If user is logged in, fetch their festivals
  try {
    // Show loading state
    console.log("Fetching user festivals for:", userEmail);
    
    // Add a visual loading indicator to the table
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
    
    const resp = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
    
    // Remove loading indicator
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    
    // Check if response is ok
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Server returned ${resp.status}: ${errorText}`);
    }
    
    // Try to parse JSON response
    let data;
    try {
      data = await resp.json();
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
    }
    
    // Get user festivals and mark checkboxes
    const userFestivals = data.festivals || [];
    console.log("User festivals loaded:", userFestivals);

    // First mark all checkboxes based on userFestivals
    // This ensures that all your selected festivals stay selected, regardless of being past or future
    checkboxes.forEach(cb => {
      const festName = cb.dataset.festival;
      if (userFestivals.includes(festName)) {
        cb.checked = true;
        console.log(`Festival "${festName}" is checked`);
      } else {
        cb.checked = false;
      }
    });
    
    // Now set up event listeners for changes
    checkboxes.forEach(cb => {
      const festName = cb.dataset.festival;
      
      // Remove any existing event listeners to avoid duplicates
      cb.removeEventListener('change', cb.changeHandler);
      
      // Create a new handler function and store a reference to it
      cb.changeHandler = async function() {
        try {
          if (cb.checked) {
            console.log(`Marking festival "${festName}" as attending`);
            // Show mini-loading indicator on the checkbox itself
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
              // Revert checkbox if error
              cb.checked = false;
              return;
            }
            
            console.log(`Successfully marked "${festName}" as attending`);
          } else {
            console.log(`Unmarking festival "${festName}" as attending`);
            // Show mini-loading indicator on the checkbox itself
            cb.classList.add('updating');
            
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
              // Revert checkbox if error
              cb.checked = true;
              return;
            }
            
            console.log(`Successfully unmarked "${festName}" as attending`);
          }
          
          // Sync the state with other views
          syncCheckboxes(festName, cb.checked);
          
        } catch (err) {
          cb.classList.remove('updating');
          console.error(`Failed to update attendance for "${festName}":`, err);
          alert(`Er ging iets mis bij het bijwerken van je festivalstatus. Probeer het later opnieuw.`);
        }
      };
      
      // Add the change event listener
      cb.addEventListener('change', cb.changeHandler);
    });

    // Now sync all checkboxes between table and card view
    syncAllCheckboxes(userFestivals);

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
function syncAllCheckboxes(userFestivals) {
  // First sync table checkboxes based on server data
  document.querySelectorAll('.attend-checkbox').forEach(tableCheckbox => {
    const festName = tableCheckbox.dataset.festival;
    const isChecked = userFestivals.includes(festName);
    
    // Update the checkbox in table view
    tableCheckbox.checked = isChecked;
    
    // Find and update the corresponding card view checkbox
    syncCheckboxes(festName, isChecked);
  });
}

// Helper function to sync checkboxes between views
function syncCheckboxes(festivalName, isChecked) {
  // Update table view checkboxes
  const tableCheckboxes = document.querySelectorAll(`.attend-checkbox[data-festival="${festivalName}"]`);
  tableCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
  
  // Update card view checkboxes
  const cardCheckboxes = document.querySelectorAll(`.attend-checkbox-card[data-festival="${festivalName}"]`);
  cardCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
  
  // Update mobile view checkboxes if they exist
  const mobileCheckboxes = document.querySelectorAll(`.attend-checkbox-mobile[data-festival="${festivalName}"]`);
  mobileCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
}

// Add extra event listener to sync card view checkbox changes back to table view
document.addEventListener('DOMContentLoaded', () => {
  // Add event listeners to card view checkboxes if they exist
  document.querySelectorAll('.attend-checkbox-card').forEach(cardCheckbox => {
    const festName = cardCheckbox.dataset.festival;
    
    // Remove existing event listeners to avoid duplicates
    cardCheckbox.removeEventListener('change', cardCheckbox.changeHandler);
    
    // Create new handler and store reference
    cardCheckbox.changeHandler = function() {
      console.log(`Card checkbox for ${festName} changed to ${cardCheckbox.checked}`);
      
      // Find the corresponding table checkbox
      const tableCheckbox = document.querySelector(`.attend-checkbox[data-festival="${festName}"]`);
      if (tableCheckbox) {
        // Update the checked state
        tableCheckbox.checked = cardCheckbox.checked;
        
        // Trigger the change event to run the server update
        tableCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    
    // Add the event listener
    cardCheckbox.addEventListener('change', cardCheckbox.changeHandler);
  });
  
  // Initialize the custom attendees popup
  initializeAttendeesPopup();
  
  // Attendee buttons functionality
  const attendeeButtons = document.querySelectorAll('.attendees-btn');

  attendeeButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const festName = btn.dataset.festival;

      try {
        console.log(`Fetching attendees for festival "${festName}"`);
        
        // Add temporary loading indicator to button
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
        
        const titleText = isPast ?
          `Wie zijn er naar ${festName} geweest:` :
          `Wie gaan er naar ${festName}:`;

        // Show custom popup instead of alert
        if (others.length === 0) {
          showAttendeesPopup(festName, [], isPast);
        } else {
          showAttendeesPopup(festName, others, isPast);
        }

      } catch (err) {
        console.error('Fout bij ophalen andere gebruikers:', err);
        showAttendeesPopup(festName, [], false, err.message);
      }
    });
  });
});


// Function to initialize the custom attendees popup
function initializeAttendeesPopup() {
  // Check if popup already exists
  if (document.getElementById('attendees-popup')) {
    return;
  }
  
  // Create the popup elements
  const popupOverlay = document.createElement('div');
  popupOverlay.id = 'attendees-popup';
  popupOverlay.className = 'attendees-popup hidden';
  
  popupOverlay.innerHTML = `
    <div class="attendees-popup-content">
      <div class="attendees-popup-header">
        <h3 id="attendees-popup-title">Festival Attendees</h3>
        <span class="attendees-popup-close">&times;</span>
      </div>
      <div class="attendees-popup-body">
        <div id="attendees-list"></div>
        <div id="attendees-error" class="attendees-error hidden"></div>
      </div>
      <div class="attendees-popup-footer">
        <button class="attendees-popup-btn">Sluiten</button>
      </div>
    </div>
  `;
  
  // Append the popup to the body
  document.body.appendChild(popupOverlay);
  
  // Add event listeners for closing the popup
  const closeBtn = popupOverlay.querySelector('.attendees-popup-close');
  const closeButtonBottom = popupOverlay.querySelector('.attendees-popup-btn');
  
  // Close when clicking X
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      popupOverlay.classList.add('hidden');
      console.log('Close button (X) clicked');
    });
  }
  
  // Close when clicking the button
  if (closeButtonBottom) {
    closeButtonBottom.addEventListener('click', function() {
      popupOverlay.classList.add('hidden');
      console.log('Close button (bottom) clicked');
    });
  }
  
  // Close when clicking outside the popup
  popupOverlay.addEventListener('click', function(e) {
    if (e.target === popupOverlay) {
      popupOverlay.classList.add('hidden');
      console.log('Outside popup clicked');
    }
  });
}

// Function to show the attendees popup
function showAttendeesPopup(festivalName, attendees, isPast, errorMessage = null) {
  const popup = document.getElementById('attendees-popup');
  const popupTitle = document.getElementById('attendees-popup-title');
  const attendeesList = document.getElementById('attendees-list');
  const errorElement = document.getElementById('attendees-error');
  
  // Set the title based on past/future
  popupTitle.textContent = isPast ? 
    `Wie zijn er naar ${festivalName} geweest:` : 
    `Wie gaan er naar ${festivalName}:`;
  
  // Clear previous content
  attendeesList.innerHTML = '';
  errorElement.classList.add('hidden');
  
  // Display error message if there is one
  if (errorMessage) {
    errorElement.textContent = `Er is een fout opgetreden: ${errorMessage}`;
    errorElement.classList.remove('hidden');
  }
  // Display attendees or "no attendees" message
  else if (attendees.length === 0) {
    const messagePrefix = isPast ? 
      `Niemand anders is naar ${festivalName} geweest.` : 
      `Niemand anders heeft zich nog aangemeld voor ${festivalName}.`;
    
    attendeesList.innerHTML = `<p class="no-attendees">${messagePrefix}</p>`;
  } 
  else {
    // Create user list
    const userList = document.createElement('ul');
    userList.className = 'attendees-user-list';
    
    attendees.forEach(user => {
      const listItem = document.createElement('li');
      listItem.className = 'attendee-item';
      
      // Create avatar with first letter of username
      const firstLetter = user.charAt(0).toUpperCase();
      
      listItem.innerHTML = `
        <div class="attendee-avatar">${firstLetter}</div>
        <div class="attendee-name">${user}</div>
      `;
      
      userList.appendChild(listItem);
    });
    
    attendeesList.appendChild(userList);
  }
  
  // Show the popup
  popup.classList.remove('hidden');
}

// Add CSS to show updating state
document.addEventListener('DOMContentLoaded', () => {
  // Create style element for checkbox visual feedback
  const style = document.createElement('style');
  style.textContent = `
    .attend-checkbox.updating,
    .attend-checkbox-card.updating {
      opacity: 0.5;
      cursor: wait;
    }
    
    /* Attendees Popup Styles */
    .attendees-popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    
    .attendees-popup.hidden {
      display: none;
    }
    
    .attendees-popup-content {
      background-color: white;
      border-radius: 10px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      animation: popupFadeIn 0.3s ease;
    }
    
    @keyframes popupFadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .attendees-popup-header {
      padding: 15px 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #4CAF50;
      color: white;
      border-radius: 10px 10px 0 0;
    }
    
    .attendees-popup-header h3 {
      margin: 0;
      font-size: 1.2rem;
    }
    
    .attendees-popup-close {
      font-size: 24px;
      color: white;
      cursor: pointer;
      padding: 0 5px;
    }
    
    .attendees-popup-close:hover {
      color: #ddd;
    }
    
    .attendees-popup-body {
      padding: 20px;
      overflow-y: auto;
      max-height: 50vh;
    }
    
    .attendees-user-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .attendee-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .attendee-item:last-child {
      border-bottom: none;
    }
    
    .attendee-avatar {
      width: 40px;
      height: 40px;
      background-color: #4CAF50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      margin-right: 15px;
      font-size: 18px;
    }
    
    .attendee-name {
      font-size: 16px;
    }
    
    .attendees-popup-footer {
      padding: 15px 20px;
      border-top: 1px solid #e0e0e0;
      text-align: right;
      border-radius: 0 0 10px 10px;
    }
    
    .attendees-popup-btn {
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 8px 16px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    
    .attendees-popup-btn:hover {
      background-color: #45a049;
    }
    
    .no-attendees {
      text-align: center;
      font-style: italic;
      color: #666;
      padding: 15px 0;
    }
    
    .attendees-error {
      color: #d32f2f;
      background-color: #ffebee;
      padding: 10px;
      margin-top: 10px;
      border-radius: 5px;
      border-left: 4px solid #d32f2f;
    }
    
    .attendees-error.hidden {
      display: none;
    }
    
    /* Responsive adjustments */
    @media (max-width: 600px) {
      .attendees-popup-content {
        width: 95%;
      }
      
      .attendees-popup-header h3 {
        font-size: 1.1rem;
      }
      
      .attendee-avatar {
        width: 35px;
        height: 35px;
        font-size: 16px;
      }
    }
  `;
  
  document.head.appendChild(style);
});