

const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();
var serviceAccount = require("../inventario-11b49-firebase-adminsdk-fbsvc-1f60b46431.json");

// Inicializa Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore(); // Acceso a Firestore

module.exports = { admin, db };
