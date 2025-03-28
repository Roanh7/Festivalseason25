// mvp-vote.js - Handle MVP voting functionality

document.addEventListener('DOMContentLoaded', function() {
  // Create the MVP voting modal if it doesn't exist already
  if (!document.getElementById('mvp-vote-modal')) {
    const modalHTML = `
      <!-- MVP Voting Modal -->
      <div id="mvp-vote-modal" class="modal hidden">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="mvp-modal-title">Vote for Festival MVP</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p class="modal-description">Wie was volgens jou de meest waardevolle speler van dit festival?</p>
            
            <div class="mvp-candidates">
              <!-- MVP candidates will be populated dynamically -->
              <div class="loading-indicator">Laden van S-team leden...</div>
            </div>
            
            <div class="mvp-vote-confirmation hidden">
              <p>Bedankt voor je stem! Je hebt gestemd op: <span id="selected-mvp">Naam</span></p>
            </div>
          </div>
          <div class="modal-footer">
            <button id="submit-mvp-vote" class="submit-btn" disabled>Stem uitbrengen</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  // Add MVP Results container to the main page if on agenda.html
  if (window.location.pathname.includes('agenda.html') || window.location.pathname === '/' || window.location.pathname === '') {
    addMvpResultsContainer();
  }
  
  // Get DOM elements
  const mvpModal = document.getElementById('mvp-vote-modal');
  const modalTitle = document.getElementById('mvp-modal-title');
  const candidatesContainer = document.querySelector('.mvp-candidates');
  const confirmationBox = document.querySelector('.mvp-vote-confirmation');
  const selectedMvpDisplay = document.getElementById('selected-mvp');
  const submitButton = document.getElementById('submit-mvp-vote');
  const closeButton = mvpModal.querySelector('.modal-close');
  const overlay = mvpModal.querySelector('.modal-overlay');
  
  // S-team members data
  const steamMembers = [
    { name: "Roan", position: "Keeper", initial: "R" },
    { name: "Muc", position: "Verdediger", initial: "M" },
    { name: "Rick", position: "Verdediger", initial: "R" },
    { name: "Chip", position: "Middenvelder", initial: "C" },
    { name: "Jef", position: "Aanvaller", initial: "J" },
    { name: "Avend", position: "Verdediger", initial: "A" },
    { name: "Awdar", position: "Verdediger", initial: "A" },
    { name: "Faro", position: "Verdediger", initial: "F" },
    { name: "Hamada", position: "Aanvaller", initial: "H" },
    { name: "Joost", position: "Middenvelder", initial: "J" },
    { name: "Kosjber", position: "Middenvelder", initial: "K" },
    { name: "Menno", position: "Verdediger", initial: "M" },
    { name: "MD", position: "Aanvaller", initial: "M" },
    { name: "Shawkat", position: "Keeper", initial: "S" },
    { name: "Tom", position: "Bank", initial: "T" },
    { name: "Trim", position: "Aanvaller", initial: "T" },
    { name: "Zana", position: "Middenvelder", initial: "Z" }
  ];
  
  let selectedCandidate = null;
  let currentFestival = null;
  
  // Function to show voting modal
  window.openMvpVoteModal = function(festivalName) {
    // Reset modal state
    selectedCandidate = null;
    currentFestival = festivalName;
    submitButton.disabled = true;
    confirmationBox.classList.add('hidden');
    
    // Update modal title
    modalTitle.textContent = `MVP voor ${festivalName}`;
    
    // Load candidates
    loadCandidates();
    
    // Show the modal
    mvpModal.classList.remove('hidden');
  };
  
  // Function to load S-team members as candidates
  function loadCandidates() {
    if (!candidatesContainer) return;
    
    // Clear previous candidates
    candidatesContainer.innerHTML = '';
    
    // Add each S-team member as a candidate
    steamMembers.forEach(member => {
      const candidateElement = document.createElement('div');
      candidateElement.className = 'mvp-candidate';
      candidateElement.dataset.name = member.name;
      
      candidateElement.innerHTML = `
        <div class="mvp-candidate-avatar">${member.initial}</div>
        <div class="mvp-candidate-name">${member.name}</div>
        <div class="mvp-candidate-position">${member.position}</div>
      `;
      
      // Add click event to select candidate
      candidateElement.addEventListener('click', () => {
        // Remove selection from all candidates
        document.querySelectorAll('.mvp-candidate').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Add selection to this candidate
        candidateElement.classList.add('selected');
        
        // Store selected candidate
        selectedCandidate = member.name;
        
        // Enable submit button
        submitButton.disabled = false;
      });
      
      candidatesContainer.appendChild(candidateElement);
    });
  }
  
  // Submit MVP vote
  submitButton.addEventListener('click', async () => {
    if (!selectedCandidate || !currentFestival) {
      alert('Selecteer eerst een MVP');
      return;
    }
    
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      alert('Je moet ingelogd zijn om te stemmen');
      return;
    }
    
    try {
      // Submit vote to server
      const response = await fetch('/mvp-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          festival: currentFestival,
          mvp: selectedCandidate
        })
      });
      
      if (response.ok) {
        // Show confirmation
        confirmationBox.classList.remove('hidden');
        selectedMvpDisplay.textContent = selectedCandidate;
        
        // Disable submit button
        submitButton.disabled = true;
        
        // Reload MVP results on agenda page if visible
        if (document.getElementById('mvp-results-container')) {
          setTimeout(() => {
            loadMvpResults();
          }, 1000);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to submit vote'}`);
      }
    } catch (error) {
      console.error('Error submitting MVP vote:', error);
      alert('Er is een fout opgetreden bij het indienen van je stem. Probeer het later opnieuw.');
    }
  });
  
  // Close modal functions
  function closeModal() {
    mvpModal.classList.add('hidden');
  }
  
  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  // Add keydown event to close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !mvpModal.classList.contains('hidden')) {
      closeModal();
    }
  });
  
  // Check for pending MVP votes
  checkPendingVotes();
  
  // Function to check if user has pending MVP votes
  async function checkPendingVotes() {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) return;
    
    try {
      const response = await fetch(`/pending-mvp-votes?email=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.pendingVotes && data.pendingVotes.length > 0) {
          // Add notification badge to the main menu
          addMvpNotificationBadge(data.pendingVotes.length);
          
          // If on the agenda page, maybe show a reminder
          if (window.location.pathname.includes('agenda.html') || window.location.pathname === '/' || window.location.pathname === '') {
            showMvpVoteReminder(data.pendingVotes[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error checking pending MVP votes:', error);
    }
  }
  
  // Function to add notification badge to the menu
  function addMvpNotificationBadge(count) {
    // Find a reasonable place to add the notification (like next to account link)
    const menuItems = document.querySelectorAll('.nav-menu li a');
    let accountLink = null;
    
    menuItems.forEach(link => {
      if (link.getAttribute('href') === 'account.html') {
        accountLink = link;
      }
    });
    
    if (accountLink) {
      // Check if badge already exists
      if (!accountLink.querySelector('.mvp-vote-badge')) {
        accountLink.classList.add('mvp-vote-notification');
        const badge = document.createElement('span');
        badge.className = 'mvp-vote-badge';
        badge.textContent = count;
        accountLink.appendChild(badge);
      }
    }
  }
  
  // Function to add MVP results container to the main page
  function addMvpResultsContainer() {
    // Check if container already exists
    if (document.getElementById('mvp-results-container')) {
      return;
    }
    
    // Create the container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'mvp-results-container';
    resultsContainer.className = 'mvp-results-container';
    
    // Start with loading state
    resultsContainer.innerHTML = `
      <h2 class="mvp-results-title">Festival MVP Ranking</h2>
      <div class="loading-indicator">Laden van MVP resultaten...</div>
    `;
    
    // Insert into the page before the field container
    const fieldContainer = document.querySelector('.field-container');
    if (fieldContainer) {
      fieldContainer.parentNode.insertBefore(resultsContainer, fieldContainer);
      
      // Load MVP results
      loadMvpResults();
    }
  }
  
  // Function to load and display MVP results
  async function loadMvpResults() {
    const resultsContainer = document.getElementById('mvp-results-container');
    if (!resultsContainer) return;
    
    try {
      const response = await fetch('/mvp-results');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          // Sort by vote count
          const sortedResults = data.results.sort((a, b) => b.votes - a.votes);
          const winner = sortedResults[0];
          
          // Format the results HTML
          let resultsHTML = `
            <h2 class="mvp-results-title">Festival MVP Ranking</h2>
            <div class="mvp-winner">
              <div class="mvp-trophy">🏆</div>
              <div class="mvp-winner-avatar">${winner.name.charAt(0)}</div>
              <div class="mvp-winner-name">${winner.name}</div>
              <div class="mvp-winner-votes">${winner.votes} ${winner.votes === 1 ? 'stem' : 'stemmen'}</div>
            </div>
          `;
          
          if (sortedResults.length > 1) {
            resultsHTML += `
              <div class="mvp-results-list">
                <h4>Top ${Math.min(sortedResults.length, 5)} MVPs</h4>
            `;
            
            // Add top 5 (or fewer if less available)
            for (let i = 0; i < Math.min(sortedResults.length, 5); i++) {
              const result = sortedResults[i];
              resultsHTML += `
                <div class="mvp-result-item">
                  <div class="mvp-result-position">#${i + 1}</div>
                  <div class="mvp-result-avatar">${result.name.charAt(0)}</div>
                  <div class="mvp-result-name">${result.name}</div>
                  <div class="mvp-result-votes">${result.votes}</div>
                </div>
              `;
            }
            
            resultsHTML += `</div>`;
          }
          
          resultsContainer.innerHTML = resultsHTML;
        } else {
          resultsContainer.innerHTML = `
            <h2 class="mvp-results-title">Festival MVP Ranking</h2>
            <p>Er zijn nog geen MVP stemmen uitgebracht.</p>
          `;
        }
      } else {
        resultsContainer.innerHTML = `
          <h2 class="mvp-results-title">Festival MVP Ranking</h2>
          <p>Kon MVP resultaten niet laden.</p>
        `;
      }
    } catch (error) {
      console.error('Error loading MVP results:', error);
      resultsContainer.innerHTML = `
        <h2 class="mvp-results-title">Festival MVP Ranking</h2>
        <p>Er is een fout opgetreden bij het laden van de MVP resultaten.</p>
      `;
    }
  }
  
  // Function to show MVP vote reminder
  function showMvpVoteReminder(festival) {
    // Create a reminder element
    const reminder = document.createElement('div');
    reminder.className = 'info-message';
    reminder.style.backgroundColor = '#f0f9f0';
    reminder.style.borderColor = '#4CAF50';
    reminder.style.margin = '1rem auto';
    reminder.style.maxWidth = '800px';
    reminder.style.textAlign = 'center';
    reminder.style.padding = '10px';
    reminder.style.borderRadius = '8px';
    reminder.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    
    reminder.innerHTML = `
      <p>Je hebt nog niet gestemd voor de MVP van <strong>${festival}</strong>!</p>
      <button class="btn" style="margin-top: 10px; background-color: #4CAF50; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;">
        Stem nu
      </button>
    `;
    
    // Add click handler for the button
    reminder.querySelector('button').addEventListener('click', () => {
      openMvpVoteModal(festival);
      reminder.remove();
    });
    
    // Insert at the top of the main content
    const main = document.querySelector('main');
    if (main && main.firstChild) {
      main.insertBefore(reminder, main.firstChild);
    }
  }
  
  // Add a "Vote for MVP" button to each festival card
  function addMvpVoteButtons() {
    // Only add to past festivals
    const now = new Date();
    
    // Try to add to table view
    document.querySelectorAll('#festivalTbody tr').forEach(row => {
      const dateCell = row.querySelector('td:nth-child(5)');
      const nameCell = row.querySelector('td:nth-child(6)');
      const attendCheckbox = row.querySelector('.attend-checkbox');
      
      if (dateCell && nameCell && attendCheckbox) {
        const dateText = dateCell.textContent;
        const festivalName = nameCell.textContent.trim();
        
        // Check if festival is in the past
        if (isFestivalInPast(dateText)) {
          // Check if user is attending
          if (attendCheckbox.checked) {
            // Check if button already exists
            const existingButton = row.querySelector('.mvp-vote-btn');
            if (!existingButton) {
              // Create MVP vote button
              const mvpButton = document.createElement('button');
              mvpButton.className = 'mvp-vote-btn';
              mvpButton.style.marginLeft = '5px';
              mvpButton.style.backgroundColor = '#F44336';
              mvpButton.style.color = 'white';
              mvpButton.style.border = 'none';
              mvpButton.style.borderRadius = '4px';
              mvpButton.style.padding = '3px 8px';
              mvpButton.style.fontSize = '0.8rem';
              mvpButton.style.cursor = 'pointer';
              mvpButton.textContent = 'MVP';
              
              // Add click event
              mvpButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openMvpVoteModal(festivalName);
              });
              
              // Add to the row
              const actionsCell = row.querySelector('td:nth-child(4)');
              if (actionsCell) {
                actionsCell.appendChild(mvpButton);
              }
            }
          }
        }
      }
    });
    
    // Try to add to card view as well
    document.querySelectorAll('.festival-card').forEach(card => {
      const dateEl = card.querySelector('.festival-detail:nth-child(1)');
      const nameEl = card.querySelector('.festival-name');
      const attendCheckbox = card.querySelector('.attend-checkbox-card');
      
      if (dateEl && nameEl && attendCheckbox) {
        const dateText = dateEl.textContent.replace('Datum:', '').trim();
        const festivalLink = nameEl.querySelector('a');
        const festivalName = festivalLink ? festivalLink.textContent.trim() : nameEl.textContent.trim();
        
        // Check if festival is in the past
        if (isFestivalInPast(dateText)) {
          // Check if user is attending
          if (attendCheckbox.checked) {
            // Check if button already exists
            const existingButton = card.querySelector('.mvp-vote-btn');
            if (!existingButton) {
              // Create MVP vote button
              const mvpButton = document.createElement('button');
              mvpButton.className = 'mvp-vote-btn';
              mvpButton.style.marginTop = '10px';
              mvpButton.style.width = '100%';
              mvpButton.style.backgroundColor = '#F44336';
              mvpButton.style.color = 'white';
              mvpButton.style.border = 'none';
              mvpButton.style.borderRadius = '4px';
              mvpButton.style.padding = '5px 10px';
              mvpButton.style.cursor = 'pointer';
              mvpButton.textContent = 'Vote for MVP';
              
              // Add click event
              mvpButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openMvpVoteModal(festivalName);
              });
              
              // Add to the card
              const actionsDiv = card.querySelector('.festival-actions');
              if (actionsDiv) {
                actionsDiv.appendChild(mvpButton);
              }
            }
          }
        }
      }
    });
  }
  
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
  
  // Run after a delay to ensure checkboxes are loaded
  setTimeout(() => {
    addMvpVoteButtons();
  }, 1000);
  
  // Set up mutation observer to add MVP vote buttons to dynamically added elements
  const observer = new MutationObserver(function(mutations) {
    let shouldAddButtons = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any festival cards or rows were added
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            if ((node.classList && (node.classList.contains('festival-card') || node.tagName === 'TR')) || 
                (node.querySelector && (node.querySelector('.festival-card') || node.querySelector('tr')))) {
              shouldAddButtons = true;
            }
          }
        });
      }
    });
    
    if (shouldAddButtons) {
      // Add a slight delay to ensure checkboxes are fully initialized
      setTimeout(() => {
        addMvpVoteButtons();
      }, 500);
    }
  });
  
  // Observe the document body for changes
  observer.observe(document.body, { 
    childList: true,
    subtree: true 
  });
  
  // Also check for attendance changes to add MVP buttons
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.classList.contains('attend-checkbox') || 
                    e.target.classList.contains('attend-checkbox-card'))) {
      // Wait for the attendance status to be updated
      setTimeout(() => {
        addMvpVoteButtons();
      }, 500);
    }
  });
});