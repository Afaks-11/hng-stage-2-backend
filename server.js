require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./src/models/index");
const notFound = require("./src/middleware/notFound");
const globalErrorHandler = require("./src/middleware/errorHandler");
const countries = require("./src/routes/countries");
const countryRouter = require("./src/routes/countryRouter");

const app = express();

// Enable CORS for frontend (adjust domain if needed)
app.use(cors({ origin: "*" }));

// Parse incoming JSON requests
app.use(express.json());

// API routes (use specific prefixes to avoid conflicts)
app.use("/api", countries);
app.use("/api", countryRouter);

// Simple health check endpoint
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Error handling middlewares
app.use(notFound);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Ensure DB is connected
    await db.sequelize.authenticate();
    console.log("Database connection established successfully");

    // Avoid auto-altering schema in production
    await db.sequelize.sync();
    console.log("Models synchronized successfully");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
