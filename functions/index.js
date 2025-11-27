/**
 * Import function triggers from their respective submodules:
 *
 * const {onRequest} = require("firebase-functions/https");
 * const {onCreateUser} = require("firebase-functions/v2/auth");
 *
 * See a full list of supported triggers at:
 * https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onCreateUser } = require("firebase-functions/v2/auth");
const { onRequest } = require("firebase-functions/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Limit the maximum number of function containers (optional)
setGlobalOptions({ maxInstances: 10 });

/**
 * HTTP example function (optional)
 */
exports.helloWorld = onRequest((req, res) => {
  logger.info("Hello logs!", { structuredData: true });
  res.send("Hello from Firebase!");
});

/**
 * Cloud Function: Trigger on new user signup
 * Automatically add new users to Firestore
 */
exports.addUserToFirestore = onCreateUser(async (user) => {
  try {
    await db.collection("users").doc(user.uid).set({
      name: user.displayName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
    });
    logger.info(`User ${user.uid} added to Firestore`);
  } catch (error) {
    logger.error("Error adding user to Firestore:", error);
  }
});
