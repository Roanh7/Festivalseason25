const express = require('express');
const { Client } = require('pg');  // pg client

// Environment variables from .env (Optional if you want local environment support)
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data (for login form submissions)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL client setup
const client = new Client({
  connectionString: process.env.DATABASE_URL,  // We'll set this on Vercel
});
client.connect()
  .then(() => console.log('Connected to Postgres!'))
  .catch((err) => console.error('Connection error', err.stack));

// Simple Home Route
app.get('/', (req, res) => {
  res.send(`<h1>Welcome</h1>
    <p>Go to <a href="/login">/login</a> to log in.</p>
  `);
});

// Login Page (GET)
app.get('/login', (req, res) => {
  // A simple HTML form for demonstration
  const form = `
    <h1>Login</h1>
    <form action="/login" method="POST">
      <label>Email:</label>
      <input type="text" name="email" required />
      <br />
      <label>Password:</label>
      <input type="password" name="password" required />
      <br />
      <button type="submit">Login</button>
    </form>
  `;
  res.send(form);
});

// Login Handler (POST)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the database for a user with the given email
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      // No user found
      return res.status(401).send('Invalid email or password!');
    }

    const user = userResult.rows[0];

    // For a real app, you would compare hashed passwords using bcrypt.compare
    if (user.password !== password) {
      return res.status(401).send('Invalid email or password!');
    }

    // If password matches
    return res.send(`Welcome, ${user.email}! You have successfully logged in.`);
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Start the server locally
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});