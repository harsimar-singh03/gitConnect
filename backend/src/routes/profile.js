const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

// VIEW PROFILE API
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// EDIT PROFILE API
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const allowedFields = ["firstName", "lastName", "age", "gender"];
    const isUpdateAllowed = Object.keys(req.body).every((field) =>
      allowedFields.includes(field)
    );

    if (!isUpdateAllowed) {
      throw new Error("Invalid edit parameters");
    }

    const user = req.user;
    Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));

    await user.save();
    res.json({
      message: `${user.firstName}, your profile updated successfully!`,
      data: user,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
