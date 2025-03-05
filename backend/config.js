const admin = require('firebase-admin');
require('dotenv').config();

var serviceAccount = require("../inventario-11b49-firebase-adminsdk-fbsvc-1f60b46431.json");

// Inicializa Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
//   credential: admin.credential.cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL
//   }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();
module.exports = db;
