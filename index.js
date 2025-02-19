// index.js

require('dotenv').config(); // Als je .env-variabelen wilt gebruiken
const express = require('express');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

// 1) Maak de Express-app
const app = express();
const port = process.env.PORT || 3000;

// 2) Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3) Connectie met Neon (Postgres)
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  /*
  // Als je SSL nodig hebt:
  ssl: {
    rejectUnauthorized: false
  }
  */
});
client
  .connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch(err => console.error('Connection error', err.stack));

// 4) Statische bestanden uit ./agenda map
app.use(express.static(path.join(__dirname, 'agenda')));

// 5) HTML-routes (optioneel)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'agenda.html'));
});
app.get('/reviews.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'reviews.html'));
});
app.get('/extra-info.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'extra-info.html'));
});
app.get('/mijn-festivals.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'mijn-festivals.html'));
});
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'register.html'));
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'login.html'));
});

// 6) POST /register => gebruiker registreren
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      [email, hashed]
    );
    res.send('Registration successful! You can now log in.');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Registration failed.');
  }
});

// 7) POST /login => gebruiker inloggen
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password');
    }

    // Gelukt
    res.send(`Welcome ${email}, you are logged in!`);
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Login failed.');
  }
});

// 8) POST /attend => gebruiker meldt zich aan voor festival
app.post('/attend', async (req, res) => {
  try {
    const { email, festival } = req.body;
    if (!email || !festival) {
      return res.status(400).json({ message: 'Missing email or festival' });
    }
    await client.query(
      `INSERT INTO attendances (user_email, festival_name)
       VALUES ($1, $2)
       ON CONFLICT (user_email, festival_name) DO NOTHING`,
      [email, festival]
    );
    res.json({ message: `You are attending ${festival}!` });
  } catch (err) {
    console.error('Error in /attend:', err);
    res.status(500).json({ message: 'Could not attend festival.' });
  }
});

// 9) DELETE /attend => gebruiker meldt zich af voor festival
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
    res.json({ message: `You are no longer attending ${festival}.` });
  } catch (err) {
    console.error('Error in DELETE /attend:', err);
    res.status(500).json({ message: 'Could not unattend festival.' });
  }
});

// 10) GET /my-festivals => lijst van festivals voor deze gebruiker
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

    res.json({ festivals });
  } catch (err) {
    console.error('Error in /my-festivals:', err);
    res.status(500).json({ message: 'Could not get user festivals' });
  }
});

// 11) GET /festival-attendees => lijst van users bij een festival
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

    res.json({ festival, attendees });
  } catch (err) {
    console.error('Error in /festival-attendees:', err);
    res.status(500).json({ message: 'Could not get attendees' });
  }
});

// 12) Server starten
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// ============== NIEUWE AANPASSINGEN: RATING FUNCTIONALITEIT ==============

// 13) POST /rating => gebruiker geeft cijfer (1–10) aan een festival
// 

app.post('/rating', async (req, res) => {
  try {
    const { email, festival, rating } = req.body;
    if (!email || !festival || rating == null) {
      return res.status(400).json({ message: 'Missing rating data' });
    }

    // Check dat rating tussen 1 en 10 ligt (optioneel)
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 1 and 10' });
    }

    // Upsert in de tabel 'ratings'
    await client.query(
      `INSERT INTO ratings (user_email, festival_name, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_email, festival_name)
       DO UPDATE SET rating = EXCLUDED.rating`,
      [email, festival, rating]
    );

    res.json({ message: `Rating ${rating} saved for festival ${festival}` });
  } catch (err) {
    console.error('Error in POST /rating:', err);
    res.status(500).json({ message: 'Could not save rating' });
  }
});

// 14) GET /rating => haal gemiddelde rating (en evt. alle ratings) op
// Voorbeeld: GET /rating?festival=DGTL
app.get('/rating', async (req, res) => {
  try {
    const fest = req.query.festival;
    if (!fest) {
      return res.status(400).json({ message: 'No festival provided' });
    }

    // Haal gemiddelde op
    const avgResult = await client.query(
      'SELECT AVG(rating) as avg_rating FROM ratings WHERE festival_name=$1',
      [fest]
    );
    const average = avgResult.rows[0].avg_rating;

    // Eventueel ook alle individuele ratings ophalen:
    const allResult = await client.query(
      'SELECT user_email, rating FROM ratings WHERE festival_name=$1',
      [fest]
    );
    const allRatings = allResult.rows; // [{ user_email, rating }, ...]

    res.json({
      festival: fest,
      averageRating: average,   // kan null zijn als nog geen ratings
      ratings: allRatings
    });
  } catch (err) {
    console.error('Error in GET /rating:', err);
    res.status(500).json({ message: 'Could not get rating' });
  }
  
});

