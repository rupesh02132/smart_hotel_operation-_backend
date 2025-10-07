const express = require('express');
const {
  createBooking,
  getMyBookings,
  getHostBookings,
  getMyBookinsgById,
  deleteBooking,
  getAllBookingCotroller,
  getMyBookinsgBy_Id
} = require('../controllers/bookingController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/createbooking', authenticate, createBooking);
router.get('/mybookings', authenticate, getMyBookings);
router.get('/all', authenticate, getAllBookingCotroller);
router.get('/host', authenticate, getHostBookings);
router.get('/:bookingId', authenticate, getMyBookinsgById);
router.get('/booking/:booking_id', authenticate, getMyBookinsgBy_Id);
router.delete('/:bookingId', authenticate, deleteBooking);



module.exports = router;