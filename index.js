// index.js with Festival Streak feature fixed and Ticket Purchase functionality

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

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
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
  
  // Test streak calculation
  app.get('/test-streak', async (req, res) => {
    try {
      const testEmail = req.query.email;
      if (!testEmail) {
        return res.status(400).json({ message: 'Email parameter is required' });
      }
      
      const streakInfo = await updateUserStreak(testEmail);
      res.json({
        message: 'Streak calculation performed',
        email: testEmail,
        streakInfo
      });
    } catch (err) {
      console.error('Error in test streak calculation:', err);
      res.status(500).json({ message: 'Failed to test streak calculation', error: err.message });
    }
  });
}

// 3) Connect to Neon (Postgres)
const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
          username VARCHAR(255) UNIQUE,
          current_streak INTEGER DEFAULT 0,
          best_streak INTEGER DEFAULT 0,
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

      // Create tickets table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS tickets (
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
      
      // Create phone_numbers table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS phone_numbers (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          festival_name VARCHAR(255) NOT NULL,
          phone_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_email, festival_name)
        );
      `);
      
      // Create festivals table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS festivals (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          date VARCHAR(10) NOT NULL,
          location VARCHAR(255),
          price VARCHAR(50),
          chip_scale INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Check if festivals data needs to be populated
      const festivalCount = await client.query('SELECT COUNT(*) FROM festivals');
      
      if (parseInt(festivalCount.rows[0].count) === 0) {
        // Populate with initial festivals from your existing data
        const festivals = [
          { name: "Wavy", date: "2024-12-21" },
          { name: "DGTL", date: "2025-04-18" },
          { name: "Free your mind Kingsday", date: "2025-04-26" },
          { name: "Loveland Kingsday", date: "2025-04-26" },
          { name: "Verbond", date: "2025-05-05" },
          { name: "Awakenings Upclose", date: "2025-05-17" },
          { name: "PIV", date: "2025-05-30" },
          { name: "Soenda", date: "2025-05-31" },
          { name: "Toffler", date: "2025-05-31" },
          { name: "909", date: "2025-06-07" },
          { name: "Diynamic", date: "2025-06-07" },
          { name: "Open Air", date: "2025-06-08" },
          { name: "Free Your Mind", date: "2025-06-08" },
          { name: "Mystic Garden Festival", date: "2025-06-14" },
          { name: "Vunzige Deuntjes", date: "2025-07-05" },
          { name: "KeineMusik", date: "2025-07-05" },
          { name: "Boothstock Festival", date: "2025-07-12" },
          { name: "Awakenings Festival", date: "2025-07-11" },
          { name: "Tomorrowland", date: "2025-07-18" },
          { name: "Mysteryland", date: "2025-07-22" },
          { name: "No Art", date: "2025-07-26" },
          { name: "Loveland", date: "2025-08-09" },
          { name: "Strafwerk", date: "2025-08-16" },
          { name: "Latin Village", date: "2025-08-17" },
          { name: "Parels van de stad", date: "2025-09-13" },
          { name: "Into the woods", date: "2025-09-19" }
        ];
        
        for (const festival of festivals) {
          await client.query(
            'INSERT INTO festivals (name, date) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
            [festival.name, festival.date]
          );
        }
        
        console.log('Festivals table populated with initial data');
      }
      
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
app.get('/account.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'account.html'));
});
app.get('/statistieken.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'agenda', 'statistieken.html'));
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

// ============== USERNAME FUNCTIONALITY ==============

// GET /username => get username for a specific email
app.get('/username', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const result = await client.query(
      'SELECT username FROM users WHERE email = $1',
      [userEmail]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ username: result.rows[0].username });
  } catch (err) {
    console.error('Error fetching username:', err);
    res.status(500).json({ message: 'Failed to fetch username', error: err.message });
  }
});

// POST /username => set or update username for a user
app.post('/username', async (req, res) => {
  try {
    const { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).json({ message: 'Email and username are required' });
    }
    
    // Check if username is already taken by another user
    const existingUser = await client.query(
      'SELECT email FROM users WHERE username = $1 AND email != $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Username is already taken' });
    }
    
    // Update the username
    const result = await client.query(
      'UPDATE users SET username = $1 WHERE email = $2 RETURNING username',
      [username, email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Username updated successfully',
      username: result.rows[0].username 
    });
  } catch (err) {
    console.error('Error updating username:', err);
    res.status(500).json({ message: 'Failed to update username', error: err.message });
  }
});

// GET /display-name => Get display name (username or email) for a specific email
app.get('/display-name', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const result = await client.query(
      'SELECT username FROM users WHERE email = $1',
      [userEmail]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return username if set, otherwise return email
    const displayName = result.rows[0].username || userEmail;
    
    res.json({ displayName });
  } catch (err) {
    console.error('Error fetching display name:', err);
    res.status(500).json({ message: 'Failed to fetch display name', error: err.message });
  }
});

// GET /all-users => get list of all registered users (for festival cards)
app.get('/all-users', async (req, res) => {
  try {
    const result = await client.query(
      'SELECT email, username FROM users ORDER BY COALESCE(username, email)'
    );
    
    const users = result.rows;
    res.json({ users });
  } catch (err) {
    console.error('Error in /all-users:', err);
    res.status(500).json({ message: 'Could not get users list' });
  }
});

// 8) Festival attendance endpoints (modified to update streak)

// Function to handle attendance change and update streak
async function handleAttendanceChange(email, festivalName, isAttending) {
  try {
    if (isAttending) {
      // User is attending a festival
      await client.query(`
        INSERT INTO attendances (user_email, festival_name)
        VALUES ($1, $2)
        ON CONFLICT (user_email, festival_name) DO NOTHING
      `, [email, festivalName]);
    } else {
      // User is no longer attending a festival
      await client.query(`
        DELETE FROM attendances 
        WHERE user_email = $1 AND festival_name = $2
      `, [email, festivalName]);
      
      // Also remove any ticket purchase records when unattending
      await client.query(`
        DELETE FROM tickets 
        WHERE user_email = $1 AND festival_name = $2
      `, [email, festivalName]);
    }
    
    // Update streak after attendance change
    return await updateUserStreak(email);
  } catch (err) {
    console.error('Error handling attendance change:', err);
    throw err;
  }
}

// POST /attend => user signs up for festival
app.post('/attend', async (req, res) => {
  try {
    const { email, festival } = req.body;
    if (!email || !festival) {
      return res.status(400).json({ message: 'Missing email or festival' });
    }
    
    // Add the attendance record and update streak
    const streakInfo = await handleAttendanceChange(email, festival, true);
    
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
      { name: "PIV", date: "2025-05-30" },
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
    
    res.json({ 
      message: `You are attending ${festival}!`,
      streak: streakInfo.currentStreak,
      bestStreak: streakInfo.maxStreak
    });
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
    
    // Remove the attendance record and update streak
    const streakInfo = await handleAttendanceChange(email, festival, false);
    
    res.json({ 
      message: `You are no longer attending ${festival}.`,
      streak: streakInfo.currentStreak,
      bestStreak: streakInfo.maxStreak
    });
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
    
    // Get all attendees for this festival
    const result = await client.query(
      'SELECT a.user_email FROM attendances a WHERE a.festival_name=$1',
      [festival]
    );
    
    // Get all available display names (username or email)
    const attendeeEmails = result.rows.map(r => r.user_email);
    const attendees = [];
    
    // Look up usernames for all these emails
    for (const email of attendeeEmails) {
      const userResult = await client.query(
        'SELECT username FROM users WHERE email = $1',
        [email]
      );
      
      // Use username if available, otherwise use email
      if (userResult.rows.length > 0 && userResult.rows[0].username) {
        attendees.push(userResult.rows[0].username);
      } else {
        attendees.push(email);
      }
    }

    res.json({ festival, attendees });
  } catch (err) {
    console.error('Error in /festival-attendees:', err);
    res.status(500).json({ message: 'Could not get attendees' });
  }
});

// ============== TICKET PURCHASE FUNCTIONALITY ==============

// POST /ticket => user has purchased a ticket for a festival
app.post('/ticket', async (req, res) => {
  try {
    const { email, festival } = req.body;
    if (!email || !festival) {
      return res.status(400).json({ message: 'Missing email or festival' });
    }
    
    // Check if the user is attending this festival first
    const attendingResult = await client.query(
      'SELECT 1 FROM attendances WHERE user_email = $1 AND festival_name = $2',
      [email, festival]
    );
    
    if (attendingResult.rows.length === 0) {
      return res.status(400).json({ 
        message: 'You must be attending this festival before marking a ticket as purchased.' 
      });
    }
    
    // Add the ticket record
    await client.query(`
      INSERT INTO tickets (user_email, festival_name)
      VALUES ($1, $2)
      ON CONFLICT (user_email, festival_name) DO NOTHING
    `, [email, festival]);
    
    res.json({ message: `Ticket for ${festival} marked as purchased!` });
  } catch (err) {
    console.error('Error in /ticket:', err);
    res.status(500).json({ message: 'Could not mark ticket as purchased.' });
  }
});

// DELETE /ticket => user removes ticket status for a festival
app.delete('/ticket', async (req, res) => {
  try {
    const { email, festival } = req.body;
    if (!email || !festival) {
      return res.status(400).json({ message: 'Missing email or festival' });
    }
    
    // Remove the ticket record
    await client.query(`
      DELETE FROM tickets 
      WHERE user_email = $1 AND festival_name = $2
    `, [email, festival]);
    
    res.json({ message: `Ticket for ${festival} no longer marked as purchased.` });
  } catch (err) {
    console.error('Error in DELETE /ticket:', err);
    res.status(500).json({ message: 'Could not unmark ticket.' });
  }
});

// GET /my-tickets => list of festivals for which this user has purchased tickets
app.get('/my-tickets', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'No email provided' });
    }
    
    const result = await client.query(
      'SELECT festival_name FROM tickets WHERE user_email = $1',
      [userEmail]
    );
    
    const tickets = result.rows.map(r => r.festival_name);
    res.json({ tickets });
  } catch (err) {
    console.error('Error in /my-tickets:', err);
    res.status(500).json({ message: 'Could not get user tickets' });
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
        CREATE TABLE IF NOT EXISTS ratings (id SERIAL PRIMARY KEY,
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
      'SELECT r.user_email, r.rating, u.username FROM ratings r LEFT JOIN users u ON r.user_email = u.email WHERE r.festival_name=$1',
      [fest]
    );
    
    // Format the result to use username if available
    const allRatings = allResult.rows.map(row => ({
      user_email: row.username || row.user_email, // Use username if available
      rating: row.rating
    }));
    
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

// ============== S-TEAM PHONE NUMBER FUNCTIONALITY ==============

// 14) POST /phone-numbers => user submits phone numbers for a festival
app.post('/phone-numbers', async (req, res) => {
  try {
    const { email, festival, phoneCount } = req.body;
    
    if (!email || !festival || phoneCount === undefined) {
      return res.status(400).json({ message: 'Missing required data' });
    }
    
    // Ensure phoneCount is a non-negative integer
    const count = Math.max(0, parseInt(phoneCount) || 0);
    
    // Check if this record already exists
    const existingResult = await client.query(
      'SELECT * FROM phone_numbers WHERE user_email = $1 AND festival_name = $2',
      [email, festival]
    );
    
    if (existingResult.rows.length > 0) {
      // Update existing record
      await client.query(
        `UPDATE phone_numbers 
         SET phone_count = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_email = $1 AND festival_name = $2`,
        [email, festival, count]
      );
    } else {
      // Insert new record
      await client.query(
        `INSERT INTO phone_numbers (user_email, festival_name, phone_count)
         VALUES ($1, $2, $3)`,
        [email, festival, count]
      );
    }
    
    res.status(200).json({ 
      message: 'Phone numbers saved successfully',
      email,
      festival,
      phoneCount: count
    });
  } catch (err) {
    console.error('Error in /phone-numbers:', err);
    res.status(500).json({ message: 'Could not save phone numbers' });
  }
});

// 15) GET /my-phone-numbers => get all phone numbers for current user
app.get('/my-phone-numbers', async (req, res) => {
  try {
    const userEmail = req.query.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const result = await client.query(
      'SELECT festival_name, phone_count FROM phone_numbers WHERE user_email = $1',
      [userEmail]
    );
    
    // Convert to object format for easier lookup
    const phoneNumbers = {};
    result.rows.forEach(row => {
      phoneNumbers[row.festival_name] = row.phone_count;
    });
    
    res.json({ phoneNumbers });
  } catch (err) {
    console.error('Error in /my-phone-numbers:', err);
    res.status(500).json({ message: 'Could not get phone numbers' });
  }
});

// 16) GET /phone-number-rankings => get rankings of users by total phone numbers
app.get('/phone-number-rankings', async (req, res) => {
  try {
    // Query to get total phone numbers per user with festival count
    const result = await client.query(`
      WITH user_totals AS (
        SELECT 
          pn.user_email,
          SUM(pn.phone_count) AS total_phone_count,
          COUNT(DISTINCT pn.festival_name) AS festival_count
        FROM 
          phone_numbers pn
        GROUP BY 
          pn.user_email
      )
      SELECT 
        ut.user_email,
        u.username,
        ut.total_phone_count,
        ut.festival_count
      FROM 
        user_totals ut
      LEFT JOIN 
        users u ON ut.user_email = u.email
      ORDER BY 
        ut.total_phone_count DESC
    `);
    
    // Format the rankings
    const rankings = result.rows.map(row => ({
      email: row.user_email,
      username: row.username,
      totalPhoneNumbers: parseInt(row.total_phone_count) || 0,
      festivalCount: parseInt(row.festival_count) || 0
    }));
    
    res.json({ rankings });
  } catch (err) {
    console.error('Error in /phone-number-rankings:', err);
    res.status(500).json({ message: 'Could not get phone number rankings' });
  }
});

// 17) GET /phone-number-total => get total phone numbers for a user
app.get('/phone-number-total', async (req, res) => {
  try {
    const userEmail = req.query.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Get all the user's phone numbers
    const result = await client.query(
      'SELECT SUM(phone_count) as total_points FROM phone_numbers WHERE user_email = $1',
      [userEmail]
    );
    
    // Get the total points (default to 0 if not found)
    const totalPoints = result.rows.length > 0 ? 
      parseInt(result.rows[0].total_points) || 0 : 0;
    
    res.json({ 
      email: userEmail,
      totalPoints: totalPoints
    });
  } catch (err) {
    console.error('Error in /phone-number-total:', err);
    res.status(500).json({ 
      message: 'Could not get total phone numbers',
      totalPoints: 0
    });
  }
});

// ============== USER STREAK FUNCTIONALITY - FIXED VERSION ==============

// Modified endpoint for user streak to handle errors better
app.get('/user-streak', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ 
        message: 'Email is required',
        currentStreak: 0,
        bestStreak: 0
      });
    }
    
    // Check if user exists first
    const userCheck = await client.query('SELECT email FROM users WHERE email = $1', [userEmail]);
    if (userCheck.rows.length === 0) {
      return res.status(200).json({
        message: 'User not found, but returning default values',
        currentStreak: 0,
        bestStreak: 0
      });
    }
    
    // Get streak information from the database
    const result = await client.query(`
      SELECT current_streak, best_streak 
      FROM users 
      WHERE email = $1
    `, [userEmail]);
    
    // Return even if no results (with defaults)
    res.json({
      currentStreak: result.rows.length > 0 ? (result.rows[0].current_streak || 0) : 0,
      bestStreak: result.rows.length > 0 ? (result.rows[0].best_streak || 0) : 0
    });
  } catch (err) {
    console.error('Error getting user streak:', err);
    // Return default values instead of error to prevent UI breaking
    res.status(200).json({ 
      message: 'Error occurred, using default values',
      currentStreak: 0,
      bestStreak: 0 
    });
  }
});

// Fixed endpoint for streak ranking
app.get('/streak-ranking', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(200).json({ 
        message: 'Email is required',
        rank: 0,
        totalUsers: 0,
        percentile: 0
      });
    }
    
    // Check if user exists first
    const userCheck = await client.query('SELECT email FROM users WHERE email = $1', [userEmail]);
    if (userCheck.rows.length === 0) {
      return res.status(200).json({
        message: 'User not found',
        rank: 0,
        totalUsers: 0,
        percentile: 0
      });
    }
    
    // Get user's best streak
    const userResult = await client.query(`
      SELECT best_streak FROM users WHERE email = $1
    `, [userEmail]);
    
    const userBestStreak = userResult.rows.length > 0 ? (userResult.rows[0].best_streak || 0) : 0;
    
    // Count how many users have a higher best streak
    const rankingResult = await client.query(`
      SELECT COUNT(*) as rank_position 
      FROM users 
      WHERE best_streak > $1
    `, [userBestStreak]);
    
    // Get total number of users with streaks
    const totalResult = await client.query(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE best_streak > 0
    `);
    
    // User's rank is their position plus 1 (0-indexed to 1-indexed)
    const rankPosition = parseInt(rankingResult.rows[0].rank_position) + 1;
    const totalUsers = parseInt(totalResult.rows[0].total) || 1; // Avoid division by zero
    
    res.json({
      rank: rankPosition,
      totalUsers: totalUsers,
      percentile: totalUsers > 0 ? Math.round(((totalUsers - rankPosition) / totalUsers) * 100) : 0
    });
  } catch (err) {
    console.error('Error getting streak ranking:', err);
    res.status(200).json({ 
      message: 'Error retrieving streak ranking',
      rank: 0,
      totalUsers: 0,
      percentile: 0
    });
  }
});

// Improved updateUserStreak function with better error handling
async function updateUserStreak(email) {
  try {
    console.log(`Updating streak for user: ${email}`);
    
    // Check if user exists
    const userCheck = await client.query('SELECT email FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      console.error(`User not found: ${email}`);
      return { currentStreak: 0, bestStreak: 0 };
    }
    
    // Get current streak value for notifications
    const currentStreakResult = await client.query(`
      SELECT current_streak, best_streak FROM users WHERE email = $1
    `, [email]);
    
    const previousStreak = currentStreakResult.rows.length > 0 ? 
      (currentStreakResult.rows[0].current_streak || 0) : 0;
    const previousBestStreak = currentStreakResult.rows.length > 0 ? 
      (currentStreakResult.rows[0].best_streak || 0) : 0;
    
    // Get all festivals sorted by date
    const allFestivalsResult = await client.query(`
      SELECT name, to_date(date, 'YYYY-MM-DD') as date_obj 
      FROM festivals 
      ORDER BY date_obj ASC
    `);
    
    if (allFestivalsResult.rows.length === 0) {
      console.log('No festivals found in database');
      return { currentStreak: 0, bestStreak: previousBestStreak };
    }
    
    const allFestivals = allFestivalsResult.rows;
    console.log(`Found ${allFestivals.length} festivals for streak calculation`);
    
    // Get user's attended festivals
    const userFestivalsResult = await client.query(`
      SELECT festival_name 
      FROM attendances 
      WHERE user_email = $1
    `, [email]);
    
    // Create a Set of festival names the user has attended for faster lookups
    const userFestivals = new Set();
    userFestivalsResult.rows.forEach(row => {
      userFestivals.add(row.festival_name);
    });
    
    console.log(`User has attended ${userFestivals.size} festivals`);
    
    // If user hasn't attended any festivals, return zeros
    if (userFestivals.size === 0) {
      console.log('User has not attended any festivals');
      
      // Update database with zeros
      await client.query(`
        UPDATE users 
        SET current_streak = 0, 
            best_streak = $1
        WHERE email = $2
      `, [previousBestStreak, email]);
      
      return { currentStreak: 0, bestStreak: previousBestStreak };
    }
    
    // Calculate the current streak
    let currentStreak = 0;
    let maxStreak = previousBestStreak; // Start with previous best to avoid resetting
    let lastAttendedIndex = -1;
    
    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Loop through festivals in chronological order
    for (let i = 0; i < allFestivals.length; i++) {
      const festival = allFestivals[i];
      const festivalName = festival.name;
      const festivalDate = new Date(festival.date_obj);
      
      // Skip future festivals for streak calculation
      if (festivalDate > today) {
        continue;
      }
      
      const hasAttended = userFestivals.has(festivalName);
      console.log(`Festival: ${festivalName}, Date: ${festivalDate.toISOString().split('T')[0]}, Attended: ${hasAttended}`);
      
      if (hasAttended) {
        // Check if this is the next festival in sequence or the first one
        if (lastAttendedIndex === -1 || lastAttendedIndex === i - 1) {
          currentStreak++;
          console.log(`Streak increased to ${currentStreak}`);
        } else {
          // User missed a festival, reset streak
          console.log(`Streak reset (missed festival between index ${lastAttendedIndex} and ${i})`);
          currentStreak = 1;
        }
        
        lastAttendedIndex = i;
        maxStreak = Math.max(maxStreak, currentStreak);
      }
    }
    
    console.log(`Final calculation: currentStreak=${currentStreak}, maxStreak=${maxStreak}`);
    
    // Update user's streak information
    await client.query(`
      UPDATE users 
      SET current_streak = $1, 
          best_streak = $2
      WHERE email = $3
    `, [currentStreak, maxStreak, email]);
    
    return { currentStreak, bestStreak: maxStreak };
  } catch (err) {
    console.error('Error updating streak:', err);
    // Don't throw error, just return current values or zeros
    return { currentStreak: 0, bestStreak: 0 };
  }
}

// Add a simplified endpoint for manual streak recalculation
app.post('/recalculate-streak', async (req, res) => {
  try {
    const userEmail = req.body.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Perform streak recalculation
    const result = await updateUserStreak(userEmail);
    
    res.json({
      message: 'Streak recalculated successfully',
      currentStreak: result.currentStreak,
      bestStreak: result.bestStreak
    });
  } catch (err) {
    console.error('Error in streak recalculation:', err);
    res.status(200).json({ 
      message: 'Error recalculating streak, using default values',
      currentStreak: 0,
      bestStreak: 0
    });
  }
});

// POST /recalculate-streaks => Force recalculation of all user streaks
// This endpoint is useful after database changes or to fix incorrect streaks
app.post('/recalculate-streaks', async (req, res) => {
  try {
    // Get all users
    const usersResult = await client.query('SELECT email FROM users');
    const users = usersResult.rows;
    
    console.log(`Recalculating streaks for ${users.length} users`);
    
    // Process results
    const results = {
      totalProcessed: users.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Update streak for each user
    for (const user of users) {
      try {
        await updateUserStreak(user.email);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: user.email,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Streak recalculation completed',
      results
    });
  } catch (err) {
    console.error('Error in streak recalculation:', err);
    res.status(500).json({ message: 'Failed to recalculate streaks' });
  }
});