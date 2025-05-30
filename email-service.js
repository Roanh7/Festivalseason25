// email-service.js
const nodemailer = require('nodemailer');

// Create a transporter object - this is what sends the emails
// For testing purposes, we'll use Ethereal (fake SMTP service)
// In production, you would replace this with your actual email service
let transporter;

// Initialize email transporter
// Initialize email transporter
function initializeTransporter() {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // This reads festi.season25@gmail.com from the .env file
      pass: process.env.EMAIL_PASSWORD, // This reads your app password from the .env file
    },
  });
  
  console.log('Email transporter initialized with Gmail');
  return transporter;
}

// When moving to production, you would use a real email service:
// Example for Gmail:
/*
function initializeTransporter() {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  return transporter;
}
*/

// Function to send a notification email
async function sendNotificationEmail(to, subject, text, html) {
  try {
    // Make sure transporter is initialized
    if (!transporter) {
      await initializeTransporter();
    }

    // Setup email data
    const mailOptions = {
      from: '"Festival Agenda" <festi.season25@gmail.com>',
      to: to,
      subject: subject,
      text: text, // Plain text version
      html: html || text, // HTML version (falls back to plain text if not provided)
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    // For test accounts, log the URL where the message can be viewed
    if (info.messageId && info.testMessageUrl) {
      console.log('Message URL:', info.testMessageUrl);
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Send festival reminder notification
async function sendFestivalReminder(userEmail, festivalName, festivalDate, daysUntil) {
  const subject = `Reminder: ${festivalName} is in ${daysUntil} days!`;
  
  const text = `
    Hello festival goer!
    
    This is a friendly reminder that ${festivalName} is coming up in ${daysUntil} days on ${festivalDate}.
    
    Time to start preparing! Don't forget to check the weather forecast and coordinate with your friends.
    
    See you there!
    
    Your Festival Agenda App
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #4CAF50; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Festival Reminder!</h2>
      <p>Hello festival goer!</p>
      <p>This is a friendly reminder that <strong style="color: #4CAF50;">${festivalName}</strong> is coming up in <strong>${daysUntil} days</strong> on ${festivalDate}.</p>
      <p>Time to start preparing! Don't forget to check the weather forecast and coordinate with your friends.</p>
      <p>See you there!</p>
      <p style="margin-top: 30px; color: #666;">Your Festival Agenda App</p>
    </div>
  `;
  
  return await sendNotificationEmail(userEmail, subject, text, html);
}

// Send new festival attendance notification
async function sendAttendanceNotification(userEmail, friendEmail, festivalName, festivalDate) {
  const subject = `${friendEmail} is also going to ${festivalName}!`;
  
  const text = `
    Hello!
    
    Good news! ${friendEmail} is also attending ${festivalName} on ${festivalDate}.
    
    Check the app to see who else is going and coordinate your plans!
    
    Your Festival Agenda App
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #4CAF50; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Festival Buddy Alert!</h2>
      <p>Hello!</p>
      <p>Good news! <strong>${friendEmail}</strong> is also attending <strong style="color: #4CAF50;">${festivalName}</strong> on ${festivalDate}.</p>
      <p>Check the app to see who else is going and coordinate your plans!</p>
      <p style="margin-top: 30px; color: #666;">Your Festival Agenda App</p>
    </div>
  `;
  
  return await sendNotificationEmail(userEmail, subject, text, html);
}

// Add this to your email-service.js file

/**
 * Send a notification when a user reaches a streak milestone
 */
async function sendStreakMilestoneEmail(userEmail, streakCount) {
  const subject = `🔥 Je festival streak is nu ${streakCount}!`;
  
  const text = `
    Gefeliciteerd!
    
    Je hebt zojuist een festival streak van ${streakCount} bereikt door consequent festivals bij te wonen!
    
    Blijf zo doorgaan om je streak te verlengen. Mis geen enkel festival om je vlammen brandende te houden!
    
    Festival Agenda 2025
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #4CAF50; border-radius: 10px;">
      <h2 style="color: #ff6b6b;">🔥 Streak Milestone Bereikt! 🔥</h2>
      <p>Gefeliciteerd!</p>
      <p>Je hebt zojuist een festival streak van <strong style="color: #ff6b6b; font-size: 1.2em;">${streakCount}</strong> bereikt door consequent festivals bij te wonen!</p>
      <p>Blijf zo doorgaan om je streak te verlengen. Mis geen enkel festival om je vlammen brandende te houden!</p>
      <p style="margin-top: 30px; color: #666;">Festival Agenda 2025</p>
    </div>
  `;
  
  return await sendNotificationEmail(userEmail, subject, text, html);
}

// Updated streak logic to send notifications for milestones
async function updateUserStreakWithNotifications(email, previousStreak, newStreak) {
  // Define milestone values that trigger notifications
  const milestones = [3, 5, 10, 15, 20, 25];
  
  // Check if we crossed a milestone
  for (const milestone of milestones) {
    if (previousStreak < milestone && newStreak >= milestone) {
      try {
        await sendStreakMilestoneEmail(email, milestone);
        console.log(`Sent streak milestone (${milestone}) notification to ${email}`);
      } catch (err) {
        console.error(`Failed to send streak milestone notification to ${email}:`, err);
      }
      break; // Only notify for the highest milestone reached
    }
  }
}

// Initialize the transporter when the module is loaded
initializeTransporter();

module.exports = {
  sendNotificationEmail,
  sendFestivalReminder,
  sendAttendanceNotification
};