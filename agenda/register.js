// register.js
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const regUsername = document.getElementById('regUsername').value;
  const regPassword = document.getElementById('regPassword').value;
  const resultDiv = document.getElementById('registerResult');

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regUsername, regPassword })
    });

    const text = await response.text();
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