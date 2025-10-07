const jwtProver=require("../utils/generateToken");
const userService = require("../service/userService");


const authenticate = async (req, res, next) => {
    // console.log("Headers received:", req.headers);
    
    try {
const token = req.headers.authorization.split(" ")[1];
if(!token){
    return res.status(401).send({ message: "Authorization header is missing" });
}
const userId=jwtProver.getUserIdFromToken(token);
const user=await userService.findUserById(userId);
if(!user){
    return res.status(401).send({ message: "User not found" });
}
req.user=user;
next();
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
   
};

// authMiddleware.js
module.exports = authenticate;
