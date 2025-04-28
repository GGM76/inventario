const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

let serviceAccount;

if (process.env.GOOGLE_CREDENTIALS) {
  try {
    // Detecta si el contenido ya tiene \\n o solo \n
    const credString = process.env.GOOGLE_CREDENTIALS.includes('\\n')
      ? process.env.GOOGLE_CREDENTIALS.replace(/\\n/g, '\n') // Render u otros
      : process.env.GOOGLE_CREDENTIALS;                     // Local mal configurado

    serviceAccount = JSON.parse(credString);
  } catch (err) {
    console.error("❌ Error al parsear GOOGLE_CREDENTIALS:", err);
    process.exit(1);
  }
} else {
  // Entorno local seguro con archivo JSON
  serviceAccount = require('../inventario-11b49-firebase-adminsdk-fbsvc-2631f257be.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

module.exports = { admin, db };
