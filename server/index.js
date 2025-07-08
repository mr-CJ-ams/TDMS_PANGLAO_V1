const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/build")));

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const submissionsRoutes = require("./routes/submissions");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/submissions", submissionsRoutes);

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.get('/api/test-error', (req, res, next) => {
  // This will trigger the error handler
  next(new Error('This is a test error!'));
});

// Add this at the very end, after all routes and other middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Optionally, include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});