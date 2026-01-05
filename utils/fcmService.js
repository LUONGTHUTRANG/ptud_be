import admin from "firebase-admin";
import db from "../config/db.js";

// Initialize Firebase Admin (Ensure firebase-admin is configured with credentials)
// You need to set GOOGLE_APPLICATION_CREDENTIALS environment variable or initialize here

class FCMService {
  /**
   * Send push notification to a specific FCM token
   * @param {string} token - FCM device token
   * @param {object} notification - Notification object with title and body
   * @param {object} data - Additional data to send with notification
   */
  static async sendToToken(token, notification, data = {}) {
    try {
      if (!token) {
        console.log("No token provided for FCM");
        return null;
      }

      const message = {
        token,
        notification: {
          title: notification.title || "Thông báo",
          body: notification.body || "",
        },
        data,
        android: {
          priority: "high",
          notification: {
            sound: "default",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              alert: {
                title: notification.title || "Thông báo",
                body: notification.body || "",
              },
              sound: "default",
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            title: notification.title || "Thông báo",
            body: notification.body || "",
            icon: "/logo.png",
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log("FCM sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending FCM notification:", error);
      throw error;
    }
  }

  /**
   * Send push notifications to multiple tokens
   * @param {string[]} tokens - Array of FCM device tokens
   * @param {object} notification - Notification object with title and body
   * @param {object} data - Additional data to send
   */
  static async sendToTokens(tokens, notification, data = {}) {
    try {
      if (!tokens || tokens.length === 0) {
        console.log("No tokens provided");
        return null;
      }

      // Filter out empty tokens
      const validTokens = tokens.filter((t) => t && t.trim());

      if (validTokens.length === 0) return null;

      const message = {
        notification: {
          title: notification.title || "Thông báo",
          body: notification.body || "",
        },
        data,
        android: {
          priority: "high",
          notification: {
            sound: "default",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              alert: {
                title: notification.title || "Thông báo",
                body: notification.body || "",
              },
              sound: "default",
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            title: notification.title || "Thông báo",
            body: notification.body || "",
            icon: "/logo.png",
          },
        },
      };

      // Send to multiple tokens (Firebase allows max 500 per request)
      const response = await admin
        .messaging()
        .sendMulticast({ ...message, tokens: validTokens });

      console.log("FCM batch sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending FCM batch:", error);
      throw error;
    }
  }

  /**
   * Send notification to all students in a building
   * @param {number} buildingId
   * @param {object} notification
   * @param {object} data
   */
  static async sendToBuildingStudents(buildingId, notification, data = {}) {
    try {
      const query = `
        SELECT DISTINCT dft.fcm_token 
        FROM dormitory_fcm_tokens dft
        JOIN students s ON s.id = dft.student_id
        JOIN rooms r ON r.id = s.current_room_id
        WHERE r.building_id = ? AND dft.fcm_token IS NOT NULL
      `;

      const [results] = await db.query(query, [buildingId]);
      const tokens = results.map((r) => r.fcm_token);

      if (tokens.length === 0) {
        console.log("No FCM tokens found for building", buildingId);
        return null;
      }

      return await this.sendToTokens(tokens, notification, data);
    } catch (error) {
      console.error("Error sending to building students:", error);
      throw error;
    }
  }

  /**
   * Send notification to all students in a room
   * @param {number} roomId
   * @param {object} notification
   * @param {object} data
   */
  static async sendToRoomStudents(roomId, notification, data = {}) {
    try {
      const query = `
        SELECT DISTINCT dft.fcm_token 
        FROM dormitory_fcm_tokens dft
        JOIN students s ON s.id = dft.student_id
        WHERE s.current_room_id = ? AND dft.fcm_token IS NOT NULL
      `;

      const [results] = await db.query(query, [roomId]);
      const tokens = results.map((r) => r.fcm_token);

      if (tokens.length === 0) {
        console.log("No FCM tokens found for room", roomId);
        return null;
      }

      return await this.sendToTokens(tokens, notification, data);
    } catch (error) {
      console.error("Error sending to room students:", error);
      throw error;
    }
  }

  /**
   * Send notification to specific students
   * @param {number[]} studentIds
   * @param {object} notification
   * @param {object} data
   */
  static async sendToStudents(studentIds, notification, data = {}) {
    try {
      if (!studentIds || studentIds.length === 0) {
        console.log("No student IDs provided");
        return null;
      }

      const placeholders = studentIds.map(() => "?").join(",");
      const query = `
        SELECT DISTINCT dft.fcm_token 
        FROM dormitory_fcm_tokens dft
        WHERE dft.student_id IN (${placeholders}) AND dft.fcm_token IS NOT NULL
      `;

      const [results] = await db.query(query, studentIds);
      const tokens = results.map((r) => r.fcm_token);

      if (tokens.length === 0) {
        console.log("No FCM tokens found for students", studentIds);
        return null;
      }

      return await this.sendToTokens(tokens, notification, data);
    } catch (error) {
      console.error("Error sending to students:", error);
      throw error;
    }
  }

  /**
   * Send notification to all students (global)
   * @param {object} notification
   * @param {object} data
   */
  static async sendToAllStudents(notification, data = {}) {
    try {
      const query = `
        SELECT DISTINCT dft.fcm_token 
        FROM dormitory_fcm_tokens dft
        WHERE dft.fcm_token IS NOT NULL
      `;

      const [results] = await db.query(query);
      const tokens = results.map((r) => r.fcm_token);

      if (tokens.length === 0) {
        console.log("No FCM tokens found for any student");
        return null;
      }

      return await this.sendToTokens(tokens, notification, data);
    } catch (error) {
      console.error("Error sending to all students:", error);
      throw error;
    }
  }

  /**
   * Save or update FCM token for a student
   * @param {number} studentId
   * @param {string} token
   * @param {string} deviceType - 'web', 'android', 'ios'
   */
  static async saveToken(studentId, token, deviceType = "android") {
    try {
      const query = `
        INSERT INTO dormitory_fcm_tokens (student_id, fcm_token, device_type)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE fcm_token = ?, updated_at = NOW()
      `;

      await db.query(query, [studentId, token, deviceType, token]);
      console.log("FCM token saved for student", studentId);
      return true;
    } catch (error) {
      console.error("Error saving FCM token:", error);
      throw error;
    }
  }

  /**
   * Remove FCM token
   * @param {number} studentId
   * @param {string} token
   */
  static async removeToken(studentId, token) {
    try {
      const query =
        "DELETE FROM dormitory_fcm_tokens WHERE student_id = ? AND fcm_token = ?";
      await db.query(query, [studentId, token]);
      console.log("FCM token removed for student", studentId);
      return true;
    } catch (error) {
      console.error("Error removing FCM token:", error);
      throw error;
    }
  }

  /**
   * Get all tokens for a student
   * @param {number} studentId
   */
  static async getStudentTokens(studentId) {
    try {
      const query =
        "SELECT fcm_token FROM dormitory_fcm_tokens WHERE student_id = ?";
      const [results] = await db.query(query, [studentId]);
      return results.map((r) => r.fcm_token);
    } catch (error) {
      console.error("Error getting student tokens:", error);
      throw error;
    }
  }
}

export default FCMService;
