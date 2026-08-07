const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcryptjs");
const validator = require("validator");
const User = require("../models/user");

// SIGNUP API
authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, age, gender } = req.body;

    // Additional check for password length manually before hashing
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user object
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      age,
      gender,
    });

    await user.save();
    res.status(201).send("User registered successfully!");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// LOGIN API
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      throw new Error("Invalid credentials");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = await user.getJWT();

    // Set cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookie in production
    });

    res.send({ message: "Login successful!", user });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// LOGOUT API
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.send("Logout successful!");
});

module.exports = authRouter;
