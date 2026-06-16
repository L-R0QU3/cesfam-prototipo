// backend/src/config/firebase.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ── Verificar instalación ──────────────────────────────────
if (!admin || typeof admin.initializeApp !== 'function') {
  console.error('❌ firebase-admin no se cargó correctamente.');
  console.error('   Ejecuta: pnpm add firebase-admin');
  process.exit(1);
}

// ── Función para cargar credenciales ──────────────────────
function loadServiceAccount() {
  // 1. Variables de entorno (producción)
  if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_PROJECT_ID) {
    console.log('🔐 Usando credenciales de entorno (producción)');
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

// ── Método 1: admin.credential.cert (estándar) ────────────
if (admin.credential && typeof admin.credential.cert === 'function') {
  if (!admin.apps || admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin inicializado (método estándar)');
    } catch (error) {
      console.error('❌ Error en inicialización estándar:', error.message);
      process.exit(1);
    }
  } else {
    console.log('ℹ️ Firebase Admin ya estaba inicializado');
  }
} else {
  // ── Método 2: Usar módulo credential separado (firebase-admin >= 11) ──
  console.log('ℹ️ admin.credential no disponible, usando módulo credential...');
  try {
    const credential = require('firebase-admin/credential');
    if (!admin.apps || admin.apps.length === 0) {
      admin.initializeApp({
        credential: credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin inicializado (módulo credential)');
    }
  } catch (err) {
    console.error('❌ Error cargando firebase-admin/credential:', err.message);
    console.error('   Asegúrate de tener instalada la versión correcta: pnpm add firebase-admin@11.11.0');
    process.exit(1);
  }
}

// ── Verificar que la inicialización fue exitosa ────────────
if (!admin.firestore) {
  console.error('❌ Firebase no se inicializó correctamente');
  process.exit(1);
}

const db = admin.firestore();
console.log('✅ Firestore listo para usar');

module.exports = { admin, db };