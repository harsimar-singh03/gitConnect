require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/database");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routers
const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const userRouter = require("./src/routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", userRouter);

const PORT = process.env.PORT || 7000;

connectDB()
  .then(() => {
    console.log("Database connection established successfully!");
  })
  .catch((err) => {
    console.error("Database connection failed: ", err.message);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});


