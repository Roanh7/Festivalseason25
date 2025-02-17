// index.js

require('dotenv').config(); // Om .env-variabelen in te laden (DATABASE_URL, etc.)
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

// 3) PostgreSQL-connectie maken (Neon)
//    Let op: zorg dat je .env de juiste DATABASE_URL heeft, bv:
//    DATABASE_URL = "postgres://user:password@host:port/dbname?sslmode=require"
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  // Als ssl niet automatisch wordt afgedwongen, uncomment dan onderstaande:
  /*
  ssl: {
    rejectUnauthorized: false
  }
  */
});

client
  .connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch((err) => console.error('Connection error:', err.stack));

// 4) Serve alle bestanden in de map "agenda" statisch.
//    Dus agenda/agenda.html => http://localhost:3000/agenda.html
//    agenda/javascript/mijn-festivals.js => http://localhost:3000/javascript/mijn-festivals.js
app.use(express.static(path.join(__dirname, 'agenda')));

// 5) Root-route: bij bezoek aan "/" sturen we de agenda-pagina
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'agenda.html'));
});

// 6) Aparte GET-routes voor andere pagina's (optioneel, want je kunt
//    ook direct de statische bestanden gebruiken).
//    Dit is handig als je misschien later 404 checks of auth wilt doen.
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

// 7) POST /register => gebruiker registreren
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Wachtwoord hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // In DB zetten
    await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );

    res.send('Registration successful! You can now log in.');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Registration failed.');
  }
});

// 8) POST /login => gebruiker inloggen
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Zoeken in DB
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Password check
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password');
    }

    // Gelukt! (Hier zou je eventueel een JWT kunnen sturen)
    res.send(`Welcome ${email}, you are logged in!`);
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Login failed.');
  }
});

// ============ FESTIVAL-ENDPOINTS =================

// POST /attend => gebruiker meldt zich aan voor festival
app.post('/attend', async (req, res) => {
  try {
    const { email, festival } = req.body;
    if (!email || !festival) {
      return res.status(400).json({ message: 'Missing email or festival' });
    }

    // In attendances-table zetten (gebruik ON CONFLICT als je
    // UNIQUE constraint op (user_email, festival_name) hebt)
    await client.query(
      `INSERT INTO attendances (user_email, festival_name)
       VALUES ($1, $2)
       ON CONFLICT (user_email, festival_name) DO NOTHING`,
      [email, festival]
    );

    return res.json({ message: `You are attending ${festival}!` });
  } catch (err) {
    console.error('Error in /attend:', err);
    return res.status(500).json({ message: 'Could not attend festival.' });
  }
});

// DELETE /attend => gebruiker meldt zich af voor festival
app.delete('/attend', async (req, res) => {
  try {
    const { email, festival } = req.body;
    if (!email || !festival) {
      return res.status(400).json({ message: 'Missing email or festival' });
    }

    await client.query(
      'DELETE FROM attendances WHERE user_email=$1 AND festival_name=$2',
      [email, festival]
    );
    return res.json({ message: `You are no longer attending ${festival}.` });
  } catch (err) {
    console.error('Error in DELETE /attend:', err);
    return res.status(500).json({ message: 'Could not unattend festival.' });
  }
});

// GET /my-festivals => lijst van festivals die de user bezoekt
app.get('/my-festivals', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'No email provided' });
    }

    const result = await client.query(
      'SELECT festival_name FROM attendances WHERE user_email=$1',
      [userEmail]
    );
    const festivals = result.rows.map(r => r.festival_name);

    return res.json({ festivals });
  } catch (err) {
    console.error('Error in /my-festivals:', err);
    return res.status(500).json({ message: 'Could not get user festivals' });
  }
});

// GET /festival-attendees => lijst van users die dit festival bezoeken
app.get('/festival-attendees', async (req, res) => {
  try {
    const festival = req.query.festival;
    if (!festival) {
      return res.status(400).json({ message: 'No festival provided' });
    }

    const result = await client.query(
      'SELECT user_email FROM attendances WHERE festival_name=$1',
      [festival]
    );
    const attendees = result.rows.map(r => r.user_email);

    return res.json({ festival, attendees });
  } catch (err) {
    console.error('Error in /festival-attendees:', err);
    return res.status(500).json({ message: 'Could not get attendees' });
  }
});

// 9) Server starten
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});