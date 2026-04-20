const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, admin } = require('../middleware/auth');

router.get('/', roomController.getAllRooms);
router.get('/available', roomController.getAvailableRooms);
router.get('/:id', roomController.getRoomById);

router.post('/', protect, admin, roomController.createRoom);
router.put('/:id', protect, admin, roomController.updateRoom);
router.delete('/:id', protect, admin, roomController.deleteRoom);

module.exports = router;
