// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { register, login, me, refreshToken } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.post("/refresh-token", refreshToken);

module.exports = router;
