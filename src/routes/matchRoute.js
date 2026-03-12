const express = require("express");
const router = express.Router();
const multer = require("multer");
const matchController = require("../controllers/matchControllers");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/match", upload.single("resume"), matchController.matchResume);

module.exports = router;