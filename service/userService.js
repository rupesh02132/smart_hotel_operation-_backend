const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwtProvider = require("../utils/generateToken");

const createUser = async (userData) => {
  try {
    let { firstname, lastname, email, password, phone, role } = userData;

    // normalize email
    email = email.toLowerCase();

     // ✅ Password Complexity Check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      role: role || "user",
    });

    return user;
  } catch (err) {
    console.error("CREATE USER ERROR:", err.message);
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

const getUserByEmailWithPassword = async (email) => {
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("user not found with this email", email);
    }
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const findByPhone = async (phone) => {
  return await User.findOne({ phone });
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

const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};




const updateAvatarService = async (userId, file) => {
  console.log("file:", file);
  if (!file) {
    throw new Error("No image uploaded");
  }

  /* Cloudinary or local path */
  const avatarUrl =
    file.path || file.secure_url;

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.avatar = avatarUrl;
  console.log("user.avatar:", user.avatar);
  await user.save();

  return user;
};



module.exports = {
  createUser,
  findUserById,
  getUserByEmail,
  getUserProfileByToken,
  getAllUser,
  updateUserProfile,
  deleteUser,
  getUserByEmailWithPassword,
  findByPhone,
  updateAvatarService,
};
