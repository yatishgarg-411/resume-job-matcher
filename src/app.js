const express = require("express");
const cors = require("cors");
const matchRoute = require("./routes/matchRoute");

const app = express();

// Middleware MUST come BEFORE routes
app.use(cors());
app.use(express.json());

// Routes come AFTER middleware
app.use("/api", matchRoute);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});