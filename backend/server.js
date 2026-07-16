const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./src/config/db");
// Connect to database
connectDB();

const app = express();

// Frontend static files
app.use(
  express.static(path.join(__dirname, "dist"), {
    setHeaders: (res, path, stat) => {
      if (path.endsWith(".html")) {
        // Prevent caching of index.html so users always get the latest version
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      } else {
        // Cache static assets (JS, CSS, images) for 1 year since Vite hashes filenames
        res.setHeader("Cache-Control", "public, max-age=31536000");
      }
    },
  })
);

// Security: Helmet sets secure HTTP headers
app.use(helmet());

// Middleware
app.use(express.json());

// Security: Restrict CORS to the configured frontend origin
const allowedOrigins = process.env.CLIENT_URL
  ? [
      ...process.env.CLIENT_URL.split(","),
      "http://localhost:5000",
      "https://fyp-smart-fuel-optimization-resourc.vercel.app",
    ]
  : [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://fyp-smart-fuel-optimization-resourc.vercel.app",
    ];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(
        new Error(`CORS policy does not allow access from origin: ${origin}`),
      );
    },
    credentials: true,
  }),
);

// Security: Sanitize request data to prevent MongoDB Operator Injection
// We use a custom middleware because express-mongo-sanitize's default middleware
// reassigns req.query which is read-only in Express 5.
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.headers) mongoSanitize.sanitize(req.headers);
  next();
});

// Security: Prevent XSS attacks
const xssClean = require("./src/middlewares/xss.middleware");
app.use(xssClean);

// Serve static files for uploaded receipts
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/organizations", require("./src/routes/org.routes"));
app.use("/api/vehicles", require("./src/routes/vehicle.routes"));
app.use("/api/maintenance", require("./src/routes/maintenance.routes"));
app.use("/api/fuel", require("./src/routes/fuel.routes"));
app.use("/api/trips", require("./src/routes/trip.routes"));
app.use("/api/budgets", require("./src/routes/budget.routes"));
app.use("/api/dashboard", require("./src/routes/dashboard.routes"));
app.use("/api/notifications", require("./src/routes/notification.routes"));
app.use("/api/reports", require("./src/routes/report.routes"));
app.use("/api/routes", require("./src/routes/route.routes"));

// Return 404 for missing static assets to prevent serving index.html for old JS/CSS files
app.use("/assets", (req, res) => {
  res.status(404).send("Not found");
});

// React/Vite catch-all route (must be after all API routes)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"), {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
});

// Global error handler
app.use(require("./src/middlewares/error.middleware"));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
    );
  });
}

module.exports = app;
