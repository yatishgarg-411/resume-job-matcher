const express = require("express");
const cors = require("cors");
const matchRoute = require("./routes/matchRoute");

const app = express();

// Middleware MUST come BEFORE routes
app.use(cors());
app.use(express.json());
console.log("[app.js] Middleware initialized");
// Routes come AFTER middleware
app.use("/api", (req, res, next) => {
  console.log(`[app.js] Incoming request: ${req.method} ${req.originalUrl}`);
  next();
}, matchRoute);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});