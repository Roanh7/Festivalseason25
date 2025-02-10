// api/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const pool = require('./db');

// Middleware voor sessies
router.use(session({
  secret: process.env.SESSION_SECRET || 'secretKey123',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // 24 uur
  }),
  cookie: {
    httpOnly: true,
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000 // 1 dag
  }
}));

// [1] Registreren (optioneel)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password){
    return res.status(400).json({ error: 'Gebruikersnaam/wachtwoord nodig' });
  }
  // check of user al bestaat
  const check = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
  if(check.rows.length > 0){
    return res.status(400).json({ error: 'Gebruiker bestaat al' });
  }
  // hash wachtwoord
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
    [username, hash]
  );
  res.json({ success: true });
});

// [2] Inloggen
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userQuery = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  if(userQuery.rows.length === 0){
    return res.status(401).json({ error: 'Gebruiker niet gevonden' });
  }
  const user = userQuery.rows[0];
  // check wachtwoord
  const match = await bcrypt.compare(password, user.password_hash);
  if(!match){
    return res.status(401).json({ error: 'Verkeerd wachtwoord' });
  }

  // Sessie vullen
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ success: true, message: 'Ingelogd' });
});

// [3] Uitloggen
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Uitgelogd' });
  });
});

// [4] Check of je ingelogd bent (frontend kan deze endpoint aanroepen)
router.get('/me', (req, res) => {
  if(!req.session.userId){
    return res.status(401).json({ error: 'Niet ingelogd' });
  }
  // Anders
  res.json({
    userId: req.session.userId,
    username: req.session.username
  });
});

module.exports = router;