import jwt from 'jsonwebtoken';
import { pool } from '../DB/connect.js';
import UnauthenticatedError from '../Errors/UnauthenticatedError.js';

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists
    const [user] = await pool.query('SELECT 1 FROM Users WHERE user_id = ?', [payload.user_id]);

    if (!user) {
      throw new UnauthenticatedError('Authentication invalid');
    }
    
    // Attach the user to the request object
    req.user = { id: payload.user_id };

    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

export default authenticateUser;