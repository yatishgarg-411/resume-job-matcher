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

// Accept both resume PDF and optional JD PDF
router.post(
  "/match",
  upload.fields([{ name: "resume", maxCount: 1 }, { name: "jdFile", maxCount: 1 }]),
  matchController.matchResume
);

module.exports = router;