// notification-scheduler.js
const cron = require('node-cron');
const { Client } = require('pg');
const emailService = require('./email-service');

// Function to format date as DD-MM-YYYY
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Function to calculate days between two dates
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  // Set both dates to midnight to avoid time differences
  firstDate.setHours(0, 0, 0, 0);
  secondDate.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

// Function to send festival reminders
async function sendFestivalReminders() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database for sending reminders');

    // Get the current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get festivals coming up in the next 7 days
    const upcomingFestivals = [
      { name: "Wavy", date: "2024-12-21" },
      { name: "DGTL", date: "2025-04-18" },
      { name: "Free your mind Kingsday", date: "2025-04-26" },
      { name: "Loveland Kingsday", date: "2025-04-26" },
      // Add other festivals from your script.js
    ].filter(festival => {
      const festivalDate = new Date(festival.date);
      festivalDate.setHours(0, 0, 0, 0);
      const daysUntil = daysBetween(today, festivalDate);
      // Only include festivals in the future that are within 7 days OR exactly 30 days away
      return festivalDate > today && (daysUntil <= 7 || daysUntil === 30);
    });
    
    console.log(`Found ${upcomingFestivals.length} upcoming festivals for reminders`);
    
    // For each upcoming festival, get users who are attending
    for (const festival of upcomingFestivals) {
      const festivalDate = new Date(festival.date);
      const daysUntil = daysBetween(today, festivalDate);
      
      // Get users attending this festival
      const userResult = await client.query(
        'SELECT user_email FROM attendances WHERE festival_name = $1',
        [festival.name]
      );
      
      const attendees = userResult.rows.map(row => row.user_email);
      console.log(`Sending ${festival.name} reminders to ${attendees.length} attendees (${daysUntil} days until festival)`);
      
      // For each attendee, send a reminder email
      for (const userEmail of attendees) {
        try {
          await emailService.sendFestivalReminder(
            userEmail,
            festival.name,
            formatDate(festival.date),
            daysUntil
          );
          console.log(`Sent reminder to ${userEmail} for ${festival.name}`);
        } catch (emailError) {
          console.error(`Failed to send reminder to ${userEmail}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error sending festival reminders:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed after sending reminders');
  }
}

// Function to initialize notification scheduling
function initNotificationScheduler() {
  console.log('Initializing notification scheduler...');
  
  // Schedule daily check for festival reminders
  // This runs every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Running scheduled festival reminder check...');
    await sendFestivalReminders();
  });
  
  console.log('Notification scheduler initialized');
}

module.exports = {
  initNotificationScheduler,
  sendFestivalReminders
};

// Add this function to notification-scheduler.js

// Function to send email notification for MVP voting
async function sendMvpVoteReminder(userEmail, festivalName, festivalDate) {
  const subject = `Vote for MVP: ${festivalName}`;
  
  const text = `
    Hallo festival ganger!
    
    Je bent naar ${festivalName} op ${festivalDate} geweest en we willen graag weten wie volgens jou de MVP was!
    
    Log in op de Festival Agenda website en stem op je MVP.
    
    Groeten,
    
    Festival Agenda 2025
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #4CAF50; border-radius: 10px;">
      <h2 style="color: #F44336;">Stem op de Festival MVP! 🏆</h2>
      <p>Hallo festival ganger!</p>
      <p>Je bent naar <strong style="color: #4CAF50;">${festivalName}</strong> op ${festivalDate} geweest en we willen graag weten wie volgens jou de MVP was!</p>
      <p>Log in op de Festival Agenda website en stem op je MVP.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://festival-agenda.vercel.app" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Stem nu op je MVP</a>
      </div>
      <p style="margin-top: 30px; color: #666;">Festival Agenda 2025</p>
    </div>
  `;
  
  return await emailService.sendNotificationEmail(userEmail, subject, text, html);
}

// Function to send MVP vote reminders
async function sendMvpVoteReminders() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database for sending MVP vote reminders');

    // Get pending MVP votes
    // Get users who attended festivals but haven't voted for MVP
    const result = await client.query(`
      SELECT DISTINCT a.user_email, a.festival_name, f.date
      FROM attendances a
      LEFT JOIN mvp_votes m ON a.user_email = m.user_email AND a.festival_name = m.festival_name
      JOIN festivals f ON a.festival_name = f.name
      WHERE m.id IS NULL
      AND f.date < CURRENT_DATE - INTERVAL '1 day'
      AND f.date > CURRENT_DATE - INTERVAL '7 days'
    `);
    
    console.log(`Found ${result.rows.length} pending MVP votes to remind about`);
    
    // Send reminders
    for (const row of result.rows) {
      try {
        await sendMvpVoteReminder(
          row.user_email,
          row.festival_name,
          formatDate(row.date)
        );
        console.log(`Sent MVP vote reminder to ${row.user_email} for ${row.festival_name}`);
        
        // Add a small delay between emails to avoid overwhelming the mail server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (emailError) {
        console.error(`Failed to send MVP vote reminder to ${row.user_email}:`, emailError);
      }
    }
  } catch (error) {
    console.error('Error sending MVP vote reminders:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed after sending MVP vote reminders');
  }
}

// Modify the initNotificationScheduler function to include MVP vote reminders
function initNotificationScheduler() {
  console.log('Initializing notification scheduler...');
  
  // Schedule daily check for festival reminders
  // This runs every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Running scheduled festival reminder check...');
    await sendFestivalReminders();
  });
  
  // Schedule daily check for MVP vote reminders
  // This runs every day at 3:00 PM
  cron.schedule('0 15 * * *', async () => {
    console.log('Running scheduled MVP vote reminder check...');
    await sendMvpVoteReminders();
  });
  
  console.log('Notification scheduler initialized');
}

// Update module exports
module.exports = {
  initNotificationScheduler,
  sendFestivalReminders,
  sendMvpVoteReminders
};