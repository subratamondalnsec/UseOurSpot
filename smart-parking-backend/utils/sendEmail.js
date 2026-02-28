const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send an email via Brevo API using axios.
 * @param {string} to      - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html    - HTML body content
 * @param {string} text    - Plain text content (optional)
 */
const sendEmail = async ({ to, subject, html, text = '' }) => {
  const emailData = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || 'Smart Parking',
      email: process.env.EMAIL_FROM || 'no-reply@smartparking.com',
    },
    to: [
      {
        email: to,
        name: to.split('@')[0], // Extract name from email
      },
    ],
    subject: subject,
    htmlContent: html,
    textContent: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags as fallback
  };

  try {
    const response = await axios.post(BREVO_API_URL, emailData, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
    });
    console.log('✅ Email sent successfully via Brevo API');
    return response.data;
  } catch (error) {
    console.error('❌ Error sending email via Brevo:', error.response?.data || error.message);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
