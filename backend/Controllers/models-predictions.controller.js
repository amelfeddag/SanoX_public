import axios from 'axios';
import fetch from 'node-fetch';
import {pool} from '../DB/connect.js';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

const generateBusinessPlan = async (req, res) => {
  try {

    // Get the land_id from the request body
    const { land_id } = req.body;
    const user_id = req.user.id;

    // Send the model inputs to the FastAPI server
    const response = await axios.post('https://agrisistance-model-backend.onrender.com/generate-business-plan', {land_id});


    // Update history
    const action_id = uuidv4();
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Generate Business Plan', date]);

    // Return the response from the FastAPI server
    res.json(response.data);

  } catch (error) {
    console.error('Error communicating with FastAPI server', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const chatBot = async (req, res) => {
  const { message } = req.body;

  try {

    const response = await fetch('https://agrisistance-model-backend.onrender.com/chat', {  // Adjust the URL if needed
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          max_token: 100,
          temperature: 0.7,
          response_format: 'text/plain',
          user_id: 'agricultural_chatbot'  
      })
      
    });

    const data = await response.json();

    const result = data.response.messages[0].content

    res.status(StatusCodes.OK).json({ result });

  }catch (error) {
    console.error('Error communicating with FastAPI server', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export { generateBusinessPlan, chatBot };
