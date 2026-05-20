const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // clientId: process.env.FIREBASE_CLIENT_ID,
    // authUri: process.env.FIREBASE_AUTH_URI,
    // tokenUri: process.env.FIREBASE_TOKEN_URI,
    // authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    // clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    // universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

module.exports = { admin, db };