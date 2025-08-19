const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendActiveUsersReport() {
    try {
        // Database connection
        const pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            ssl: {
                rejectUnauthorized: false // Required for Render PostgreSQL
            }
        });

        // Query active users
        const query = `
            SELECT id, username, email, first_name, last_name, 
                   is_verified, created_at 
            FROM users 
            WHERE is_active = true 
            ORDER BY id ASC
        `;

        const result = await pool.query(query);
        const activeUsers = result.rows;
        
        await pool.end();

        // If no active users, don't send email
        if (activeUsers.length === 0) {
            console.log('No active users found.');
            return;
        }

        // Create email content
        const emailContent = createEmailContent(activeUsers);
        
        // Send email
        await sendEmail(
            process.env.EMAIL_TO,
            'Daily Active Users Report',
            emailContent
        );

        console.log(`Active users report sent successfully to ${process.env.EMAIL_TO}`);
        
    } catch (error) {
        console.error('Error sending active users report:', error);
    }
}

function createEmailContent(users) {
    let content = `
        <h2>Daily Active Users Report</h2>
        <p>Total Active Users: <strong>${users.length}</strong></p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Verified</th>
                    <th>Join Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    users.forEach(user => {
        content += `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.is_verified ? 'Yes' : 'No'}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
        `;
    });

    content += `
            </tbody>
        </table>
        <br>
        <p><em>Report generated on: ${new Date().toLocaleString()}</em></p>
    `;

    return content;
}

async function sendEmail(to, subject, htmlContent) {
    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: htmlContent
    };

    // Send email
    await transporter.sendMail(mailOptions);
}

// Run if called directly
if (require.main === module) {
    sendActiveUsersReport();
}

module.exports = { sendActiveUsersReport };