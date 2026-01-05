import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  saveFCMToken,
  removeFCMToken,
  removeAllFCMTokens,
  getMyFCMTokens,
} from "../controllers/fcmController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Save/update FCM token
router.post("/save-token", saveFCMToken);

// Remove a specific FCM token
router.delete("/remove-token", removeFCMToken);

// Remove all FCM tokens (logout)
router.delete("/remove-all-tokens", removeAllFCMTokens);

// Get my FCM tokens
router.get("/my-tokens", getMyFCMTokens);

export default router;
