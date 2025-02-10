// login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const resultDiv = document.getElementById('result');

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const text = await response.text(); // or response.json() if you return JSON
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