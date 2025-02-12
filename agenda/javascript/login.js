// login.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const resultDiv = document.getElementById('loginResult');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Haal email & password uit de velden
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // 2. Verstuur POST naar /login
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // 3. Lees de responsetekst (bijv. "Welcome roan@example.com, you are logged in!")
      const text = await response.text();

      if (response.ok) {
        // 4. Login succesvol
        resultDiv.style.color = 'green';
        resultDiv.textContent = text;

        // 5. Sla de 'token' en 'email' op in localStorage
        //    Zodat navStatus.js op andere pagina's "Hallo, email" kan tonen
        localStorage.setItem('token', 'fake123'); 
        localStorage.setItem('email', email);

        // 6. Eventueel doorverwijzen naar andere pagina
        // window.location.href = 'agenda.html';

      } else {
        // 4b. Login fout (401, 500, etc.)
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