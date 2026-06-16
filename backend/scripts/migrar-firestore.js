// backend/scripts/migrar-firestore.js
// Ejecutar con: node scripts/migrar-firestore.js

const { Pool } = require('pg');
const { db, admin } = require('../src/config/firebase');
const dotenv = require('dotenv');
const path = require('path');

// ── Cargar .env ──────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env');
console.log(`📄 Cargando variables desde: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error cargando .env:', result.error.message);
  process.exit(1);
}

console.log(`✅ Variables cargadas: ${Object.keys(process.env).filter(k => !k.startsWith('_')).length} disponibles`);
console.log(`🔑 DATABASE_URL: ${process.env.DATABASE_URL ? 'Definida ✅' : '❌ No definida'}`);

// ── Conexión PostgreSQL ────────────────────────────────────
let connectionConfig;
if (process.env.DATABASE_URL) {
  connectionConfig = { connectionString: process.env.DATABASE_URL };
} else {
  connectionConfig = {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'cesfam_db',
  };
}

console.log(`📊 Configuración PostgreSQL:`);
console.log(`   Host: ${connectionConfig.host || connectionConfig.connectionString?.split('@')[1]?.split(':')[0] || 'localhost'}`);
console.log(`   Database: ${connectionConfig.database || 'cesfam_db'}`);

const pgPool = new Pool(connectionConfig);

// ── Utilidades ─────────────────────────────────────────────
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);
const errorLog = (msg) => console.error(`❌ ${msg}`);

// ── Función para migrar una tabla ──────────────────────────
async function migrarTabla(nombreColeccion, querySQL, transformFn = null) {
  try {
    log(`Migrando ${nombreColeccion}...`);
    const result = await pgPool.query(querySQL);
    const rows = result.rows;
    log(`  → ${rows.length} registros encontrados`);

    let count = 0;
    for (const row of rows) {
      let data = { ...row };
      delete data.id;
      if (transformFn) {
        data = transformFn(data, row);
      }
      // Convertir fechas a Timestamp de Firestore
      for (const key of Object.keys(data)) {
        if (data[key] instanceof Date) {
          data[key] = admin.firestore.Timestamp.fromDate(data[key]);
        }
      }
      await db.collection(nombreColeccion).doc(String(row.id)).set(data);
      count++;
      if (count % 50 === 0) log(`    → ${count} documentos migrados...`);
    }
    log(`✅ ${nombreColeccion}: ${count} documentos migrados`);
    return count;
  } catch (error) {
    errorLog(`Error migrando ${nombreColeccion}: ${error.message}`);
    return 0;
  }
}

// ── Transformaciones ────────────────────────────────────────
const transformPrograma = (data, row) => {
  data.created_at = row.created_at || new Date();
  data.updated_at = row.updated_at || new Date();
  return data;
};

const transformPosta = (data, row) => {
  data.created_at = row.created_at || new Date();
  data.updated_at = row.updated_at || new Date();
  return data;
};

const transformNoticia = (data, row) => {
  data.created_at = row.created_at || new Date();
  data.updated_at = row.updated_at || new Date();
  return data;
};

const transformAlerta = (data, row) => {
  data.created_at = row.created_at || new Date();
  data.updated_at = row.updated_at || new Date();
  return data;
};

const transformBanner = (data, row) => {
  data.created_at = row.created_at || new Date();
  data.updated_at = row.updated_at || new Date();
  return data;
};

const transformPaciente = (data, row) => {
  data.created_at = row.created_at || row.creado_en || new Date();
  data.updated_at = row.updated_at || row.actualizado_en || new Date();
  if (row.password_hash) data.password_hash = row.password_hash;
  if (row.hash_password) data.password_hash = row.hash_password;
  if (row.registro_completo === undefined) data.registro_completo = true;
  return data;
};

const transformExamen = (data, row) => {
  data.created_at = row.created_at || new Date();
  data.updated_at = row.updated_at || new Date();
  if (row.fecha_examen) data.fecha_examen = row.fecha_examen;
  if (row.password_expira) data.password_expira = row.password_expira;
  data.descargas_count = row.descargas_count || 0;
  data.descargas_max = row.descargas_max || 20;
  return data;
};

const transformTipoExamen = (data, row) => {
  data.created_at = row.created_at || new Date();
  data.updated_at = row.updated_at || new Date();
  return data;
};

// ── MIGRACIÓN PRINCIPAL ────────────────────────────────────
async function main() {
  log('🚀 Iniciando migración de PostgreSQL a Firestore...');

  try {
    // Verificar conexión a PostgreSQL
    await pgPool.query('SELECT 1');
    log('✅ Conexión a PostgreSQL exitosa');

    // 1. Tipos de examen
    await migrarTabla('tipos_examen',
      'SELECT * FROM tipos_examen WHERE activo = true ORDER BY id',
      transformTipoExamen
    );

    // 2. Pacientes
    await migrarTabla('pacientes',
      'SELECT * FROM pacientes ORDER BY id',
      transformPaciente
    );

    // 3. Programas
    await migrarTabla('programas',
      'SELECT * FROM programas ORDER BY id',
      transformPrograma
    );

    // 4. Postas
    try {
      await migrarTabla('postas',
        'SELECT * FROM postas ORDER BY id',
        transformPosta
      );
    } catch (e) {
      log('⚠️ Tabla postas no encontrada, omitiendo...');
    }

    // 5. Noticias
    await migrarTabla('noticias',
      'SELECT * FROM noticias ORDER BY id',
      transformNoticia
    );

    // 6. Alertas
    await migrarTabla('alertas',
      'SELECT * FROM alertas ORDER BY id',
      transformAlerta
    );

    // 7. Banners
    await migrarTabla('banners',
      'SELECT * FROM banners ORDER BY id',
      transformBanner
    );

    // 8. Exámenes
    await migrarTabla('examenes',
      'SELECT * FROM examenes ORDER BY id',
      transformExamen
    );

    // 9. Log de descargas (opcional)
    try {
      await migrarTabla('log_descargas',
        'SELECT * FROM log_descargas ORDER BY id',
        (data) => {
          data.created_at = data.created_at || new Date();
          return data;
        }
      );
    } catch (e) {
      log('⚠️ Tabla log_descargas no encontrada, omitiendo...');
    }

    // 10. Visitas (opcional)
    try {
      await migrarTabla('visitas',
        'SELECT * FROM visitas ORDER BY id',
        (data) => {
          data.created_at = data.created_at || new Date();
          return data;
        }
      );
    } catch (e) {
      log('⚠️ Tabla visitas no encontrada, omitiendo...');
    }

    log('✅ Migración completada exitosamente.');
  } catch (error) {
    errorLog('Error en la migración:', error.message);
  } finally {
    await pgPool.end();
    process.exit(0);
  }
}

// ── Ejecutar ────────────────────────────────────────────────
main();