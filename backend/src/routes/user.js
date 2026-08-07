const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");

// SEARCH USER BY FIRSTNAME (using query parameters)
userRouter.get("/user", async (req, res) => {
  try {
    const firstName = req.query.firstName;
    if (!firstName) {
      return res.status(400).send("firstName query parameter is required");
    }

    const users = await User.find({ firstName: firstName });
    if (users.length === 0) {
      return res.status(404).send("User not found");
    }

    res.send(users);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// GET FEED (All users)
userRouter.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// DELETE USER BY FIRSTNAME (using query parameters)
userRouter.delete("/user", async (req, res) => {
  try {
    const firstName = req.query.firstName;
    if (!firstName) {
      return res.status(400).send("firstName query parameter is required");
    }

    const deleteResult = await User.deleteOne({ firstName: firstName });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).send("User not found or already deleted");
    }

    res.send("User deleted successfully!");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;
