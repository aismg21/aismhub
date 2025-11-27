const path = require("path");
const admin = require("firebase-admin");

// Absolute path से serviceAccount JSON load करें
const serviceAccountPath = path.resolve(__dirname, "../serviceAccountKey.json");
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function populateUsers() {
  try {
    const listUsersResult = await admin.auth().listUsers();
    console.log(`Found ${listUsersResult.users.length} users.`);

    for (const userRecord of listUsersResult.users) {
      const userDocRef = db.collection("users").doc(userRecord.uid);
      await userDocRef.set(
        {
          name: userRecord.displayName || "",
          email: userRecord.email || "",
          phone: userRecord.phoneNumber || "",
        },
        { merge: true }
      );
      console.log(`User ${userRecord.uid} saved/updated in Firestore`);
    }

    console.log("✅ All users populated successfully!");
  } catch (error) {
    console.error("❌ Error populating users:", error);
  }
}

populateUsers();
