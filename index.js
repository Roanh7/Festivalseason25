/************************************************
 * index.js
 ************************************************/
require('dotenv').config(); // als je een .env gebruikt
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Sessie/cookie
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const app = express();
const port = process.env.PORT || 3000;

/************************************************
 * 1. DATABASE-CONNECTIE (Pool)
 ************************************************/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // nodig voor de meeste Neon setups
  }
});

pool
  .connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch((err) => console.error('Connection error', err.stack));

/************************************************
 * 2. MIDDLEWARE
 ************************************************/
// Body-parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessie-middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'geheim',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({ checkPeriod: 86400000 }), // 24 uur
    cookie: {
      httpOnly: true,
      secure: false, // op https => true
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// Statische bestanden uit map "agenda" (daar staan je .html, .css, etc.)
app.use(express.static('agenda'));

/************************************************
 * 3. ROUTES - HTML-pagina's
 ************************************************/
// GET / => agenda.html (hoofdpagina)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'agenda.html'));
});

// GET /login => login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'login.html'));
});

// GET /register => register.html
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'register.html'));
});

// GET /mijn-festivals => mijn-festivals.html
app.get('/mijn-festivals', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'mijn-festivals.html'));
});

// GET /reviews => reviews.html (als je die hebt)
app.get('/reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'reviews.html'));
});

// GET /extra-info => extra-info.html (als je die hebt)
app.get('/extra-info', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'extra-info.html'));
});

/************************************************
 * 4. AUTHENTICATIE-ROUTES
 ************************************************/
// POST /register => nieuwe user aanmaken
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send('Missing email or password');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert in DB
    await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );

    return res.send('Registration successful! You can now log in.');
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).send('Registration failed.');
  }
});

// POST /login => check user + sla in sessie op
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send('Missing email or password');
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password');
    }

    // Als match, sla in sessie
    req.session.userId = user.id;
    req.session.email = user.email;

    return res.send(`Welcome ${email}, you are logged in!`);
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send('Login failed.');
  }
});

// GET /auth/me => check of ingelogd
app.get('/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  return res.json({
    userId: req.session.userId,
    email: req.session.email
  });
});

// POST /logout => sessie weg
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err) {
      console.error('Error destroying session:', err);
    }
    res.send('Logged out!');
  });
});

/************************************************
 * 5. FESTIVALS-ROUTES
 ************************************************/
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).send('Not logged in');
  }
  next();
}

// GET /festivals => alle festivals
app.get('/festivals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM festivals ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching festivals');
  }
});

// GET /festivals/my => de festivals van de ingelogde user
app.get('/festivals/my', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const query = `
      SELECT f.*
      FROM user_festivals uf
      JOIN festivals f ON uf.festival_id = f.id
      WHERE uf.user_id = $1
      ORDER BY f.id
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching your festivals');
  }
});

// POST /festivals/my => voeg festival toe (als user checkbox aanvinkt)
app.post('/festivals/my', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { festivalId } = req.body;

    // Check of user_festival al bestaat
    const check = await pool.query(
      'SELECT id FROM user_festivals WHERE user_id = $1 AND festival_id = $2',
      [userId, festivalId]
    );
    if (check.rows.length > 0) {
      return res.status(400).send('Festival already added');
    }

    // Anders toevoegen
    await pool.query(
      'INSERT INTO user_festivals (user_id, festival_id) VALUES ($1, $2)',
      [userId, festivalId]
    );
    res.send('Festival added!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding festival');
  }
});

// DELETE /festivals/my/:festivalId => verwijder user-festival
app.delete('/festivals/my/:festivalId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const festivalId = req.params.festivalId;

    await pool.query(
      'DELETE FROM user_festivals WHERE user_id = $1 AND festival_id = $2',
      [userId, festivalId]
    );

    res.send('Festival removed');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error removing festival');
  }
});

/************************************************
 * 6. SERVER STARTEN
 ************************************************/
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});