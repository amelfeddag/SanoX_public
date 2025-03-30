import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import {pool} from '../DB/connect.js';
import { v2 as cloudinary } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';
import { extractPublicId, deleteImageFromCloudinary } from './Utils/cloudinaryDelete.js';

dotenv.config();

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


/****************************************************************************************************************************************************** */

const addLand = async (req, res) => {

    const { latitude, longitude, land_size, land_name, land_image, ph_level, phosphorus, potassium, oxygen_level, nitrogen, budget } = req.body;
    const user_id = req.user.id;

    var land_img = null;

    // Upload image to cloudinary
    if (land_image) {
      const uploadResult = await cloudinary.uploader.upload(land_image, { folder: 'Agrisistance/Land-Pictures' });
      land_img = uploadResult.secure_url;
    }
    
    

    // Get weather from API
    const options = {
      method: 'GET',
      headers: {
          accept: 'application/json'
      }
    };

    const locationURL = `https://api.tomorrow.io/v4/weather/realtime?location=${latitude},${longitude}&units=metric&apikey=${process.env.TOMMOROW_API_KEY}`; 
    const response = await fetch (locationURL , options);
    const data = await response.json();

    
    const { temperature, humidity, precipitationProbability, uvIndex } = data.data.values;


    // Insert data into the database
    const sql = `INSERT INTO Land_Data VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
      const land_id = uuidv4();
      const financial_id = uuidv4();
      await pool.query(sql, [land_id, latitude, longitude, land_size, land_name, land_img, ph_level, phosphorus, potassium, oxygen_level, nitrogen, user_id]);

      // Insert financial data
      await pool.query (`INSERT INTO Financial_Data (financial_id, investment_amount, land_id) VALUES (?, ?, ?)`, [financial_id, budget,land_id]);

      // Insert weather data
      const weather_id = uuidv4();
      await pool.query(`INSERT INTO Weather_Data VALUES (?, ?, ?, ?, ?, ?)`, [weather_id, temperature, humidity, precipitationProbability, uvIndex, land_id]);
     

      // Update history
      const action_id = uuidv4();
      const currentTimestamp = Date.now();
      const date = new Date(currentTimestamp);
      await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Add Land', date]);

      res.status(StatusCodes.CREATED).json({ message: 'Land added successfully', land_id : land_id });

    } catch (error) {

      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

    }

};

/****************************************************************************************************************************************************** */


const updateLand = async (req, res) => {

  const { latitude, longitude, land_size, land_name, land_image, ph_level, phosphorus, potassium, oxygen_level, nitrogen, humidity, budget } = req.body;
  const { land_id } = req.params;
  const user_id = req.user.id;

  var land_img = null;

  // check if there is an image to update
  if (land_image) {
    const [result] = await pool.query('SELECT land_image FROM land_data WHERE land_id = ?', [land_id]);

    if (result[0].land_image) {
        const publicId = extractPublicId(userRows[0].profile_picture);
        if (publicId) {
            await deleteImageFromCloudinary(publicId, 'Land-Pictures');
        }
    }
    
    const uploadResult = await cloudinary.uploader.upload(land_image, { folder: 'Agrisistance/Land-Pictures' });
    land_img = uploadResult.secure_url;
  }

  

  try {
    // Update data in the database
    const sql = `UPDATE Land_Data SET latitude = ?, longitude = ?, land_size = ?, land_name = ?, land_image = ?, ph_level = ?, phosphorus = ?, potassium = ?, oxygen_level = ?, nitrogen = ?
    WHERE land_id = ? AND user_id = ?`;
    await pool.query(sql, [latitude, longitude, land_size, land_name, land_img, ph_level, phosphorus, potassium, oxygen_level, nitrogen, land_id, user_id]);

    await pool.query (`UPDATE Financial_Data SET investment_amount = ? WHERE land_id = ?`, [budget, land_id]);
    await pool.query (`UPDATE Weather_Data SET humidity = ? WHERE land_id = ?`, [humidity, land_id]);

    const response = await axios.post('https://agrisistance-model-backend.onrender.com/generate-business-plan', {land_id});

    // Update history
    const actions_id = uuidv4();
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[actions_id, user_id, 'Update Land', date]);

    //TODO : predict again

    res.status(StatusCodes.OK)
    .json({ message: 'Land updated successfully', 
      land_id : land_id , 
      businessplan : response
    });
  
  } catch (error) {

    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

  }

};


/****************************************************************************************************************************************************** */


const getLandbyID = async (req, res) => {
  const { land_id } = req.params;
  const user_id = req.user.id;

  try {

    // Fetch data concurrently from multiple tables
    const weather = await pool.query('SELECT * FROM Weather_Data WHERE land_id = ?', [land_id]);
    const crop_types = await pool.query('SELECT * FROM Crop_Data WHERE land_id = ?', [land_id]);
    const land = await pool.query('SELECT * FROM Land_Data WHERE land_id = ? AND user_id = ?', [land_id, user_id]);
    const land_statistics = await pool.query('SELECT * FROM Land_Statistics WHERE land_id = ?', [land_id]);
    const crop_maintenance = await pool.query('SELECT * FROM Crop_Maintenance WHERE land_id = ?', [land_id]);
    const finance = await pool.query('SELECT * FROM Financial_Data WHERE land_id = ?', [land_id]);

    const business_plan = await pool.query('SELECT * FROM Business_Plans WHERE land_id = ?', [land_id]);

    // Return the data in JSON format
    res.status(StatusCodes.OK).json({
      crops: crop_types[0],
      land: land[0],
      crop_maintenance: crop_maintenance[0],
      weather: weather[0],
      land_statistics: land_statistics[0],
      finance: finance[0],
      business_plan: business_plan[0],
    });

  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};




/****************************************************************************************************************************************************** */


const getAllLands = async (req, res) => {

  const user_id = req.user.id;

  try{
    // Fetch all lands of the user
    const [result] = await pool.query('SELECT * FROM Land_Data WHERE user_id = ?', [user_id])
    res.status(StatusCodes.OK).json({result, });

  } catch (error) {

    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

  }
};


/****************************************************************************************************************************************************** */


// TODO: make hierarichal deletion and maybe not delete it but migrate it to another database

const deleteLand = async (req, res) => {

  const { land_id } = req.params;
  const user_id = req.user.id;

  try {

    // Check if there is an image to delete
    const [result] = await pool.query('SELECT land_image FROM Land_Data WHERE land_id = ?', [land_id]);
    if (result[0].land_image !== null) {
      const publicId = extractPublicId(userRows[0].profile_picture);
      if (publicId) {
          await deleteImageFromCloudinary(publicId, 'Land-Pictures');
      }
    }

    // Delete land
    
    await pool.query(`DELETE FROM Financial_Data WHERE land_id = ?`, [land_id]);
    await pool.query(`DELETE FROM Weather_Data WHERE land_id = ?`, [land_id]);
    await pool.query(`DELETE FROM Crop_Maintenance WHERE land_id = ?`, [land_id]);
    await pool.query(`DELETE FROM Crop_Data WHERE land_id = ?`, [land_id]);
    await pool.query(`DELETE FROM Business_Plans WHERE land_id = ?`, [land_id]);
    await pool.query(`DELETE FROM Land_Statistics WHERE land_id = ?`, [land_id]);
    await pool.query(`DELETE FROM Land_Data WHERE land_id = ? AND user_id = ?`, [land_id, user_id]);

    // Update history
    const action_id = uuidv4();
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Delete Land', date]);

    res.status(StatusCodes.OK).json({ message: 'Land deleted successfully' });

  } catch (error) {

    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

  }

};

export { addLand, updateLand, getLandbyID, getAllLands, deleteLand };
