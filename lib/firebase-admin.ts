import admin from "firebase-admin";

const serviceAccount = {
  projectId:
    process.env.APP_FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    process.env.FIREBASE_PROJECT_ID,
  clientEmail:
    process.env.APP_FIREBASE_CLIENT_EMAIL ??
    process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (
    process.env.APP_FIREBASE_PRIVATE_KEY ??
    process.env.FIREBASE_PRIVATE_KEY
  )?.replace(
    /\\n/g,
    "\n"
  ),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),

    storageBucket:
      process.env.APP_FIREBASE_STORAGE_BUCKET ??
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const adminDb = admin.firestore();

const bucket = admin.storage().bucket();

export {
  adminDb,
  bucket,
};
