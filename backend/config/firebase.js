//config/firebase.js
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const serviceAccount = require('/etc/secrets/inventario-11b49-firebase-adminsdk-fbsvc-2631f257be.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});


const db = admin.firestore();

module.exports = { admin, db };
