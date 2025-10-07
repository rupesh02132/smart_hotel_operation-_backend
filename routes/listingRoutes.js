const express = require('express');
const {
  getListings,
  getListingById,
  createListing,
  createMultipleListings,
  updateListing,
  deleteListing,
  getAllListings
} = require('../controllers/listingController');
const authenticate = require('../middleware/authMiddleware'); 

const router = express.Router();

// Public routes
router.get('/', getListings);
router.get('/all', getAllListings);
router.get('/:id',authenticate, getListingById);


// Protected routes
router.post('/create',authenticate,createListing);
router.post('/createMultiple',authenticate,createMultipleListings);
router.put('/:id/update', authenticate, updateListing);
router.delete('/:id/delete', authenticate, deleteListing);

module.exports = router;
