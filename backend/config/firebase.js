// const admin = require('firebase-admin');
// const dotenv = require('dotenv');
// dotenv.config();

// let serviceAccount;

// if (process.env.GOOGLE_CREDENTIALS) {
//   try {
//     const fixedCredentials = process.env.GOOGLE_CREDENTIALS.replace(/__LINE__/g, '\n');
//     serviceAccount = JSON.parse(fixedCredentials);
//   } catch (err) {
//     console.error("❌ Error al parsear GOOGLE_CREDENTIALS:", err);
//     process.exit(1);
//   }
// } else {
//   serviceAccount = require('../inventario-11b49-firebase-adminsdk-fbsvc-2631f257be.json');
// }

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
// });

// const db = admin.firestore();

// module.exports = { admin, db };
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

module.exports = { admin, db };
