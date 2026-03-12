const express = require("express");
const matchRoute = require("./routes/matchRoute");

const app = express();

app.use(express.json());

app.use("/api", matchRoute);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});