const ReviewService=require("../service/reviewService");


const createReview = async (req, res) => {
    const user = req.user; 
    try {
        const review = await ReviewService.createReview(req.body, user);
        return res.status(200).send(review);
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};




const getReviewByIdController = async (req, res) => {
    try {
        const reviews = await ReviewService.getReviewbyId(req.params.id);
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        res.status(404).json({ message: error.message });
    }
};

const getAllReviewControll=async(req,res)=>{
    try{
        const review=await ReviewService.getAllReviews();
        res.status(200).json(review);
    }catch(err){
        res.status(404).json({message:err.message});
    }
};
 
const deleteReviewController=async(req,res)=>{
    try{
        const {id}=req.params;
        const review=await ReviewService.deleteReview(id);
        return res.status(200).send({review});

    }catch(err){
        return res.status(500).send({message:err.message});
    }
}

module.exports={
    createReview,
    getReviewByIdController,
    getAllReviewControll,
    deleteReviewController
};