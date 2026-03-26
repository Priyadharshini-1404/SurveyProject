const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // multer
const { verifyToken } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

// GET Profile
router.get("/profile", verifyToken, profileController.getProfile);

// UPDATE Profile
router.put("/", verifyToken, profileController.updateProfile);

// CHANGE PASSWORD
router.put("/change-password", verifyToken, profileController.changePassword);

// UPLOAD Profile Pic
router.post("/upload", verifyToken, upload.single("image"), profileController.uploadProfilePic);

module.exports = router;
