// index.js
const express = require('express');
const path = require('path');
app.use('/styling', express.static(path.join(__dirname, 'styling')));
const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config(); // if using .env locally

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to Postgres
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client
  .connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch((err) => console.error('Connection error', err.stack));

// Serve all static files inside "agenda" folder
app.use(express.static('agenda'));

// ============== ROUTES ==============

// [1] GET / => Serve the main page (agenda.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'agenda.html'));
  res.sendFile(path.join(__dirname, 'agenda', 'reviews.html'));
  res.sendFile(path.join(__dirname, 'agenda', 'extra-info.html'));
  res.sendFile(path.join(__dirname, 'agenda', 'register.html'));
  res.sendFile(path.join(__dirname, 'agenda', 'login.html'));
});

// [2] POST /register => Handle registration
app.post('/register', async (req, res) => {
  try {
    // Haal de juiste velden uit req.body
    const { email, password } = req.body;

    // Wachtwoord hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // In de database opslaan
    await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );

    return res.send('Registration successful! You can now log in.');
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).send('Registration failed.');
  }
});

// [3] POST /login => Handle login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Zoeken in de database
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Wachtwoord vergelijken met bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password');
    }

    // Gelukt
    return res.send(`Welcome ${email}, you are logged in!`);
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send('Login failed.');
  }
});


// [4] Start server locally
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});