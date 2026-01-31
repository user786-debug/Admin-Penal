const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables
require("./config/db"); // Initialize DB connection
const path = require("path");
const { version } = require("os");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const SupportManagersRoutes = require("./routes/supportManagersRoutes");
const starsManagersRoutes = require("./routes/starManagersRoutes");
const policyDocumentsRoutes = require("./routes/policyDocumentsRoutes");
const versionControlRoutes = require("./routes/versionControlRoutes");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin Panel API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/admin", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/SupportManager", SupportManagersRoutes);
app.use("/api/starManager", starsManagersRoutes);
app.use("/api/policyDocument", policyDocumentsRoutes);
app.use("/api/version", versionControlRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
