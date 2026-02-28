// Email utility using Brevo Transactional Email API (messageVersions pattern)
const Brevo = require('@getbrevo/brevo');

/**
 * Send transactional email via Brevo with per-recipient HTML + params support.
 *
 * @param {Object} options
 * @param {string} options.subject           - Base subject (supports {{params.key}})
 * @param {string} options.htmlContent       - Base HTML template (supports {{params.key}})
 * @param {string} [options.senderName]      - Sender name (default: 'Smart Parking')
 * @param {Array}  options.messageVersions   - Per-recipient version overrides:
 *   [{
 *     to: [{ email, name }],
 *     subject?,       // overrides base subject
 *     htmlContent?,   // overrides base HTML for this recipient
 *     params?,        // { key: value } fills {{params.key}} placeholders
 *     cc?, bcc?, replyTo?
 *   }]
 *
 * @returns {Promise<string[]>} Brevo messageIds array (one per version)
 *
 * Usage example:
 *   await sendEmail({
 *     subject: 'Booking {{params.bookingId}} Confirmed',
 *     htmlContent: '<h1>Hi {{params.name}}, your spot is booked!</h1>',
 *     messageVersions: [{
 *       to: [{ email: 'driver@example.com', name: 'John' }],
 *       params: { name: 'John', bookingId: 'BK-001' },
 *       subject: 'Booking BK-001 Confirmed',
 *     }],
 *   });
 */
const sendEmail = async ({
  subject,
  htmlContent,
  senderName = 'Smart Parking',
  messageVersions = [],
}) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  // ── Base sender & content ────────────────────────────────────
  sendSmtpEmail.sender = {
    name: senderName,
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.subject     = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  // ── Per-recipient versions ───────────────────────────────────
  // NOTE: Do NOT set a top-level "to" when using messageVersions.
  // All recipients must be defined inside each version.
  if (messageVersions.length > 0) {
    sendSmtpEmail.messageVersions = messageVersions.map((version) => {
      const v = { to: version.to };
      if (version.subject)     v.subject     = version.subject;
      if (version.htmlContent) v.htmlContent = version.htmlContent;
      if (version.params)      v.params      = version.params;
      if (version.cc)          v.cc          = version.cc;
      if (version.bcc)         v.bcc         = version.bcc;
      if (version.replyTo)     v.replyTo     = version.replyTo;
      return v;
    });
  }

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    // Brevo returns messageIds array — one ID per version for tracking
    const messageIds = result.body?.messageIds || [];
    console.log('📧 Brevo email sent | messageIds:', messageIds);
    return messageIds;
  } catch (error) {
    const brevoMsg = error?.response?.body?.message || error.message;
    console.error('❌ Brevo email error:', error?.response?.body || error.message);
    throw new Error('Email sending failed: ' + brevoMsg);
  }
};

module.exports = sendEmail;
