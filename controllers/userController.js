const userService = require("../service/userService");

const getUserProfile = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .send({ message: "Authorization header is missing.." });
    }

    const jwt = req.headers.authorization?.split(" ")[1];

    if (!jwt) {
      console.log("Authorization format incorrect:", req.headers.authorization);
      return res
        .status(404)
        .send({
          message: "JWT not found. Check if 'Bearer <token>' format is used.",
        });
    }

    const user = await userService.getUserProfileByToken(jwt);
    return res.status(200).send({ user });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await userService.getAllUser();
    return res.status(200).send({ users });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    if (user) {
      user.firstname = req.body.firstname || user.firstname;
      user.lastname = req.body.lastname || user.lastname;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();

    return res.status(200).send({ updatedUser });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.deleteUser(userId);
    return res.status(200).send({ user });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};


module.exports = { getUserProfile, getAllUser, updateUserProfile,deleteUserController };
