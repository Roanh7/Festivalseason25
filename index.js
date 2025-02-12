// index.js

require('dotenv').config();  // Als je .env-lokaal gebruikt
const express = require('express');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const app = express();                     // <--- Eerst app aanmaken!
const port = process.env.PORT || 3000;

// Als je de map "styling" wilt serveren op /styling
app.use('/styling', express.static(path.join(process.cwd(), 'styling')));

// Middleware om form-data (POST) te kunnen verwerken
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Postgres-connectie instellen
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client
  .connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch((err) => console.error('Connection error', err.stack));

// 1) Alle bestanden in "agenda" statisch serveren
//    Daardoor kun je bijvoorbeeld surfen naar /agenda.html, /reviews.html, etc.
app.use(express.static('agenda'));

// 2) Aparte routes om direct pages te serveren (optioneel)
app.get('/', (req, res) => {
  // Stuur de 'agenda.html' als homepage
  res.sendFile(path.join(__dirname, 'agenda', 'agenda.html'));
});

// Reviews-pagina
app.get('/reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'reviews.html'));
});

// Extra info
app.get('/extra-info', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'extra-info.html'));
});

// Registratieformulier
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'register.html'));
});

// Loginformulier
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'login.html'));
});

// ====== REGISTREREN (POST) ======
app.post('/register', async (req, res) => {
  try {
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

// ====== INLOGGEN (POST) ======
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Opzoeken in de database
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Vergelijk de gehashte wachtwoorden
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password');
    }

    // Succes!
    return res.send(`Welcome ${email}, you are logged in!`);
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send('Login failed.');
  }
});

// ====== SERVER STARTEN ======
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});