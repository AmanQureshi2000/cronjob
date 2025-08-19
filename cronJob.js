const cron = require('node-cron');
const { sendActiveUsersReport } = require('./sendActiveUsers');

// Schedule to run daily at 9:00 AM
cron.schedule('0 20 * * *', async () => {
    console.log('Running daily active users report...');
    await sendActiveUsersReport();
}, {
    timezone: "Asia/Kolkata" // Adjust to your timezone
});

console.log('Cron job scheduled: Daily active users report at 9:00 AM');