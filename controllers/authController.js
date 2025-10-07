const userService = require("../service/userService");
const jwtProvider = require("../utils/generateToken");
const bcrypt = require("bcrypt");


const register = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    const jwt = jwtProvider.generateToken(user._id);
    return res.status(200).send({ jwt, message: "registered successfully" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//for login..

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }
    const jwt = jwtProvider.generateToken(user._id);
  return res.status(200).json({
    user: {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      email: user.email,
  
    },
    jwt,
    message: "login successful"
  });
  
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const logout = async (req, res) => {
    try{
        res.cookie("jwtProvider", "", {
            httpOnly: true,
            expires: new Date(0)
        })
        return res.status(200).send({ message: "logout successfully" });
    }
    catch(err){
        return res.status(500).send({ message: err.message });
    }
};

module.exports = { register, login ,logout};
