// festival-lineup.js - Functionality for festival lineups modal

document.addEventListener('DOMContentLoaded', function() {
  // Create the lineup modal HTML and append to body
  const modalHTML = `
    <div id="lineup-modal" class="lineup-modal hidden">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="lineup-modal-title">Festival Lineup</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="day-tabs" id="lineup-tabs">
            <!-- Tabs will be added dynamically -->
          </div>
          <div class="lineup-images" id="lineup-images">
            <!-- Images will be added dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add CSS styles for the lineup modal
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Lineup icon style */
    .lineup-icon {
      display: inline-block;
      margin-left: 8px;
      cursor: pointer;
      color: #4CAF50;
      font-size: 1rem;
      vertical-align: middle;
      transition: transform 0.2s ease;
    }
    
    .lineup-icon:hover {
      transform: scale(1.2);
    }
    
    /* Modal styles */
    .lineup-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .lineup-modal.hidden {
      display: none;
    }
    
    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    .modal-content {
      background-color: white;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      position: relative;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 2001;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #4CAF50;
      color: white;
      border-radius: 8px 8px 0 0;
    }
    
    .modal-header h3 {
      margin: 0;
      font-size: 1.4rem;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 1.8rem;
      cursor: pointer;
      color: white;
      padding: 0;
      line-height: 1;
      transition: transform 0.2s;
    }
    
    .modal-close:hover {
      transform: scale(1.1);
    }
    
    .modal-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    /* Day tabs for multi-day festivals */
    .day-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    
    .day-tab {
      padding: 8px 16px;
      background-color: #f0f0f0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    
    .day-tab:hover {
      background-color: #e0e0e0;
    }
    
    .day-tab.active {
      background-color: #4CAF50;
      color: white;
    }
    
    /* Lineup images container */
    .lineup-images {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-height: 200px; /* Minimum height to prevent layout jumps */
      overflow: auto; /* Changed from hidden to auto to allow scrolling */
      -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    }
    
    .lineup-image {
      max-width: 100%;
      max-height: 70vh;
      display: none;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transform-origin: top left; /* Set transform origin for pinch zoom */
      touch-action: manipulation; /* Allow native touch behaviors */
    }
    
    .lineup-image.active {
      display: block;
    }
    
    /* Zoom controls for mobile */
    .zoom-controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    
    .zoom-btn {
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .zoom-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    /* Loading indicator */
    .loading-indicator {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }
    
    /* No lineup available message */
    .no-lineup {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        max-height: 80vh;
      }
      
      .modal-header h3 {
        font-size: 1.2rem;
      }
      
      .day-tab {
        padding: 6px 12px;
        font-size: 0.9rem;
      }
    }
  `;
  document.head.appendChild(styleElement);
  
  // Get modal elements
  const lineupModal = document.getElementById('lineup-modal');
  const modalTitle = document.getElementById('lineup-modal-title');
  const lineupTabs = document.getElementById('lineup-tabs');
  const lineupImages = document.getElementById('lineup-images');
  const closeButton = lineupModal.querySelector('.modal-close');
  const overlay = lineupModal.querySelector('.modal-overlay');
  
  // Festival lineup data - Define which festivals have lineups and their image paths
  const festivalLineups = {
    "Wavy": {
      days: ["Main Lineup"],
      images: ["/images/lineups/lineup-placeholder.png"]
    },
    "DGTL": {
      days: ["Day 1", "Day 2"],
      images: ["/images/lineups/dgtlzaterdag.png", "/images/lineups/dgtlzondag.png"]
    },
    "Awakenings Festival": {
      days: ["Day 1", "Day 2", "Day 3"],
      images: ["/images/lineups/awakeningsvrijdag.png", "/images/lineups/awakeningszaterdag.png", "/images/lineups/awakeningszondag.png"]
    },
    "Tomorrowland": {
      days: ["Weekend 1", "Weekend 2"],
      images: ["/images/lineups/tomorrowland-w1.png", "/images/lineups/lineup-placeholder.png"]
    },
    "Mystic Garden Festival": {
      days: ["Main Lineup"],
      images: ["/images/lineups/mysticgarden.png"]
    },
    "Loveland": {
      days: ["Day 1", "Day 2"],
      images: ["/images/lineups/lovelandzaterdag.png", "/images/lineups/lovelandzondag.png"]
    },
    "Mysteryland": {
      days: ["Day 1", "Day 2"],
      images: ["/images/lineups/mysterylandzaterdag.png", "/images/lineups/mysterylandzondag.png"]
    },
    "Free your mind Kingsday": {
      days: ["Main Lineup"],
      images: ["/images/lineups/freeyourmindkingsday.png"]
  },
  "Loveland Kingsday": {
    days: ["Main Lineup"],
    images: ["/images/lineups/lovelandkingsday.png"]
  },
  "Verbond" : {
    days: ["Main Lineup"],
    images: ["/images/lineups/lineup-placeholder.png"]
  },
  "Music On" : {
    days: ["main lineup"],
    images: ["/images/lineups/musicon.png"]
  },
  "Awakenings Upclose" : {
    days: ["main lineup"],
    images: ["/images/lineups/awakeningsupclose.png"]
  },
  "PIV" : {
    days: ["main lineup"],
    images: ["/images/lineups/lineup-placeholder.png"]
  },
  "Soenda" : {
    days: ["main lineup"],
    images: ["/images/lineups/soenda.png"]
  },
  "Toffler" : {
    days: ["main lineup"],
    images: ["/images/lineups/toffler.png"]
  },
  "909" : {
    days: ["day 1", "day 2"],
    images: ["/images/lineups/909zaterdag.png", "/images/lineups/909zondag.png"]
  },
  "Diynamic" : {
    days: ["main lineup"],
    images: ["/images/lineups/diynamic.png"]
  },
  "Open Air" : {
    days: ["main lineup"],
    images: ["/images/lineups/openair.png"]
  },
  "Vunzige Deuntjes" : {
    days: ["main lineup"],
    images: ["/images/lineups/vunzigedeuntjes.png"]
  },
  "KeineMusik" : { 
    days: ["main lineup"], 
    images: ["/images/lineups/lineup-placeholder.png"]
  },
  "Boothstock Festival" : {
    days: ["main lineup"],
    images: ["/images/lineups/boothstock.png"]
  },
  "No Art" : {
    days: ["main lineup"],
    images: ["/images/lineups/lineup-placeholder.png"]
  },
  "Strafwerk" : { 
    days: ["main lineup"],
    images: ["/images/lineups/lineup-placeholder.png"]
  },
  "Latin Village" : { 
    days: ["main lineup"],  
    images: ["/images/lineups/lineup-placeholder.png"]
  },
  "Parels van de stad" : {
    days: ["main lineup"],
    images: ["/images/lineups/lineup-placeholder.png"]
  },
  "Into the woods" : {
    days: ["main lineup"],
    images: ["/images/lineups/lineup-placeholder.png"]
  },
  "Free Your Mind" : {
    days: ["main lineup"],
    images: ["/images/lineups/freeyourmind.png"]
  },
  };


  
  // Function to add lineup icons to festival names
  function addLineupIcons() {
    // Get all festival name links
    const festivalLinks = document.querySelectorAll('.festival-link');
    
    festivalLinks.forEach(link => {
      const festivalName = link.getAttribute('data-name');
      
      // Check if this festival has lineup data
      if (festivalLineups[festivalName]) {
        // Create lineup icon
        const lineupIcon = document.createElement('span');
        lineupIcon.className = 'lineup-icon';
        lineupIcon.innerHTML = '🎵'; // Music note emoji
        lineupIcon.title = 'View Lineup';
        lineupIcon.setAttribute('data-festival', festivalName);
        
        // Add click event to show lineup modal
        lineupIcon.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          showLineupModal(festivalName);
        });
        
        // Insert icon after festival name
        link.parentNode.insertBefore(lineupIcon, link.nextSibling);
      }
    });
    
    // Also add icons to card view
    setTimeout(() => {
      const cardFestivalNames = document.querySelectorAll('.festival-card .festival-name a');
      
      cardFestivalNames.forEach(link => {
        const festivalName = link.getAttribute('data-name');
        
        // Check if this festival has lineup data and doesn't already have an icon
        if (festivalLineups[festivalName] && !link.parentNode.querySelector('.lineup-icon')) {
          // Create lineup icon
          const lineupIcon = document.createElement('span');
          lineupIcon.className = 'lineup-icon';
          lineupIcon.innerHTML = '🎵'; // Music note emoji
          lineupIcon.title = 'View Lineup';
          lineupIcon.setAttribute('data-festival', festivalName);
          
          // Add click event to show lineup modal
          lineupIcon.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            showLineupModal(festivalName);
          });
          
          // Insert icon after festival name
          link.parentNode.insertBefore(lineupIcon, link.nextSibling);
        }
      });
    }, 500); // Delay to ensure card view is loaded
  }
  
  // Current zoom level and active image reference
  let currentZoom = 1;
  let activeImage = null;

  // Function to show lineup modal
  function showLineupModal(festivalName) {
    console.log(`Showing lineup for ${festivalName}`);
    
    // Reset zoom level
    currentZoom = 1;
    
    // Update modal title
    modalTitle.textContent = `${festivalName} - Lineup`;
    
    // Clear previous content
    lineupTabs.innerHTML = '';
    lineupImages.innerHTML = '<div class="loading-indicator">Loading lineup...</div>';
    
    // Show the modal
    lineupModal.classList.remove('hidden');
    
    // Check if lineup data exists for this festival
    if (!festivalLineups[festivalName]) {
      lineupImages.innerHTML = '<div class="no-lineup">No lineup information available for this festival.</div>';
      return;
    }
    
    const lineup = festivalLineups[festivalName];
    
    // Create day tabs if there are multiple days
    if (lineup.days.length > 1) {
      lineup.days.forEach((day, index) => {
        const tabButton = document.createElement('button');
        tabButton.className = 'day-tab' + (index === 0 ? ' active' : '');
        tabButton.textContent = day;
        tabButton.dataset.index = index;
        
        tabButton.addEventListener('click', function() {
          // Update active tab
          document.querySelectorAll('.day-tab').forEach(tab => tab.classList.remove('active'));
          this.classList.add('active');
          
          // Update active image
          document.querySelectorAll('.lineup-image').forEach(img => img.classList.remove('active'));
          const newActiveImage = document.querySelector(`.lineup-image[data-index="${index}"]`);
          newActiveImage.classList.add('active');
          
          // Reset zoom when changing days
          currentZoom = 1;
          if (newActiveImage) {
            newActiveImage.style.transform = `scale(${currentZoom})`;
            activeImage = newActiveImage;
          }
        });
        
        lineupTabs.appendChild(tabButton);
      });
    } else {
      // Hide tabs section if there's only one day
      lineupTabs.style.display = 'none';
    }
    
    // Clear loading indicator
    lineupImages.innerHTML = '';
    
    // Add images
    lineup.images.forEach((imagePath, index) => {
      const img = document.createElement('img');
      img.className = 'lineup-image' + (index === 0 ? ' active' : '');
      img.dataset.index = index;
      img.alt = `${festivalName} - ${lineup.days[index]} Lineup`;
      
      // Set draggable false to prevent browser drag behavior that could interfere with touch events
      img.draggable = false;
      
      // Enable browser pinch-to-zoom
      img.style.touchAction = "pinch-zoom";
      
      // Use a placeholder image URL since we don't have actual lineup images
      // In production, you would use the actual image path
      img.src = imagePath;
      
      // Handle image loading error
      img.onerror = function() {
        this.src = "/images/lineup-placeholder.png";
        this.alt = "Lineup image not available";
        this.style.opacity = "0.7";
      };
      
      // Store reference to active image
      if (index === 0) {
        activeImage = img;
      }
      
      lineupImages.appendChild(img);
    });
    
    // Add zoom buttons container
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    
    // Add zoom-out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'zoom-btn';
    zoomOutBtn.textContent = '−';
    zoomOutBtn.title = 'Zoom Out';
    zoomOutBtn.addEventListener('click', () => {
      if (currentZoom > 0.5) {
        currentZoom -= 0.25;
        if (activeImage) {
          activeImage.style.transform = `scale(${currentZoom})`;
        }
      }
    });
    
    // Add zoom reset button
    const zoomResetBtn = document.createElement('button');
    zoomResetBtn.className = 'zoom-btn';
    zoomResetBtn.textContent = '↺';
    zoomResetBtn.title = 'Reset Zoom';
    zoomResetBtn.addEventListener('click', () => {
      currentZoom = 1;
      if (activeImage) {
        activeImage.style.transform = `scale(${currentZoom})`;
        // Reset scroll position to center
        lineupImages.scrollLeft = 0;
        lineupImages.scrollTop = 0;
      }
    });
    
    // Add zoom-in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'zoom-btn';
    zoomInBtn.textContent = '+';
    zoomInBtn.title = 'Zoom In';
    zoomInBtn.addEventListener('click', () => {
      if (currentZoom < 3) {
        currentZoom += 0.25;
        if (activeImage) {
          activeImage.style.transform = `scale(${currentZoom})`;
        }
      }
    });
    
    // Add buttons to controls
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomResetBtn);
    zoomControls.appendChild(zoomInBtn);
    
    // Add controls after images
    lineupImages.parentNode.insertBefore(zoomControls, lineupImages.nextSibling);
    
    // Show tabs if they were hidden
    lineupTabs.style.display = lineup.days.length > 1 ? 'flex' : 'none';
    
    // Set up image touch events for mobile
    setupImageTouchEvents();
  }
  
  // Function to set up touch events for image panning
  function setupImageTouchEvents() {
    let startX, startY;
    let isDragging = false;
    
    lineupImages.addEventListener('touchstart', function(e) {
      // Only if we're zoomed in
      if (currentZoom > 1) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        isDragging = true;
      }
    }, { passive: true });
    
    lineupImages.addEventListener('touchmove', function(e) {
      // Only if we're zoomed in and dragging
      if (currentZoom > 1 && isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        // Update scroll position
        lineupImages.scrollLeft -= deltaX;
        lineupImages.scrollTop -= deltaY;
        
        // Update start positions
        startX = touch.clientX;
        startY = touch.clientY;
      }
    }, { passive: true });
    
    lineupImages.addEventListener('touchend', function() {
      isDragging = false;
    }, { passive: true });
  }
  
  // Close modal function
  function closeModal() {
    lineupModal.classList.add('hidden');
    
    // Reset zoom when closing modal
    currentZoom = 1;
    if (activeImage) {
      activeImage.style.transform = `scale(1)`;
    }
    
    // Remove any zoom controls
    const zoomControls = document.querySelector('.zoom-controls');
    if (zoomControls) {
      zoomControls.remove();
    }
  }
  
  // Close modal event listeners
  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !lineupModal.classList.contains('hidden')) {
      closeModal();
    }
  });
  
  // Initial call to add lineup icons
  addLineupIcons();
  
  // Setup a mutation observer to add icons to dynamically created elements
  const observer = new MutationObserver(function(mutations) {
    let shouldAddIcons = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any of the added nodes or their children are festival links
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            if ((node.classList && (node.classList.contains('festival-link') || 
                node.classList.contains('festival-card'))) ||
                node.querySelector && (node.querySelector('.festival-link') || 
                node.querySelector('.festival-card'))) {
              shouldAddIcons = true;
            }
          }
        });
      }
    });
    
    if (shouldAddIcons) {
      // Add a slight delay to ensure the DOM is fully updated
      setTimeout(addLineupIcons, 100);
    }
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
});
