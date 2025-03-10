// custom-attendees-dialog.js - Replace browser alerts with styled custom dialogs

document.addEventListener('DOMContentLoaded', function() {
  // Create the custom dialog HTML and append to body
  const dialogHTML = `
    <div id="custom-dialog" class="custom-dialog hidden">
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h3 id="dialog-title">Wie gaan er nog meer?</h3>
          <button class="dialog-close">&times;</button>
        </div>
        <div class="dialog-body">
          <p id="dialog-message"></p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-button">OK</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', dialogHTML);
  
  // Get DOM elements
  const customDialog = document.getElementById('custom-dialog');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogMessage = document.getElementById('dialog-message');
  const closeButton = customDialog.querySelector('.dialog-close');
  const okButton = customDialog.querySelector('.dialog-button');
  const overlay = customDialog.querySelector('.dialog-overlay');
  
  // Create CSS styles for the dialog
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .custom-dialog {
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
    
    .custom-dialog.hidden {
      display: none;
    }
    
    .dialog-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .dialog-content {
      background-color: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 1001;
      animation: dialog-appear 0.3s ease;
    }
    
    @keyframes dialog-appear {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      background-color: #4CAF50;
      color: white;
      border-radius: 8px 8px 0 0;
    }
    
    .dialog-header h3 {
      margin: 0;
      font-size: 1.2rem;
    }
    
    .dialog-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: white;
      padding: 0;
      line-height: 1;
    }
    
    .dialog-body {
      padding: 20px;
      max-height: 50vh;
      overflow-y: auto;
    }
    
    .dialog-body ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    
    .dialog-body ul li {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .dialog-body ul li:last-child {
      border-bottom: none;
    }
    
    .dialog-footer {
      padding: 15px 20px;
      text-align: right;
      border-top: 1px solid #eee;
    }
    
    .dialog-button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    
    .dialog-button:hover {
      background-color: #45a049;
    }
    
    /* Style for when no attendees */
    .no-attendees {
      font-style: italic;
      color: #666;
      text-align: center;
      padding: 10px 0;
    }
    
    /* User list with avatars */
    .attendee-list {
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
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #4CAF50;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 12px;
    }
    
    .attendee-name {
      flex: 1;
    }
  `;
  document.head.appendChild(styleElement);
  
  // Close dialog functions
  function closeDialog() {
    customDialog.classList.add('hidden');
    document.body.style.overflow = '';
  }
  
  closeButton.addEventListener('click', closeDialog);
  okButton.addEventListener('click', closeDialog);
  overlay.addEventListener('click', closeDialog);
  
  // Add keydown event to close dialog on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !customDialog.classList.contains('hidden')) {
      closeDialog();
    }
  });
  
  // Override the attendees buttons click function
  const overrideAttendeesButtons = function() {
    const attendeeButtons = document.querySelectorAll('.attendees-btn');
    
    attendeeButtons.forEach(btn => {
      // Remove the old event listeners using cloneNode
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Add our new event listener
      newBtn.addEventListener('click', async function() {
        const festName = this.dataset.festival;
        if (!festName) return;
        
        try {
          // Show a loading indicator in the dialog
          dialogTitle.textContent = `${festName}`;
          dialogMessage.innerHTML = '<div style="text-align:center; padding:20px;">Laden van gegevens...</div>';
          
          // Show the dialog
          customDialog.classList.remove('hidden');
          document.body.style.overflow = 'hidden'; // Prevent scrolling
          
          // Fetch the attendees data
          const resp = await fetch(`/festival-attendees?festival=${encodeURIComponent(festName)}`);
          
          if (!resp.ok) {
            throw new Error(`Server returned ${resp.status}`);
          }
          
          const result = await resp.json();
          const others = result.attendees || [];
          
          // Determine if festival is in past or future
          const festival = window.festivals?.find(f => f.name === festName);
          const isPast = festival ? isFestivalInPast(festival.date) : false;
          
          // Set appropriate title
          dialogTitle.textContent = isPast ? 
            `Wie zijn er naar ${festName} geweest?` : 
            `Wie gaan er naar ${festName}?`;
          
          // Update dialog content
          if (others.length === 0) {
            // No other attendees
            const messagePrefix = isPast ? 
              `Niemand anders is naar ${festName} geweest.` : 
              `Niemand anders heeft zich nog aangemeld voor ${festName}.`;
            
            dialogMessage.innerHTML = `<div class="no-attendees">${messagePrefix}</div>`;
          } else {
            // Show the list of attendees
            const listPrefix = isPast ?
              `De volgende gebruikers zijn naar ${festName} geweest:` :
              `De volgende gebruikers gaan naar ${festName}:`;
            
            let listHTML = `<p>${listPrefix}</p><ul class="attendee-list">`;
            
            others.forEach(attendee => {
              const initial = attendee.charAt(0).toUpperCase();
              listHTML += `
                <li class="attendee-item">
                  <div class="attendee-avatar">${initial}</div>
                  <div class="attendee-name">${attendee}</div>
                </li>
              `;
            });
            
            listHTML += '</ul>';
            dialogMessage.innerHTML = listHTML;
          }
        } catch (err) {
          console.error('Error fetching attendees:', err);
          dialogMessage.innerHTML = `
            <div class="error-message" style="color:red; text-align:center;">
              Er is een fout opgetreden bij het ophalen van de gegevens.<br>
              Probeer het later opnieuw.
            </div>
          `;
        }
      });
    });
  };
  
  // Function to check if festival is in the past (copy from card-view.js)
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
  
  // Call the override function initially
  overrideAttendeesButtons();
  
  // Setup a mutation observer to override buttons that might be added later
  // (for example when filtering/sorting the table)
  const observer = new MutationObserver(function(mutations) {
    let shouldOverride = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            if (node.classList && node.classList.contains('attendees-btn')) {
              shouldOverride = true;
            } else if (node.querySelector && node.querySelector('.attendees-btn')) {
              shouldOverride = true;
            }
          }
        });
      }
    });
    
    if (shouldOverride) {
      overrideAttendeesButtons();
    }
  });
  
  // Start observing the document
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
});