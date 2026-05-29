import admin from "firebase-admin";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  ),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),

    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const adminDb = admin.firestore();

const bucket = admin.storage().bucket();

export {
  adminDb,
  bucket,
};