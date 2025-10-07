const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const {
  getUserProfile,
  getAllUser,
  updateUserProfile,
  deleteUserController
} = require('../controllers/userController');

// Public routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/signup', register);

// Protected routes
router.get('/profile', authenticate, getUserProfile);
router.get('/users', authenticate, getAllUser);
router.put('/updateProfile', authenticate, updateUserProfile);
router.delete('/:userId', authenticate, deleteUserController);


module.exports = router;
