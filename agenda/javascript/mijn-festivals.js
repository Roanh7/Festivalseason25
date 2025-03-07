// mijn-festivals.js - Show user's attending festivals

document.addEventListener('DOMContentLoaded', async () => {
  // DOM elements
  const upcomingFestContainer = document.getElementById('upcomingFestContainer');
  const pastFestContainer = document.getElementById('pastFestContainer');
  const upcomingCountEl = document.getElementById('upcomingCount');
  const pastCountEl = document.getElementById('pastCount');

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  
  // Festival date information (from your script.js)
  const festivalDates = {
    "Wavy": "2024-12-21",
    "DGTL": "2025-04-18",
    "Free your mind Kingsday": "2025-04-26",
    "Loveland Kingsday": "2025-04-26",
    "Verbond": "2025-05-05",
    "Awakenings Upclose": "2025-05-17",
    "Soenda": "2025-05-31",
    "Toffler": "2025-05-31",
    "909": "2025-06-07",
    "Diynamic": "2025-06-07",
    "Open Air": "2025-06-08",
    "Free Your Mind": "2025-06-08",
    "Mystic Garden Festival": "2025-06-14",
    "Vunzige Deuntjes": "2025-07-05",
    "KeineMusik": "2025-07-05",
    "Awakenings Festival": "2025-07-11",
    "Tomorrowland": "2025-07-18",
    "Mysteryland": "2025-07-22",
    "No Art": "2025-07-26",
    "Loveland": "2025-08-09",
    "Strafwerk": "2025-08-16",
    "Latin Village": "2025-08-17",
    "Parels van de stad": "2025-09-13",
    "Into the woods": "2025-09-19",
    "PIV": "2025-09-30",
    "Boothstock Festival": "2025-07-12"
  };
  
  // Links to festival websites (from script.js)
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
    "Into the woods": "https://www.intothewoodsfestival.nl"
  };

  // Helper function to format date as Dutch format
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    
    // Dutch month names
    const monthNames = [
      'januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december'
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  }

  // Show a message if user is not logged in
  if (!token || !userEmail) {
    // Create a message
    const notLoggedInMsg = document.createElement('div');
    notLoggedInMsg.className = 'message-container';
    notLoggedInMsg.innerHTML = `
      <p>Je bent niet ingelogd. <a href="login.html">Log in</a> om je festivals te bekijken.</p>
    `;
    
    // Insert it after the h2 elements
    const headers = document.querySelectorAll('main h2');
    if (headers.length > 0) {
      headers[0].after(notLoggedInMsg);
    } else {
      document.querySelector('main').appendChild(notLoggedInMsg);
    }
    
    // Hide the containers
    if (upcomingFestContainer) upcomingFestContainer.style.display = 'none';
    if (pastFestContainer) pastFestContainer.style.display = 'none';
    return;
  }

  // If user is logged in, fetch their festivals
  try {
    const response = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    const userFestivals = data.festivals || [];
    console.log("User festivals loaded:", userFestivals);
    
    // Divide festivals into upcoming and past
    const now = new Date();
    const upcomingFests = [];
    const pastFests = [];
    
    userFestivals.forEach(festName => {
      if (!festivalDates[festName]) {
        console.warn(`No date found for festival: ${festName}`);
        return;
      }
      
      const festDate = new Date(festivalDates[festName]);
      if (festDate > now) {
        upcomingFests.push({
          name: festName,
          date: festDate,
          dateStr: festivalDates[festName]
        });
      } else {
        pastFests.push({
          name: festName,
          date: festDate,
          dateStr: festivalDates[festName]
        });
      }
    });
    
    // Sort festivals by date
    upcomingFests.sort((a, b) => a.date - b.date); // Earliest first
    pastFests.sort((a, b) => b.date - a.date); // Most recent first
    
    // Update counters
    if (upcomingCountEl) {
      upcomingCountEl.textContent = `Je hebt ${upcomingFests.length} aankomende festivals.`;
    }
    
    if (pastCountEl) {
      pastCountEl.textContent = `Je hebt ${pastFests.length} festivals bezocht.`;
    }
    
    // Display upcoming festivals
    if (upcomingFestContainer) {
      if (upcomingFests.length === 0) {
        upcomingFestContainer.innerHTML = '<p class="no-festivals">Je hebt geen aankomende festivals geselecteerd.</p>';
      } else {
        upcomingFestContainer.innerHTML = ''; // Clear container
        
        upcomingFests.forEach(fest => {
          const formattedDate = formatDate(fest.dateStr);
          const festivalLink = festivalLinks[fest.name] || '#';
          
          const festCard = document.createElement('div');
          festCard.className = 'festival-card';
          festCard.innerHTML = `
            <div class="festival-title">${fest.name}</div>
            <div class="festival-text">
              <p><strong>Datum:</strong> ${formattedDate}</p>
              <p><a href="${festivalLink}" target="_blank" class="btn-link">Bezoek website</a></p>
            </div>
          `;
          
          upcomingFestContainer.appendChild(festCard);
        });
      }
    }
    
    // Display past festivals
    if (pastFestContainer) {
      if (pastFests.length === 0) {
        pastFestContainer.innerHTML = '<p class="no-festivals">Je hebt nog geen festivals bezocht.</p>';
      } else {
        pastFestContainer.innerHTML = ''; // Clear container
        
        pastFests.forEach(fest => {
          const formattedDate = formatDate(fest.dateStr);
          const festivalLink = festivalLinks[fest.name] || '#';
          
          const festCard = document.createElement('div');
          festCard.className = 'festival-card';
          festCard.innerHTML = `
            <div class="festival-title">${fest.name}</div>
            <div class="festival-text">
              <p><strong>Datum:</strong> ${formattedDate}</p>
              <p>
                <a href="${festivalLink}" target="_blank" class="btn-link">Bezoek website</a>
                <a href="reviews.html" class="btn-review">Review schrijven</a>
              </p>
            </div>
          `;
          
          pastFestContainer.appendChild(festCard);
        });
      }
    }
  } catch (error) {
    console.error('Error fetching festivals:', error);
    
    // Show error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.innerHTML = `
      <p>Er is een probleem opgetreden bij het laden van je festivals. Probeer het later nog eens.</p>
      <p>Foutmelding: ${error.message}</p>
    `;
    
    // Add the error message to both containers
    if (upcomingFestContainer) upcomingFestContainer.innerHTML = '';
    if (pastFestContainer) pastFestContainer.innerHTML = '';
    
    if (upcomingFestContainer) upcomingFestContainer.appendChild(errorMsg.cloneNode(true));
    if (pastFestContainer) pastFestContainer.appendChild(errorMsg.cloneNode(true));
  }
});