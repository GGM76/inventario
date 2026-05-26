const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, './serviceAccount.json');

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const db = admin.firestore();

module.exports = { admin, db };
//const serviceAccount = require('/etc/secrets/firebaseacc.json');