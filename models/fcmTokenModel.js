import db from "../config/db.js";

const FCMTokenModel = {
  // Save or update FCM token
  saveToken: async (studentId, fcmToken, deviceType = "android") => {
    const query = `
      INSERT INTO dormitory_fcm_tokens (student_id, fcm_token, device_type, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        fcm_token = ?, 
        device_type = ?,
        updated_at = NOW()
    `;

    const [result] = await db.query(query, [
      studentId,
      fcmToken,
      deviceType,
      fcmToken,
      deviceType,
    ]);

    return result;
  },

  // Get all tokens for a student
  getStudentTokens: async (studentId) => {
    const query = `
      SELECT id, fcm_token, device_type, created_at, updated_at
      FROM dormitory_fcm_tokens
      WHERE student_id = ? AND fcm_token IS NOT NULL
      ORDER BY updated_at DESC
    `;

    const [rows] = await db.query(query, [studentId]);
    return rows;
  },

  // Remove a specific token
  removeToken: async (studentId, fcmToken) => {
    const query = `
      DELETE FROM dormitory_fcm_tokens
      WHERE student_id = ? AND fcm_token = ?
    `;

    const [result] = await db.query(query, [studentId, fcmToken]);
    return result;
  },

  // Remove all tokens for a student (logout)
  removeAllTokens: async (studentId) => {
    const query = `
      DELETE FROM dormitory_fcm_tokens
      WHERE student_id = ?
    `;

    const [result] = await db.query(query, [studentId]);
    return result;
  },

  // Get tokens for multiple students
  getTokensByStudents: async (studentIds) => {
    if (!studentIds || studentIds.length === 0) return [];

    const placeholders = studentIds.map(() => "?").join(",");
    const query = `
      SELECT student_id, fcm_token
      FROM dormitory_fcm_tokens
      WHERE student_id IN (${placeholders}) AND fcm_token IS NOT NULL
    `;

    const [rows] = await db.query(query, studentIds);
    return rows;
  },

  // Get tokens for a building
  getTokensByBuilding: async (buildingId) => {
    const query = `
      SELECT DISTINCT dft.fcm_token
      FROM dormitory_fcm_tokens dft
      JOIN students s ON s.id = dft.student_id
      JOIN rooms r ON r.id = s.current_room_id
      WHERE r.building_id = ? AND dft.fcm_token IS NOT NULL
    `;

    const [rows] = await db.query(query, [buildingId]);
    return rows.map((r) => r.fcm_token);
  },

  // Get tokens for a room
  getTokensByRoom: async (roomId) => {
    const query = `
      SELECT DISTINCT dft.fcm_token
      FROM dormitory_fcm_tokens dft
      JOIN students s ON s.id = dft.student_id
      WHERE s.current_room_id = ? AND dft.fcm_token IS NOT NULL
    `;

    const [rows] = await db.query(query, [roomId]);
    return rows.map((r) => r.fcm_token);
  },

  // Get all active tokens
  getAllTokens: async () => {
    const query = `
      SELECT fcm_token
      FROM dormitory_fcm_tokens
      WHERE fcm_token IS NOT NULL
    `;

    const [rows] = await db.query(query);
    return rows.map((r) => r.fcm_token);
  },

  // Check if token exists
  tokenExists: async (fcmToken) => {
    const query = `
      SELECT id FROM dormitory_fcm_tokens
      WHERE fcm_token = ?
    `;

    const [rows] = await db.query(query, [fcmToken]);
    return rows.length > 0;
  },
};

export default FCMTokenModel;
