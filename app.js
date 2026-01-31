const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables
const path = require("path");

// Import DB and models
const sequelize = require("./config/db"); // Your Sequelize instance
const Admin = require("./models/admins");
const VersionControl = require("./models/versionControl");
const User = require("./models/users");
const SupportManager = require("./models/supportManagers");
const Manager = require("./models/starsManagers");
const Star = require("./models/Star");
const PolicyDocument = require("./models/policyDocuments");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const SupportManagersRoutes = require("./routes/supportManagersRoutes");
const starsManagersRoutes = require("./routes/starManagersRoutes");
const policyDocumentsRoutes = require("./routes/policyDocumentsRoutes");
const versionControlRoutes = require("./routes/versionControlRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin Panel API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/admin", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/SupportManager", SupportManagersRoutes);
app.use("/api/starManager", starsManagersRoutes);
app.use("/api/policyDocument", policyDocumentsRoutes);
app.use("/api/version", versionControlRoutes);

// Sync tables and start server
async function startServer() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");

    console.log("📦 Creating tables...");

    // Create tables individually to log each step
    await Admin.sync({ alter: true });
    console.log('✅ Table "admins" created/updated');

    await VersionControl.sync({ alter: true });
    console.log('✅ Table "version_control" created/updated');

    await User.sync({ alter: true });
    console.log('✅ Table "users" created/updated');

    await SupportManager.sync({ alter: true });
    console.log('✅ Table "Supportmanagers" created/updated');

    await Manager.sync({ alter: true });
    console.log('✅ Table "managers" created/updated');

    await Star.sync({ alter: true });
    console.log('✅ Table "stars" created/updated');

    await PolicyDocument.sync({ alter: true });
    console.log('✅ Table "policydocuments" created/updated');

    console.log("🎉 All tables created/updated successfully!");

    // Start server after DB ready
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error connecting to database or creating tables:", error);
    process.exit(1);
  }
}

startServer();











// const express = require("express");
// const bodyParser = require("body-parser");
// require("dotenv").config(); // Load environment variables
// require("./config/db"); // Initialize DB connection
// const path = require("path");
// const { version } = require("os");
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const SupportManagersRoutes = require("./routes/supportManagersRoutes");
// const starsManagersRoutes = require("./routes/starManagersRoutes");
// const policyDocumentsRoutes = require("./routes/policyDocumentsRoutes");
// const versionControlRoutes = require("./routes/versionControlRoutes");
// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(bodyParser.json());

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Admin Panel API is running 🚀",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Routes
// app.use("/api/admin", authRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/SupportManager", SupportManagersRoutes);
// app.use("/api/starManager", starsManagersRoutes);
// app.use("/api/policyDocument", policyDocumentsRoutes);
// app.use("/api/version", versionControlRoutes);

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
