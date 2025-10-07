const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware'); 
const { createReview,getReviewByIdController,getAllReviewControll,deleteReviewController } = require('../controllers/reviewController');

router.post('/create',authenticate, createReview);
router.get('/',authenticate,getAllReviewControll)
router.get("/:id",authenticate, getReviewByIdController);
router.delete('/:id/delete',authenticate,deleteReviewController)

module.exports = router;