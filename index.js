// index.js

require('dotenv').config(); // Als je .env lokaal gebruikt
const express = require('express');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

// 1) Maak de Express-app
const app = express();
const port = process.env.PORT || 3000;

// 2) Middleware om form-data (POST) te kunnen verwerken
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3) PostgreSQL-connectie maken
//    LET OP: Als jouw Neon-URL nog geen sslmode=require heeft, zet dan ssl: { rejectUnauthorized: false } er expliciet bij.
//    Hieronder zie je dat in commentaar. Gebruik het als je een SSL-foutmelding krijgt.
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  /*
  ssl: {
    rejectUnauthorized: false,
  },
  */
});

client
  .connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch((err) => console.error('Connection error', err.stack));

// 4) Alle bestanden in de map "agenda" statisch serveren
app.use(express.static(path.join(__dirname, 'agenda')));

// 5) Root-route: bij bezoek aan "/" sturen we agenda.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'agenda.html'));
});

// 6) Aparte GET-routes voor de overige HTML-pagina's
app.get('/reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'reviews.html'));
});

app.get('/extra-info', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'extra-info.html'));
});

app.get('/mijn-festivals', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'mijn-festivals.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'login.html'));
});

// 7) POST /register => gebruikersregistratie
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Wachtwoord hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nieuwe gebruiker in de database zetten
    await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [
      email,
      hashedPassword,
    ]);

    res.send('Registration successful! You can now log in.');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Registration failed.');
  }
});

// 8) POST /login => gebruikerslogin
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check of user bestaat
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = userResult.rows[0];
    // Wachtwoord vergelijken
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password');
    }

    // Gelukt!
    res.send(`Welcome ${email}, you are logged in!`);
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Login failed.');
  }
});

// 9) Server starten
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});