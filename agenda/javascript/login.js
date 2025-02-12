// login.js

// 1. Wacht tot de DOM geladen is, zodat elementen bestaan
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const resultDiv = document.getElementById('loginResult');

  // 2. Vang de submit-event van het formulier
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // voorkom echte form-submission

    // 3. Haal email & password uit de inputvelden
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 4. Verstuur een POST-request naar /login met JSON
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // credentials: 'include' als je cookies/sessies gebruikt
        body: JSON.stringify({ email, password })
      });

      // 5. Lees de tekst van de server (bijv. 'Welcome <email>')
      const text = await response.text();

      if (response.ok) {
        // Succesvol ingelogd
        resultDiv.style.color = 'green';
        resultDiv.textContent = text;

        // Eventueel doorverwijzen:
        // window.location.href = 'mijn-festivals.html';
      } else {
        // Fout, bijv. 401 (verkeerde login) of 500 (server-error)
        resultDiv.style.color = 'red';
        resultDiv.textContent = `Fout: ${text}`;
      }
    } catch (err) {
      console.error('Error:', err);
      resultDiv.style.color = 'red';
      resultDiv.textContent = 'Er is een fout opgetreden bij het inloggen.';
    }
  });
});