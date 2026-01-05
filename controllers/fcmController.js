import FCMTokenModel from "../models/fcmTokenModel.js";

export const saveFCMToken = async (req, res) => {
  try {
    const { fcmToken, deviceType = "android" } = req.body;
    const studentId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ error: "FCM token is required" });
    }

    await FCMTokenModel.saveToken(studentId, fcmToken, deviceType);

    res.json({
      message: "FCM token saved successfully",
      token: fcmToken,
    });
  } catch (err) {
    console.error("Error saving FCM token:", err);
    res.status(500).json({ error: err.message });
  }
};

export const removeFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const studentId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ error: "FCM token is required" });
    }

    await FCMTokenModel.removeToken(studentId, fcmToken);

    res.json({
      message: "FCM token removed successfully",
    });
  } catch (err) {
    console.error("Error removing FCM token:", err);
    res.status(500).json({ error: err.message });
  }
};

export const removeAllFCMTokens = async (req, res) => {
  try {
    const studentId = req.user.id;
    await FCMTokenModel.removeAllTokens(studentId);

    res.json({
      message: "All FCM tokens removed successfully",
    });
  } catch (err) {
    console.error("Error removing all FCM tokens:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMyFCMTokens = async (req, res) => {
  try {
    const studentId = req.user.id;
    const tokens = await FCMTokenModel.getStudentTokens(studentId);

    res.json({
      tokens,
      count: tokens.length,
    });
  } catch (err) {
    console.error("Error getting FCM tokens:", err);
    res.status(500).json({ error: err.message });
  }
};
