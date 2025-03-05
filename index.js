// index.js with email notification system added

require('dotenv').config(); // For loading .env variables
const express = require('express');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const emailService = require('./email-service');
const notificationScheduler = require('./notification-scheduler');

// 1) Create the Express app
const app = express();
const port = process.env.PORT || 3000;

// 2) Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 3) Connect to Neon (Postgres)
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  /*
  // If you need SSL:
  ssl: {
    rejectUnauthorized: false
  }
  */
});

// Connect to database and create tables if needed
client.connect()
  .then(async () => {
    console.log('Connected to Postgres!');
    
    // Create tables if they don't exist
    try {
      // Create users table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create attendances table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS attendances (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          festival_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_email, festival_name)
        );
      `);

      // Create ratings table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS ratings (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          festival_name VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_email, festival_name)
        );
      `);
      
      console.log('Tables checked/created successfully');
      
      // Initialize notification scheduler
      notificationScheduler.initNotificationScheduler();
    } catch (err) {
      console.error('Error creating tables:', err);
    }
  })
  .catch(err => console.error('Connection error', err.stack));

// 4) Static files from ./agenda folder
app.use(express.static(path.join(__dirname, 'agenda')));

// 5) HTML routes (optional)
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

// 6) POST /register => register user
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
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

// 7) POST /login => user login
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

    // Success
    res.send(`Welcome ${email}, you are logged in!`);
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Login failed.');
  }
});

// 8) POST /attend => user signs up for festival
app.post('/attend', async (req, res) => {
  try {
    const { email, festival } = req.body;
    if (!email || !festival) {
      return res.status(400).json({ message: 'Missing email or festival' });
    }
    
    // Add the attendance record
    await client.query(
      `INSERT INTO attendances (user_email, festival_name)
       VALUES ($1, $2)
       ON CONFLICT (user_email, festival_name) DO NOTHING`,
      [email, festival]
    );
    
    // Get the festival date for the notification
    const festivals = [
      { name: "Wavy", date: "2024-12-21" },
      { name: "DGTL", date: "2025-04-18" },
      { name: "Free your mind Kingsday", date: "2025-04-26" },
      { name: "Loveland Kingsday", date: "2025-04-26" },
      { name: "Verbond", date: "2025-05-05" },
      { name: "Awakenings Upclose", date: "2025-05-17" },
      { name: "Soenda", date: "2025-05-31" },
      { name: "909", date: "2025-06-07" },
      { name: "Diynamic", date: "2025-06-07" },
      { name: "Open Air", date: "2025-06-08" },
      { name: "Free Your Mind", date: "2025-06-08" },
      { name: "Mystic Garden Festival", date: "2025-06-14" },
      { name: "Awakenings Festival", date: "2025-07-11" },
      { name: "Tomorrowland", date: "2025-07-18" },
      { name: "Mysteryland", date: "2025-07-22" },
      { name: "No Art", date: "2025-07-26" },
      { name: "Loveland", date: "2025-08-09" },
      { name: "Strafwerk", date: "2025-08-16" },
      { name: "Latin Village", date: "2025-08-17" },
      { name: "Parels van de stad", date: "2025-09-13" },
      { name: "KeineMusik", date: "2025-07-05" },
      { name: "Vunzige Deuntjes", date: "2025-07-05" },
      { name: "Toffler", date: "2025-05-31" },
      { name: "Into the woods", date: "2025-09-19" }
    ];
    
    const festivalData = festivals.find(f => f.name === festival);
    const festivalDate = festivalData ? festivalData.date : 'Unknown date';
    
    // Format the date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    
    // Get other users attending this festival (excluding the current user)
    const otherAttendeesResult = await client.query(
      'SELECT user_email FROM attendances WHERE festival_name = $1 AND user_email != $2',
      [festival, email]
    );
    
    // Notify other attendees about this new person joining
    for (const row of otherAttendeesResult.rows) {
      try {
        await emailService.sendAttendanceNotification(
          row.user_email,  // recipient
          email,           // new attendee
          festival,
          formatDate(festivalDate)
        );
        console.log(`Sent notification to ${row.user_email} about ${email} attending ${festival}`);
      } catch (emailError) {
        console.error(`Failed to send attendance notification to ${row.user_email}:`, emailError);
      }
    }
    
    res.json({ message: `You are attending ${festival}!` });
  } catch (err) {
    console.error('Error in /attend:', err);
    res.status(500).json({ message: 'Could not attend festival.' });
  }
});

// 9) DELETE /attend => user unregisters from festival
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

// 10) GET /my-festivals => list of festivals for this user
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

// 11) GET /festival-attendees => list of users for a festival
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

// ============== RATING FUNCTIONALITY ==============

// 12) POST /rating => user gives rating (1–10) to a festival
app.post('/rating', async (req, res) => {
  try {
    console.log('Received rating request:', req.body);
    
    const { email, festival, rating } = req.body;
    
    if (!email || !festival || rating == null) {
      return res.status(400).json({ message: 'Missing rating data' });
    }

    // Check that rating is between 1 and 10
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 1 and 10' });
    }

    try {
      // Verify the ratings table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ratings'
        );
      `);
      
      const tableExists = tableCheck.rows[0].exists;
      
      if (!tableExists) {
        console.log('Ratings table does not exist. Creating it now...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS ratings (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL,
            festival_name VARCHAR(255) NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_email, festival_name)
          );
        `);
        console.log('Ratings table created successfully');
      }

      // Upsert in the ratings table
      const result = await client.query(
        `INSERT INTO ratings (user_email, festival_name, rating)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_email, festival_name)
         DO UPDATE SET rating = EXCLUDED.rating
         RETURNING *`,
        [email, festival, rating]
      );
      
      console.log('Rating saved successfully:', result.rows[0]);
      
      res.status(200).json({ 
        message: `Rating ${rating} saved for festival ${festival}`,
        data: result.rows[0]
      });
    } catch (dbError) {
      console.error('Database error in POST /rating:', dbError);
      res.status(500).json({ 
        message: 'Database error while saving rating',
        error: dbError.message 
      });
    }
  } catch (err) {
    console.error('Error in POST /rating:', err);
    res.status(500).json({ 
      message: 'Could not save rating',
      error: err.message
    });
  }
});

// 13) GET /rating => get average rating (and optionally all ratings)
// Example: GET /rating?festival=DGTL
app.get('/rating', async (req, res) => {
  try {
    const fest = req.query.festival;
    if (!fest) {
      return res.status(400).json({ message: 'No festival provided' });
    }

    console.log(`Processing rating request for festival: ${fest}`);

    // Check if the ratings table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ratings'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    if (!tableExists) {
      console.log('Ratings table does not exist. Creating it now...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS ratings (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          festival_name VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_email, festival_name)
        );
      `);
      console.log('Ratings table created successfully');
      
      // If table was just created, return empty ratings
      return res.json({
        festival: fest,
        averageRating: null,
        ratings: []
      });
    }

    // Get average
    const avgResult = await client.query(
      'SELECT AVG(rating) as avg_rating FROM ratings WHERE festival_name=$1',
      [fest]
    );
    const average = avgResult.rows[0].avg_rating;
    console.log(`Average rating for ${fest}: ${average}`);

    // Optionally also get all individual ratings:
    const allResult = await client.query(
      'SELECT user_email, rating FROM ratings WHERE festival_name=$1',
      [fest]
    );
    const allRatings = allResult.rows; // [{ user_email, rating }, ...]
    console.log(`Found ${allRatings.length} ratings for ${fest}`);

    res.json({
      festival: fest,
      averageRating: average,   // can be null if no ratings yet
      ratings: allRatings
    });
  } catch (err) {
    console.error('Error in GET /rating:', err);
    res.status(500).json({ 
      message: 'Could not get rating',
      error: err.message 
    });
  }
});

// Test endpoints for email notifications (only enabled in development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/test-notification', async (req, res) => {
    try {
      const testEmail = req.query.email || 'test@example.com';
      const testFestival = req.query.festival || 'Test Festival';
      const testDate = req.query.date || '2025-06-01';
      const daysUntil = req.query.days || 7;
      
      console.log(`Sending test notification to ${testEmail} for ${testFestival}`);
      
      // Test sending a festival reminder
      const result = await emailService.sendFestivalReminder(
        testEmail,
        testFestival,
        testDate,
        daysUntil
      );
      
      res.json({ 
        message: 'Test notification sent!', 
        details: result,
        previewUrl: result.testMessageUrl || 'No preview available'
      });
    } catch (err) {
      console.error('Error sending test notification:', err);
      res.status(500).json({ message: 'Failed to send test notification', error: err.message });
    }
  });
  
  // Test endpoint for running the festival reminder check
  app.get('/test-reminders', async (req, res) => {
    try {
      console.log('Manually triggering festival reminder check');
      await notificationScheduler.sendFestivalReminders();
      res.json({ message: 'Festival reminder check completed' });
    } catch (err) {
      console.error('Error running reminder check:', err);
      res.status(500).json({ message: 'Failed to run reminder check', error: err.message });
    }
  });
}

// 14) Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});