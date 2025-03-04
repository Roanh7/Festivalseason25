// script.js with improved error handling

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
  { name: "Soenda", date: "2025-05-31" },
  { name: "Diynamic", date: "2025-06-07" },
  { name: "Open Air", date: "2025-06-08" },
  { name: "Free Your Mind", date: "2025-06-08" },
  { name: "Mystic Garden Festival", date: "2025-06-14" },
  { name: "Awakenings Festival", date: "2025-07-11" },
  { name: "Tomorrowland", date: "2025-07-18" },
  { name: "Mysteryland", date: "2025-07-22" },
  { name: "No Art", date: "2025-07-26" },
  { name: "Loveland", date: "2025-08-09" },
  { name: "Strafwerk", date: "2025-08-16" },
  { name: "Latin Village", date: "2025-08-17" },
  { name: "Parels van de stad", date: "2025-09-13" },
  { name: "Into the woods", date: "2025-09-19" },
  { name: "KeineMusik", date: "2025-07-05" },
  { name: "Toffler", date: "2025-05-31" },
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

  // REMOVED: Hamburger-klik code - this is now handled in navstatus.js
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

  // Niet ingelogd => disablen
  if (!token || !userEmail) {
    checkboxes.forEach(cb => {
      cb.disabled = true;
    });
    return; 
  }

  // Wel ingelogd:
  // 1) Haal eerst festivals op die de gebruiker al in DB heeft
  try {
    // Show loading state
    console.log("Fetching user festivals for:", userEmail);
    
    const resp = await fetch(`/my-festivals?email=${encodeURIComponent(userEmail)}`);
    
    // Check if response is ok (status code 200-299)
    if (!resp.ok) {
      // Try to get error text
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
    
    // Get user festivals or default to empty array
    const userFestivals = data.festivals || [];
    console.log("User festivals loaded:", userFestivals);

    // 2) Markeer checkboxes die user al heeft
    checkboxes.forEach(cb => {
      const festName = cb.dataset.festival;
      if (userFestivals.includes(festName)) {
        cb.checked = true;
        console.log(`Festival "${festName}" is checked`);
      }

      // 3) Bij (un)check roep /attend (POST) of /attend (DELETE) aan
      cb.addEventListener('change', async () => {
        try {
          if (cb.checked) {
            console.log(`Marking festival "${festName}" as attending`);
            // POST /attend
            const response = await fetch('/attend', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, festival: festName })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error attending festival: ${errorText}`);
              return;
            }
            
            console.log(`Successfully marked "${festName}" as attending`);
          } else {
            console.log(`Unmarking festival "${festName}" as attending`);
            // DELETE /attend
            const response = await fetch('/attend', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, festival: festName })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error unattending festival: ${errorText}`);
              return;
            }
            
            console.log(`Successfully unmarked "${festName}" as attending`);
          }
          
          // Sync the state with mobile view if it exists
          const mobileCheckbox = document.querySelector(`.attend-checkbox-mobile[data-festival="${festName}"]`);
          if (mobileCheckbox) {
            mobileCheckbox.checked = cb.checked;
          }
        } catch (err) {
          console.error(`Failed to update attendance for "${festName}":`, err);
          alert(`Er ging iets mis bij het bijwerken van je festivalstatus. Probeer het later opnieuw.`);
        }
      });
    });

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
    `;
    
    // Insert error message at the top of the table container
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.insertBefore(errorMessage, tableContainer.firstChild);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Vind alle 'attendees-btn' knoppen:
  const attendeeButtons = document.querySelectorAll('.attendees-btn');

  attendeeButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const festName = btn.dataset.festival; // "Wavy", "DGTL", etc.

      try {
        console.log(`Fetching attendees for festival "${festName}"`);
        
        // 1) Haal de andere gebruikers op
        const resp = await fetch(`/festival-attendees?festival=${encodeURIComponent(festName)}`);
        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(`Server returned ${resp.status}: ${errorText}`);
        }
        
        let result;
        try {
          result = await resp.json(); 
          // result.attendees = ["jouw@vriend.com", "andere@user.nl", ...]
        } catch (jsonError) {
          throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
        }

        // 2) Verwijder jouw eigen email als je dat wilt
        const userEmail = localStorage.getItem('email') || '';
        const others = result.attendees.filter(u => u !== userEmail);

        console.log(`Found ${others.length} other attendees for "${festName}"`);

        // 3) Toon in pop-up of alert, of in DOM
        if (others.length === 0) {
          alert(`Niemand anders heeft zich nog aangemeld voor ${festName}.`);
        } else {
          alert(`De volgende gebruikers gaan naar ${festName}:\n\n• ${others.join('\n• ')}`);
        }

      } catch (err) {
        console.error('Fout bij ophalen andere gebruikers:', err);
        alert(`Er ging iets mis bij het ophalen van de aanwezigen: ${err.message}`);
      }
    });
  });
});