const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ── Función para cargar credenciales ──────────────────────
function loadServiceAccount() {
  // 1. Variables de entorno (producción)
  if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_PROJECT_ID) {
    return {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
  }

  // 2. Archivo local (desarrollo)
  const posiblesRutas = [
    path.join(__dirname, '../../firebase-admin-key.json'), // backend/
    path.join(__dirname, './firebase-admin-key.json'),     // backend/src/config/
    path.join(__dirname, '../firebase-admin-key.json'),    // backend/src/
  ];

  for (const ruta of posiblesRutas) {
    if (fs.existsSync(ruta)) {
      console.log(`✅ Cargando credenciales desde: ${ruta}`);
      return JSON.parse(fs.readFileSync(ruta, 'utf8'));
    }
  }

  throw new Error('No se encontraron credenciales de Firebase.');
}

// ── Inicializar Firebase ────────────────────────────────────
let serviceAccount;
try {
  serviceAccount = loadServiceAccount();
} catch (error) {
  console.error('❌ Error cargando credenciales:', error.message);
  process.exit(1);
}

// Inicializar solo si no hay una instancia previa
if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin inicializado correctamente');
} else {
  console.log('ℹ️ Firebase Admin ya estaba inicializado');
}

const db = admin.firestore();

module.exports = { admin, db };