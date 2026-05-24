require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ===============================
// Global Plugin Setup
// ===============================
mongoose.plugin(require("./models/trashPlugin"));

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Health Check Route (Render)
// ===============================
app.get("/healthz", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// ===============================
// Route Imports
// ===============================
const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const billRoutes = require("./routes/billRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const seedRoutes = require("./routes/seedRoutes");
const dailyLogRoutes = require("./routes/dailyLogRoutes");
const staffRoutes = require("./routes/staffRoutes");
const searchRoutes = require("./routes/searchRoutes");
const patientRoutes = require("./routes/patientRoutes");
const trashRoutes = require("./routes/trashRoutes");
const rentRoutes = require("./routes/rentRoutes");

// ===============================
// API Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/dailylog", dailyLogRoutes);
app.use("/api/salary", staffRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/rent", rentRoutes);

// ===============================
// Root Route
// ===============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Laxmi Health Clinic API Running Successfully",
  });
});

// ===============================
// Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ===============================
// Database Connection + Server Start
// ===============================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");

    app.listen(PORT, () => {
      console.log(`[Production Level Server] Active on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
