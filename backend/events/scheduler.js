import cron from 'node-cron';
import deleteUserAccountsCronJob from './cronJobs.js';

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  await deleteUserAccountsCronJob();
  console.log('Cron job executed at midnight');
});
