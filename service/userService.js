const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwtProvider = require("../utils/generateToken");

const createUser = async (userData) => {
  try {
    let { firstname, lastname, email, password, phone, role } = userData;
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      throw new Error("User already exist", email);
    }

    password = await bcrypt.hash(password, 10);
    const user = await User.create({ firstname, lastname, email, password, phone, role });

    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("user not found with this id", userId);
    }
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("user not found with this email", email);
    }
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};
// get by token
const getUserProfileByToken = async (token) => {
  try {
    const userId = jwtProvider.getUserIdFromToken(token);
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("user not found with this id", userId);
    }
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

// get all user

const getAllUser = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateUserProfile = async (userId, data) => {
  try {
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteUser=async(userId)=>{


  try {
    const user = await User.findByIdAndDelete(userId);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  createUser,
  findUserById,
  getUserByEmail,
  getUserProfileByToken,
  getAllUser,
  updateUserProfile,
  deleteUser
};
