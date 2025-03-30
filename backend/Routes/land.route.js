import express from 'express';
import { addLand, updateLand, getLandbyID, getAllLands, deleteLand } from '../Controllers/land.controller.js';
import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/add-land' ,authenticateUser, addLand);
router.put('/update-land/:land_id' ,authenticateUser, updateLand);
router.get('/get-land/:land_id' ,authenticateUser, getLandbyID);
router.get('/your-lands' ,authenticateUser, getAllLands);
router.delete('/delete-land/:land_id' ,authenticateUser, deleteLand);

export default router;