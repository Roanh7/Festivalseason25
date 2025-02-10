// index.js
const express = require('express');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Load .env if you have one

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client
  .connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch((err) => console.error('Connection error', err.stack));

// Serve all files in the "agenda" folder as static
app.use(express.static('agenda'));

// ------------- ROUTES -------------

// 1) Main route => serve the main "agenda.html"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'agenda.html'));
});

// 2) GET /login => serve login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'login.html'));
});

// 3) GET /register => serve register.html
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'register.html'));
});

// 4) POST /register => handle registration logic
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
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

// 5) POST /login => handle login logic
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      // user not found
      return res.status(401).send('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Compare password with bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password');
    }

    // If everything matches, you’re logged in
    return res.send(`Welcome ${email}, you are logged in!`);
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send('Login failed.');
  }
});

// Start the server locally
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});