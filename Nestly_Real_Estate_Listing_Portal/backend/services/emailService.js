const nodemailer = require("nodemailer");

let transporter = null;
let attemptedSetup = false;

// Real email sending via SMTP. Works with any provider (Gmail app
// password, SendGrid, Mailtrap, Ethereal for testing, etc.) -- just fill
// in SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in backend/.env.
// If those aren't set, we don't crash or silently pretend -- we log the
// full email to the console so the feature is still demonstrable end to
// end without real credentials.
function getTransporter() {
  if (attemptedSetup) return transporter;
  attemptedSetup = true;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendMail({ to, subject, html }) {
  const t = getTransporter();

  if (!t) {
    console.log("---- EMAIL NOT SENT (SMTP not configured in backend/.env) ----");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.log("Add SMTP_HOST / SMTP_USER / SMTP_PASS to backend/.env to send real emails.");
    console.log("----------------------------------------------------------------");
    return { simulated: true };
  }

  const info = await t.sendMail({
    from: process.env.SMTP_FROM || `"Nestly Alerts" <alerts@nestly.test>`,
    to,
    subject,
    html,
  });

  return { simulated: false, messageId: info.messageId };
}

module.exports = { sendMail };
