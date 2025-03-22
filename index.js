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
          { name: "Music On", date: "2025-05-10" },
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

// Enhanced normalization function for festival names with explicit mapping
function normalizeFestivalName(festivalName) {
  if (!festivalName) return '';
  
  // First preserve the original format for storage
  const originalName = festivalName.trim();
  
  // Check the explicit mapping for problematic festivals
  const festivalNamesMapping = {
    // Lowercase normalized keys for lookup, exact preservation for storage
    'strafwerk': 'Strafwerk',
    'boothstock': 'Boothstock Festival',
    'boothstockfestival': 'Boothstock Festival',
    'toffler': 'Toffler',
    'latinvillage': 'Latin Village',
    'latin village': 'Latin Village',
    'piv': 'PIV',
    'mysteryland': 'Mysteryland',
    'intothewoods': 'Into the woods',
    'into the woods': 'Into the woods',
    '909': '909',
    'freeyourmind': 'Free Your Mind',
    'free your mind': 'Free Your Mind',
    'freeyourmindkingsday': 'Free your mind Kingsday',
    'free your mind kingsday': 'Free your mind Kingsday',
    'lovelandkingsday': 'Loveland Kingsday',
    'loveland kingsday': 'Loveland Kingsday',
    'mysticgarden': 'Mystic Garden Festival',
    'mystic garden': 'Mystic Garden Festival',
    'diynamic': 'Diynamic', 
    'openair': 'Open Air',
    'open air': 'Open Air',
    'keinemusik': 'KeineMusik',
    'vunzigedeuntjes': 'Vunzige Deuntjes',
    'vunzige deuntjes': 'Vunzige Deuntjes',
    'noart': 'No Art',
    'no art': 'No Art',
    'parelsvandestad': 'Parels van de stad',
    'parels van de stad': 'Parels van de stad',
    'music on': 'Music On',
    'musicon': 'Music On',
    'awakeningsupclose': 'Awakenings Upclose',
    'awakenings upclose': 'Awakenings Upclose',
    'awakeningsfestival': 'Awakenings Festival',
    'awakenings festival': 'Awakenings Festival'
  };
  
  // Normalize for lookup
  const normalizedKey = originalName.toLowerCase()
    .replace(/\s+/g, '')    // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
  
  // Check if this is one of our problem festivals with explicit mapping
  if (festivalNamesMapping[normalizedKey]) {
    console.log(`[SERVER] Fixed problematic festival: "${originalName}" -> "${festivalNamesMapping[normalizedKey]}"`);
    return festivalNamesMapping[normalizedKey];
  }
  
  // Otherwise, just return the original trimmed name
  return originalName;
}

// 8) Festival attendance endpoints (modified to update streak)

// Enhanced function to handle attendance change and update streak
async function handleAttendanceChange(email, festivalName, isAttending) {
  try {
    // Normalize the festival name for consistent storage
    const normalizedFestName = normalizeFestivalName(festivalName);
    console.log(`[SERVER] Processing attendance change: ${email}, Festival: "${normalizedFestName}", Attending: ${isAttending}`);
    
    if (isAttending) {
      // User is attending a festival
      await client.query(`
        INSERT INTO attendances (user_email, festival_name)
        VALUES ($1, $2)
        ON CONFLICT (user_email, festival_name) DO NOTHING
      `, [email, normalizedFestName]);
      
      // Log successful attendance
      console.log(`[SERVER] User ${email} is now attending "${normalizedFestName}"`);
    } else {
      // User is no longer attending a festival
      await client.query(`
        DELETE FROM attendances 
        WHERE user_email = $1 AND festival_name = $2
      `, [email, normalizedFestName]);
      
      // Also remove any ticket purchase records when unattending
      await client.query(`
        DELETE FROM tickets 
        WHERE user_email = $1 AND festival_name = $2
      `, [email, normalizedFestName]);
      
      console.log(`[SERVER] User ${email} is no longer attending "${normalizedFestName}"`);
    }
    
    // Update streak after attendance change
    return await updateUserStreak(email);
  } catch (err) {
    console.error('[SERVER] Error handling attendance change:', err);
    throw err;
  }
}

// Enhanced function to get user festivals with case-insensitive comparison
async function getUserFestivals(userEmail) {
  try {
    console.log(`[SERVER] Fetching festivals for user: ${userEmail}`);
    
    // Get festivals directly from the attendances table
    const result = await client.query(
      'SELECT festival_name FROM attendances WHERE user_email = $1',
      [userEmail]
    );
    
    // Extract festival names
    const festivals = result.rows.map(row => row.festival_name);
    
    console.log(`[SERVER] Fetched ${festivals.length} festivals for ${userEmail}:`, festivals);
    
    return festivals;
  } catch (err) {
    console.error('[SERVER] Error fetching user festivals:', err);
    return [];
  }
}

// POST /attend => user signs up for festival (Enhanced version)
app.post('/attend', async (req, res) => {
  try {
    const { email, festival } = req.body;
    if (!email || !festival) {
      return res.status(400).json({ message: 'Missing email or festival' });
    }
    
    console.log(`[SERVER] POST /attend request: ${email}, Festival: "${festival}"`);
    
    // Add the attendance record and update streak
    const streakInfo = await handleAttendanceChange(email, festival, true);
    
    // Return success response with streak info
    res.json({ 
      message: `You are attending ${festival}!`,
      streak: streakInfo.currentStreak,
      bestStreak: streakInfo.maxStreak
    });
  } catch (err) {
    console.error('[SERVER] Error in POST /attend:', err);
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
    
    const festivals = await getUserFestivals(userEmail);
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
    
    // Normalize the festival name
    const normalizedFestival = normalizeFestivalName(festival);
    
    // Check if the user is attending this festival first
    const attendingResult = await client.query(
      'SELECT 1 FROM attendances WHERE user_email = $1 AND festival_name = $2',
      [email, normalizedFestival]
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
    `, [email, normalizedFestival]);
    
    res.json({ message: `Ticket for ${normalizedFestival} marked as purchased!` });
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
    
    // Normalize the festival name
    const normalizedFestival = normalizeFestivalName(festival);
    
    // Remove the ticket record
    await client.query(`
      DELETE FROM tickets 
      WHERE user_email = $1 AND festival_name = $2
    `, [email, normalizedFestival]);
    
    res.json({ message: `Ticket for ${normalizedFestival} no longer marked as purchased.` });
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
    
    // Normalize the festival name
    const normalizedFestival = normalizeFestivalName(festival);

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
        [email, normalizedFestival, rating]
      );
      
      console.log('Rating saved successfully:', result.rows[0]);
      
      res.status(200).json({ 
        message: `Rating ${rating} saved for festival ${normalizedFestival}`,
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
    res.status(500).json({ message: 'Could not save rating' });
  }
});

// Function to update user's streak (called by attendance endpoints)
async function updateUserStreak(email) {
  try {
    console.log(`[SERVER] Updating streak for user: ${email}`);
    
    // Get current user data
    const userResult = await client.query(
      'SELECT current_streak, best_streak FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`[SERVER] User ${email} not found when updating streak`);
      return { currentStreak: 0, maxStreak: 0 };
    }
    
    // Get attendance count
    const attendanceResult = await client.query(
      'SELECT COUNT(*) as count FROM attendances WHERE user_email = $1',
      [email]
    );
    
    const attendanceCount = parseInt(attendanceResult.rows[0].count);
    
    // Current streak is the attendance count
    const currentStreak = attendanceCount;
    
    // Best streak is max of current or previous best
    const previousBest = userResult.rows[0].best_streak || 0;
    const newBestStreak = Math.max(currentStreak, previousBest);
    
    // Update the user record
    await client.query(
      'UPDATE users SET current_streak = $1, best_streak = $2 WHERE email = $3',
      [currentStreak, newBestStreak, email]
    );
    
    console.log(`[SERVER] Updated streak for ${email}: current=${currentStreak}, best=${newBestStreak}`);
    
    return {
      currentStreak,
      maxStreak: newBestStreak
    };
  } catch (err) {
    console.error('[SERVER] Error updating user streak:', err);
    return { currentStreak: 0, maxStreak: 0 };
  }
}

// Add the special endpoint for fixing problem festivals
app.post('/fix-problem-festivals', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log(`[SERVER] Fixing problem festivals for: ${email}`);
    
    // List of festivals this user is attending
    const festivals = await getUserFestivals(email);
    
    // Fix each festival name
    const fixedFestivals = [];
    for (const festName of festivals) {
      // Normalize the festival name
      const normalizedName = normalizeFestivalName(festName);
      
      // If the normalized name is different, update it
      if (normalizedName !== festName) {
        console.log(`[SERVER] Fixing festival name: "${festName}" -> "${normalizedName}"`);
        
        // Delete the old record
        await client.query(
          'DELETE FROM attendances WHERE user_email = $1 AND festival_name = $2',
          [email, festName]
        );
        
        // Insert the new normalized record
        await client.query(
          'INSERT INTO attendances (user_email, festival_name) VALUES ($1, $2) ON CONFLICT (user_email, festival_name) DO NOTHING',
          [email, normalizedName]
        );
        
        // Fix any ticket records too
        await client.query(
          'UPDATE tickets SET festival_name = $1 WHERE user_email = $2 AND festival_name = $3',
          [normalizedName, email, festName]
        );
        
        fixedFestivals.push({
          old: festName,
          new: normalizedName
        });
      }
    }
    
    // Return the results
    res.json({
      message: `Fixed ${fixedFestivals.length} festival names`,
      fixed: fixedFestivals
    });
  } catch (err) {
    console.error('[SERVER] Error fixing problem festivals:', err);
    res.status(500).json({ message: 'Error fixing problem festivals', error: err.message });
  }
});

// Add a diagnostic endpoint to inspect festival names in the database
app.get('/debug-festivals', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    
    // Get all user's festivals from the database
    const result = await client.query(
      'SELECT festival_name FROM attendances WHERE user_email = $1',
      [email]
    );
    
    const festivalsInDb = result.rows.map(row => row.festival_name);
    
    // Get all festivals with normalized versions
    const normalizedFestivals = festivalsInDb.map(fest => ({
      original: fest,
      normalized: normalizeFestivalName(fest)
    }));
    
    // Return the complete dataset
    res.json({
      email,
      festivalsInDb,
      normalizedFestivals
    });
  } catch (err) {
    console.error('[SERVER] Error in debug-festivals:', err);
    res.status(500).json({ message: 'Error fetching festival debug info', error: err.message });
  }
});