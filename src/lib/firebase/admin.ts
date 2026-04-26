import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "{}"
    );

    if (serviceAccount.project_id) {
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // For development, if the key is missing, we might want to log a warning
      // but not crash the whole app immediately if the env var isn't set yet.
      console.warn("FIREBASE_SERVICE_ACCOUNT_JSON is missing or invalid.");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

const adminDb = admin.firestore ? admin.firestore() : null;

export { adminDb, admin };
