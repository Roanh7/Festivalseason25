// account.js - Handle user account settings

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const notLoggedInSection = document.getElementById('not-logged-in');
  const accountContainer = document.getElementById('account-container');
  const userEmailDisplay = document.getElementById('userEmail');
  const currentUsernameDisplay = document.getElementById('currentUsername');
  const usernameForm = document.getElementById('usernameForm');
  const usernameInput = document.getElementById('username');
  const updateResult = document.getElementById('updateResult');

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  if (!token || !email) {
    // User is not logged in
    notLoggedInSection.classList.remove('hidden');
    accountContainer.classList.add('hidden');
    return;
  }

  // User is logged in - show account container and hide not-logged-in message
  notLoggedInSection.classList.add('hidden');
  accountContainer.classList.remove('hidden');
  
  // Display the user's email
  userEmailDisplay.textContent = email;
  
  // Fetch the current username if it exists
  try {
    const response = await fetch(`/username?email=${encodeURIComponent(email)}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.username) {
        currentUsernameDisplay.textContent = data.username;
        // Pre-fill the input with current username
        usernameInput.value = data.username;
      }
    } else {
      console.error('Failed to fetch username');
    }
  } catch (error) {
    console.error('Error fetching username:', error);
  }

  // Handle form submission
  usernameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newUsername = usernameInput.value.trim();
    
    if (!newUsername) {
      showMessage('Voer een geldige gebruikersnaam in.', 'error');
      return;
    }
    
    try {
      const response = await fetch('/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          username: newUsername
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        showMessage(`Gebruikersnaam succesvol bijgewerkt naar "${newUsername}"!`, 'success');
        currentUsernameDisplay.textContent = newUsername;
      } else {
        const errorText = await response.text();
        showMessage(`Er is iets misgegaan: ${errorText}`, 'error');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      showMessage('Er is een fout opgetreden bij het bijwerken van je gebruikersnaam.', 'error');
    }
  });

  // Helper function to show messages
  function showMessage(message, type) {
    updateResult.textContent = message;
    updateResult.className = 'info-message'; // Reset classes
    
    if (type === 'success') {
      updateResult.classList.add('success');
    } else if (type === 'error') {
      updateResult.classList.add('error');
    }
  }
});