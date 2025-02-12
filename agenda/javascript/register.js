// register.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const resultDiv = document.getElementById('registerResult');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Haal de waarden uit de velden
    const emailValue = document.getElementById('email').value;
    const passwordValue = document.getElementById('password').value;

    try {
      // Verstuur AJAX-request via fetch
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue, password: passwordValue })
      });

      const text = await response.text(); // Server stuurt bv. 'Registration successful! ...'
      if (response.ok) {
        resultDiv.style.color = 'green';
      } else {
        resultDiv.style.color = 'red';
      }
      resultDiv.textContent = text;
    } catch (err) {
      console.error('Error:', err);
      resultDiv.style.color = 'red';
      resultDiv.textContent = 'Er is een fout opgetreden.';
    }
  });
});