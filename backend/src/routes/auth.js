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

// GITHUB OAUTH API
authRouter.post("/auth/github", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      throw new Error("Authorization code is missing");
    }

    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new Error(tokenData.error_description || "Failed to obtain GitHub access token");
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "gitConnect-Backend",
      },
    });
    const profileData = await userResponse.json();

    // 3. Fetch user emails from GitHub (handles private email setups)
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "gitConnect-Backend",
      },
    });
    const emailsData = await emailsResponse.json();

    // Look for verified primary email
    let email = null;
    if (Array.isArray(emailsData)) {
      const primaryEmailObj = emailsData.find((e) => e.primary && e.verified);
      if (primaryEmailObj) {
        email = primaryEmailObj.email;
      }
    }

    // Fallback if no email is verified or found
    if (!email) {
      email = profileData.email || `${profileData.login}@github.com`;
    }

    // 4. Find or create the user in local DB
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Split display name or fallback to username login
      const displayName = profileData.name || profileData.login;
      const nameParts = displayName.split(" ");
      const firstName = nameParts[0] || "GitHub_User";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Generate a strong random password to pass schema validation
      const randomPassword = "GithubAuthPass@123$" + Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: passwordHash,
      });

      await user.save();
    }

    // 5. Create JWT session token
    const sessionToken = await user.getJWT();

    // 6. Set HTTP-Only Cookie
    res.cookie("token", sessionToken, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.send({ message: "Login successful via GitHub!", user });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = authRouter;
