const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Gmail address
        pass: process.env.EMAIL_PASS   // App password from Gmail
    },
    secure: true,  // Ensure secure connection (TLS/SSL)
    debug: true    // Enable debugging to log more details
});

const sendMail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to ' + to);
    } catch (err) {
        console.error('Error sending email:', err.message);
        throw new Error('Failed to send email');
    }
};

module.exports = sendMail;
