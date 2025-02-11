// login.js

// 1. Luister op de klik van de Inloggen-knop
document.getElementById('loginBtn').addEventListener('click', async (e) => {
  e.preventDefault(); // voorkom eventueel form-submit

  // 2. Haal email & password uit de inputvelden
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // 3. Selecteer het divje waar we feedback tonen
  const resultDiv = document.getElementById('loginResult');

  // 4. Doe een fetch POST naar /login
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // belangrijk om sessie-cookie mee te sturen
      body: JSON.stringify({ email, password })
    });

    // Server stuurt (bijv.) text terug. Wil je JSON, gebruik dan response.json()
    const text = await response.text();

    if (response.ok) {
      // Login geslaagd
      resultDiv.style.color = 'green';
      resultDiv.textContent = text;

      // Eventueel direct doorverwijzen naar "mijn-festivals.html":
      // window.location.href = 'mijn-festivals.html';

    } else {
      // Fout (401, 400, 500, etc.)
      resultDiv.style.color = 'red';
      resultDiv.textContent = `Fout: ${text}`;
    }
  } catch (err) {
    console.error('Error:', err);
    resultDiv.style.color = 'red';
    resultDiv.textContent = 'Er is een fout opgetreden bij het inloggen.';
  }
});