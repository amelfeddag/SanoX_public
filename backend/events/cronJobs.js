import { pool, deletion_pool } from '../DB/connect.js';
import sendEmail from '../Controllers/Utils/sendEmail.js';


const deleteUserAccountsCronJob = async () => {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  
      // Select users whose deletion was requested more than 3 days ago
      const [users] = await pool.query('SELECT user_id, email FROM Users WHERE deletion_requested_at IS NOT NULL AND deletion_requested_at <= ?', [threeDaysAgo]);
  
      for (const user of users) {
        // Check if user has logged in during the 3-day period
        const [result] = await pool.query('SELECT last_login FROM Users WHERE user_id = ?', [user.user_id]);
        if (result[0].last_login && result[0].last_login > threeDaysAgo) {
          console.log(`Deletion aborted for user ${user.user_id} due to recent login`);
          continue;
        }
  
        // Delete the user account and his data    
        const [history, financial_data, yield_predictions, crop_types, pest_data, recommendations, weather_data, land_data, users ] = await Promise.all([
          pool.query('SELECT * FROM history WHERE user_id = ?', [user.user_id]),
          pool.query('SELECT * FROM financial_data WHERE user_id = ?', [user.user_id]),
          pool.query('SELECT * FROM weather_data WHERE user_id = ?', [user.user_id]),
          pool.query('SELECT * FROM crop_types WHERE user_id = ?', [user.user_id]),
          pool.query('SELECT * FROM crop_maintenance WHERE user_id = ?', [user.user_id]),      
          pool.query('SELECT * FROM land_statistics WHERE user_id = ?', [user.user_id]),
          pool.query('SELECT * FROM land_data WHERE user_id = ?', [user.user_id]),
          pool.query('SELECT * FROM users WHERE user_id = ?', [user.user_id])
      ]);

        // Insert the deleted data into the deletion database
        await Promise.all([
          deletion_pool.query('INSERT INTO history VALUES ?', [history]),
          deletion_pool.query('INSERT INTO finanical_data VALUES ?', [financial_data]),
          deletion_pool.query('INSERT INTO crop_maintenance VALUES ?', [yield_predictions]),
          deletion_pool.query('INSERT INTO crop_types_deleted VALUES ?', [crop_types]),
          deletion_pool.query('INSERT INTO land_statistics VALUES ?', [recommendations]),
          deletion_pool.query('INSERT INTO weather_data VALUES ?', [weather_data]),
          deletion_pool.query('INSERT INTO land_data VALUES ?', [land_data]),
          deletion_pool.query('INSERT INTO users VALUES ?', [users])
      ]);


        await Promise.all([
          pool.query('DELETE FROM history WHERE user_id = ?', [user.user_id]),
          pool.query('DELETE FROM financial_data WHERE user_id = ?', [user.user_id]),
          pool.query('DELETE FROM crop_maintenance WHERE user_id = ?', [user.user_id]),
          pool.query('DELETE FROM crop_types WHERE user_id = ?', [user.user_id]),
          pool.query('DELETE FROM weather_data WHERE user_id = ?', [user.user_id]),
          pool.query('DELETE FROM land_statistics WHERE user_id = ?', [user.user_id]),
          pool.query('DELETE FROM land_data WHERE user_id = ?', [user.user_id]),
          pool.query('DELETE FROM users WHERE user_id = ?', [user.user_id])
      ]);
  
        // Send deletion confirmation email
        await sendEmail(user.email, '', 'successdeletion');
      }
    } catch (error) {
      console.error('Error during account deletion cron job:', error);
    }
};
  
  export default deleteUserAccountsCronJob;
