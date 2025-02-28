require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Postgres‐client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('Connected to Postgres');
  })
  .catch((err) => {
    console.error('Connection error', err.stack);
  });

// ----------------------
//  Bestaande routes
// ----------------------

app.get('/', (req, res) => {
  // Bijv. de agenda‐pagina als “home”
  res.sendFile(__dirname + '/public/agenda.html');
});

app.get('/agenda', (req, res) => {
  res.sendFile(__dirname + '/public/agenda.html');
});

app.get('/extra-info', (req, res) => {
  res.sendFile(__dirname + '/public/extra-info.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/mijn-festivals', (req, res) => {
  res.sendFile(__dirname + '/public/mijn-festivals.html');
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Login succesvol; sla user in sessie op
    req.session.user = user.email;
    res.send({ message: 'Logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: 'Missing email or password' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );
    res.send({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error registering user' });
  }
});

// Opvragen wie naar welke festivals gaat
app.get('/attendances', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM attendances');
    res.send(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Could not get attendances' });
  }
});

// User attend festival
app.post('/attend-festival', async (req, res) => {
  try {
    const { user_email, festival_name } = req.body;
    if (!user_email || !festival_name) {
      return res.status(400).send({ message: 'Missing email or festival name' });
    }

    // check of user al aanwezig is
    const checkResult = await client.query(
      'SELECT * FROM attendances WHERE user_email = $1 AND festival_name = $2',
      [user_email, festival_name]
    );
    if (checkResult.rows.length > 0) {
      return res.status(409).send({ message: 'User already attending this festival' });
    }

    await client.query(
      'INSERT INTO attendances (user_email, festival_name) VALUES ($1, $2)',
      [user_email, festival_name]
    );
    res.send({ message: 'User is now attending festival' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Could not attend festival' });
  }
});

// Alle festivals van ingelogde user
app.get('/myfestivals', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send({ message: 'Not logged in' });
  }
  try {
    const result = await client.query(
      'SELECT festival_name FROM attendances WHERE user_email = $1',
      [req.session.user]
    );
    res.send(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Could not retrieve your festivals' });
  }
});

// (optioneel) festival-details
app.get('/festival-details/:festivalName', async (req, res) => {
  // Voorbeeld: nog niet geïmplementeerd
  res.send({ message: 'Not implemented' });
});

// ----------------------
// Route om nieuwe festivals te maken (met datum) - STAP 3
// ----------------------
app.post('/create-festival', async (req, res) => {
  try {
    // evt. check of alleen ingelogde gebruikers dit mogen
    if (!req.session.user) {
      return res.status(401).send({ message: 'Not logged in' });
    }

    const { festival_name, festival_date } = req.body;
    if (!festival_name || !festival_date) {
      return res.status(400).send({ message: 'Missing festival name or date' });
    }

    await client.query(
      'INSERT INTO festivals (name, festival_date) VALUES ($1, $2)',
      [festival_name, festival_date]
    );
    res.send({ message: 'Festival created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Could not create festival' });
  }
});

// ----------------------
//  STAP 2: Reviews (met stap 3-filter)
// ----------------------

// POST: creeër of update een rating
app.post('/api/reviews', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send({ message: 'Not logged in' });
  }

  try {
    const user_email = req.session.user; // e-mail uit de sessie
    const { festival_name, rating } = req.body;

    if (!festival_name || !rating) {
      return res.status(400).send({ message: 'Missing festival_name or rating' });
    }
    if (rating < 1 || rating > 10) {
      return res.status(400).send({ message: 'Rating must be between 1 and 10' });
    }

    // check of user al een review heeft
    const checkQuery = 'SELECT * FROM reviews WHERE user_email = $1 AND festival_name = $2';
    const checkResult = await client.query(checkQuery, [user_email, festival_name]);

    if (checkResult.rows.length > 0) {
      // update
      await client.query(
        'UPDATE reviews SET rating = $1 WHERE user_email = $2 AND festival_name = $3',
        [rating, user_email, festival_name]
      );
      return res.send({ message: 'Rating updated' });
    } else {
      // insert
      await client.query(
        'INSERT INTO reviews (user_email, festival_name, rating) VALUES ($1, $2, $3)',
        [user_email, festival_name, rating]
      );
      return res.send({ message: 'Rating created' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error saving review' });
  }
});

// GET: alle festivals (die de user heeft) + eigen rating + gemiddelde
// Filter: alleen festivals in het verleden
app.get('/api/reviews/user', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send({ message: 'Not logged in' });
  }

  try {
    const userEmail = req.session.user;
    const query = `
      SELECT
        a.festival_name,
        f.festival_date,
        COALESCE(r.rating, 0) AS user_rating,
        COALESCE(avg_table.avg_rating, 0) AS avg_rating
      FROM attendances a
      JOIN festivals f
        ON a.festival_name = f.name
      LEFT JOIN reviews r
        ON r.festival_name = a.festival_name
       AND r.user_email = a.user_email
      LEFT JOIN (
        SELECT festival_name, AVG(rating) AS avg_rating
        FROM reviews
        GROUP BY festival_name
      ) as avg_table
        ON avg_table.festival_name = a.festival_name
      WHERE a.user_email = $1
        AND f.festival_date < CURRENT_DATE
    `;
    const result = await client.query(query, [userEmail]);
    res.send(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Could not retrieve user reviews' });
  }
});

// GET: ranking van alle festivals op basis van gemiddelde rating
// STAP 4: filter = alleen festivals in het verleden
app.get('/api/reviews/ranking', async (req, res) => {
  try {
    const rankingQuery = `
      SELECT r.festival_name,
             f.festival_date,
             COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as average_rating
      FROM reviews r
      JOIN festivals f 
        ON r.festival_name = f.name
      WHERE f.festival_date < CURRENT_DATE   -- << Hier filteren we alleen al voorbij
      GROUP BY r.festival_name, f.festival_date
      ORDER BY average_rating DESC
    `;
    const r = await client.query(rankingQuery);
    res.send(r.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Could not retrieve festival ranking' });
  }
});

// ----------------------
//  Server start
// ----------------------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});