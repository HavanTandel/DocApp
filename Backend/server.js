console.log("Server file is running!");
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js"; // MongoDB connection
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/usersRoute.js";
import mongoose from "mongoose";
import path from "path";
// App setup
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middlewares

app.use(cors({
  origin: ["http://localhost:5174", "http://localhost:5175"],
  credentials: true
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());
// Routes
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Hello! Server is running smoothly. 😎");
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

//access image
app.use("/uploads",express.static("uploads"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
