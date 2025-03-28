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

