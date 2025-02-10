// api/festivals.js
const express = require('express');
const router = express.Router();
const pool = require('./db');

// Middleware om te checken of user ingelogd is
function requireAuth(req, res, next) {
  if(!req.session.userId){
    return res.status(401).json({ error: 'Niet ingelogd' });
  }
  next();
}

// [1] Alle festivals opvragen (voor agenda.html)
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM festivals ORDER BY date');
  res.json(result.rows);
});

// [2] Je eigen festivals (mijn-festivals)
router.get('/my', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const query = `
    SELECT f.id, f.name, f.date
    FROM user_festivals uf
    JOIN festivals f ON uf.festival_id = f.id
    WHERE uf.user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  res.json(result.rows);
});

// [3] Ander endpoint: wie gaat er nog meer naar festival X?
router.get('/:festivalId/attendees', requireAuth, async (req, res) => {
  const festivalId = req.params.festivalId;
  const query = `
    SELECT u.username
    FROM user_festivals uf
    JOIN users u ON uf.user_id = u.id
    WHERE uf.festival_id = $1
  `;
  const result = await pool.query(query, [festivalId]);
  // map naar lijst van usernames
  const attendees = result.rows.map(r => r.username);
  res.json(attendees);
});

// [4] Checkbox aanklikken: user wil festival “attenden”
router.post('/my', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { festivalId } = req.body;
  
  // Check of al bestaat
  const check = await pool.query(
    'SELECT id FROM user_festivals WHERE user_id=$1 AND festival_id=$2',
    [userId, festivalId]
  );
  if(check.rows.length > 0){
    return res.json({ success: false, message: 'Al aanwezig' });
  }

  await pool.query(
    'INSERT INTO user_festivals (user_id, festival_id) VALUES ($1, $2)',
    [userId, festivalId]
  );
  res.json({ success: true });
});

// [5] Checkbox uitvinken: verwijderen
router.delete('/my/:festivalId', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const festivalId = req.params.festivalId;

  await pool.query(
    'DELETE FROM user_festivals WHERE user_id=$1 AND festival_id=$2',
    [userId, festivalId]
  );
  res.json({ success: true });
});

module.exports = router;