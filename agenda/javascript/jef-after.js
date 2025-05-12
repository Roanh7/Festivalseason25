// jef-after.js - Script for Jef's After Counter page

document.addEventListener('DOMContentLoaded', async () => {
  // DOM elements
  const festivalCountElement = document.getElementById('festivalsAttended');
  const afterPartiesElement = document.getElementById('afterParties');
  const successRateElement = document.getElementById('successRate');
  const afterTimelineElement = document.getElementById('afterTimeline');
  const festivalsListElement = document.getElementById('festivalsList');
  const adminControlsElement = document.getElementById('adminControls');

  // Jef's email (the user we want to display stats for)
  const jefEmail = 'JFConstancia@hotmail.com';
  
  // Hard-coded after party data 
 const afterParties = [
  //none
   
 ];


  // Function to load Jef's festivals from the server
  async function loadJefFestivals() {
    try {
      // Get festivals Jef is attending
      const response = await fetch(`/my-festivals?email=${encodeURIComponent(jefEmail)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      return data.festivals || [];
    } catch (error) {
      console.error('Error fetching Jef\'s festivals:', error);
      return [];
    }
  }

  // Update counter values
  function updateCounters(festivalCount, afterCount) {
    festivalCountElement.textContent = festivalCount;
    afterPartiesElement.textContent = afterCount;
    
    // Calculate success rate (afterParties / festivals * 100)
    const successRate = festivalCount > 0 ? Math.round((afterCount / festivalCount) * 100) : 0;
    successRateElement.textContent = `${successRate}%`;
  }

  // Display after party timeline
  function displayAfterTimeline(afterList) {
    if (afterList.length === 0) {
      afterTimelineElement.innerHTML = '<p>Nog geen afters georganiseerd.</p>';
      return;
    }

    // Sort after parties by date (most recent first)
    const sortedAfters = [...afterList].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    let timelineHTML = '';
    
    sortedAfters.forEach(after => {
      // Format date
      const afterDate = new Date(after.date);
      const formattedDate = afterDate.toLocaleDateString('nl-NL', {
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      });
      
      timelineHTML += `
        <div class="timeline-item">
          <div class="timeline-date">${formattedDate}</div>
          <div class="timeline-title">${after.festival}</div>
          <div class="timeline-location">${after.location}</div>
          <div class="timeline-notes">${after.notes}</div>
        </div>
      `;
    });
    
    afterTimelineElement.innerHTML = timelineHTML;
  }

  // Display festivals list with after party badges
  function displayFestivalsList(festivals, afters) {
    if (festivals.length === 0) {
      festivalsListElement.innerHTML = '<p>Geen festivals gevonden.</p>';
      return;
    }

    // Create a set of festival names that have after parties
    const festivalWithAfters = new Set(afters.map(after => after.festival));
    
    let festivalsHTML = '';
    
    // Sort festivals by date
    const festivalDates = {
      "Wavy": "2024-12-21",
      "DGTL": "2025-04-19",
      "Free your mind Kingsday": "2025-04-26",
      "Loveland (Burst) Kingsday": "2025-04-26",
      "Verbond": "2025-05-05",
      "Music On": "2025-05-10",
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
    
    // Sort festivals by date
    const sortedFestivals = [...festivals].sort((a, b) => {
      const dateA = festivalDates[a] ? new Date(festivalDates[a]) : new Date();
      const dateB = festivalDates[b] ? new Date(festivalDates[b]) : new Date();
      return dateA - dateB; // Chronological order
    });
    
    sortedFestivals.forEach(festival => {
      const hasAfter = festivalWithAfters.has(festival);
      const festDate = festivalDates[festival] ? new Date(festivalDates[festival]) : null;
      
      // Format date if available
      let dateText = "Datum onbekend";
      if (festDate) {
        dateText = festDate.toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      
      festivalsHTML += `
        <div class="festival-item ${hasAfter ? 'with-after' : ''}">
          <div class="festival-name">${festival}</div>
          <div class="festival-date">${dateText}</div>
          ${hasAfter ? '<span class="festival-badge">After ✓</span>' : ''}
        </div>
      `;
    });
    
    festivalsListElement.innerHTML = festivalsHTML;
  }

  // Check if the current user is Jef or an admin
  function checkIfAdmin() {
    const currentUserEmail = localStorage.getItem('email');
    
    // If current user is Jef or admin, show admin controls
    if (currentUserEmail === jefEmail || currentUserEmail === 'admin@example.com') {
      adminControlsElement.style.display = 'block';
      setupAdminControls();
    } else {
      adminControlsElement.style.display = 'none';
    }
  }

  // Setup admin controls
  function setupAdminControls() {
    const festivalSelect = document.getElementById('festivalSelect');
    const afterDateInput = document.getElementById('afterDate');
    const afterLocationInput = document.getElementById('afterLocation');
    const afterNotesInput = document.getElementById('afterNotes');
    const addAfterBtn = document.getElementById('addAfterBtn');
    
    // Populate festival select with Jef's festivals
    loadJefFestivals().then(festivals => {
      let optionsHTML = '<option value="">Selecteer festival...</option>';
      
      festivals.forEach(festival => {
        optionsHTML += `<option value="${festival}">${festival}</option>`;
      });
      
      festivalSelect.innerHTML = optionsHTML;
    });
    
    // Add after party button
    addAfterBtn.addEventListener('click', () => {
      const festival = festivalSelect.value;
      const date = afterDateInput.value;
      const location = afterLocationInput.value;
      const notes = afterNotesInput.value;
      
      if (!festival || !date || !location) {
        showNotification('Vul alle verplichte velden in');
        return;
      }
      
      // This would typically send a request to the server
      // but we're using hard-coded data for now
      showNotification('After party toegevoegd! (Dit is een mockup - de gegevens worden niet echt opgeslagen)');
      
      // Reset form
      festivalSelect.value = '';
      afterDateInput.value = '';
      afterLocationInput.value = '';
      afterNotesInput.value = '';
    });
  }

  // Show notification
  function showNotification(message) {
    const modal = document.getElementById('notificationModal');
    const modalMessage = document.getElementById('modalMessage');
    
    modalMessage.textContent = message;
    modal.classList.add('show');
    
    // Close button
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  }

  // Main initialization function
  async function initialize() {
    // Load Jef's festivals
    const festivals = await loadJefFestivals();
    
    // Update counters
    updateCounters(festivals.length, afterParties.length);
    
    // Display after timeline
    displayAfterTimeline(afterParties);
    
    // Display festivals list
    displayFestivalsList(festivals, afterParties);
    
    // Check if admin
    checkIfAdmin();
  }
  
  // Call the initialization function
  initialize();
});