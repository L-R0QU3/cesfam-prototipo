-- CESFAM Valle Mar - Schema PostgreSQL
-- Ejecutar: psql -U postgres -d cesfam_db -f database/schema.sql

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USUARIOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(150) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  hash_password TEXT NOT NULL,
  rol         VARCHAR(50) NOT NULL DEFAULT 'editor'
                CHECK (rol IN ('admin', 'editor', 'viewer')),
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP
);

-- ── PROGRAMAS DE SALUD ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS programas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            VARCHAR(200) NOT NULL,
  categoria         VARCHAR(50) NOT NULL
                      CHECK (categoria IN ('infantil','mujer','cardiovascular','salud_mental')),
  descripcion       TEXT,
  objetivo          TEXT,
  beneficiarios     VARCHAR(255),
  horario_atencion  VARCHAR(255),
  imagen_url        TEXT,
  activo            BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP,
  deleted_at        TIMESTAMP
);

-- ── POSTAS RURALES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS postas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            VARCHAR(200) NOT NULL,
  tipo              VARCHAR(50) NOT NULL
                      CHECK (tipo IN ('posta','estacion')),
  ubicacion         VARCHAR(255) NOT NULL,
  coordenadas_lat   DECIMAL(10, 8),
  coordenadas_lng   DECIMAL(11, 8),
  horario_atencion  VARCHAR(255),
  encargado         VARCHAR(150),
  telefono          VARCHAR(30),
  activo            BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP,
  deleted_at        TIMESTAMP
);

-- ── RONDAS MÉDICAS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rondas_medicas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posta_id     UUID NOT NULL REFERENCES postas(id) ON DELETE CASCADE,
  dia_semana   VARCHAR(20) NOT NULL
                 CHECK (dia_semana IN ('lunes','martes','miercoles','jueves','viernes')),
  hora_inicio  TIME NOT NULL,
  hora_fin     TIME NOT NULL,
  profesional  VARCHAR(150),
  especialidad VARCHAR(100),
  activo       BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ── NOTICIAS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noticias (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo              VARCHAR(300) NOT NULL,
  contenido           TEXT NOT NULL,
  estado              VARCHAR(30) DEFAULT 'borrador'
                        CHECK (estado IN ('borrador','publicada','archivada')),
  categoria           VARCHAR(100),
  imagen_url          TEXT,
  autor_id            UUID REFERENCES usuarios(id),
  fecha_publicacion   TIMESTAMP,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP,
  deleted_at          TIMESTAMP
);

-- ── HORARIOS DE BOXES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS horarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(150) NOT NULL,
  tipo        VARCHAR(50) DEFAULT 'box',
  descripcion TEXT,
  lunes       VARCHAR(100),
  martes      VARCHAR(100),
  miercoles   VARCHAR(100),
  jueves      VARCHAR(100),
  viernes     VARCHAR(100),
  activo      BOOLEAN DEFAULT true,
  updated_at  TIMESTAMP
);

-- ── ÍNDICES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_programas_categoria ON programas(categoria);
CREATE INDEX IF NOT EXISTS idx_programas_activo    ON programas(activo);
CREATE INDEX IF NOT EXISTS idx_postas_tipo         ON postas(tipo);
CREATE INDEX IF NOT EXISTS idx_noticias_estado     ON noticias(estado);
CREATE INDEX IF NOT EXISTS idx_noticias_fecha      ON noticias(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_usuarios_email      ON usuarios(email);

-- ── DATOS SEMILLA ───────────────────────────────────────────
-- Admin por defecto (password: Admin2024!)
INSERT INTO usuarios (nombre, email, hash_password, rol) VALUES
  ('Administrador CESFAM',
   'admin@cesfam.cl',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCX5z5GfSrDW3LpnV3RNQOK',
   'admin')
ON CONFLICT (email) DO NOTHING;

-- Programas de salud
INSERT INTO programas (nombre, categoria, descripcion, beneficiarios, horario_atencion, activo) VALUES
  ('Programa de Salud Infantil', 'infantil',
   'Atención integral para el desarrollo saludable de niñas y niños de la comuna de Navidad.',
   'Niños de 0 a 15 años', 'Lunes a Viernes 08:00 - 17:00', true),
  ('Salud de la Mujer', 'mujer',
   'Atención preventiva y curativa en salud sexual, reproductiva y climaterio.',
   'Mujeres desde 15 años', 'Martes y Jueves 09:00 - 13:00', true),
  ('Programa Cardiovascular', 'cardiovascular',
   'Control y prevención de hipertensión, diabetes y enfermedades cardiovasculares.',
   'Adultos mayores de 40 años con factores de riesgo', 'Lunes, Miércoles y Viernes 14:00 - 17:00', true),
  ('Salud Mental Comunitaria', 'salud_mental',
   'Apoyo psicológico, terapia grupal y acompañamiento en salud mental.',
   'Todas las edades', 'Miércoles 10:00 - 12:00', true)
ON CONFLICT DO NOTHING;

-- Postas rurales
INSERT INTO postas (nombre, tipo, ubicacion, coordenadas_lat, coordenadas_lng, horario_atencion, encargado) VALUES
  ('Posta Pupuya', 'posta', 'Pupuya, Navidad', -34.0012, -71.8934, 'Lunes y Miércoles 09:00 - 12:00', 'EU Juan Pérez'),
  ('Posta San Vicente de Pucalán', 'posta', 'San Vicente de Pucalán', -34.0234, -71.9102, 'Martes y Jueves 10:00 - 13:00', 'EU Rosa García'),
  ('Posta Rapel', 'posta', 'Lago Rapel, Navidad', -34.0456, -71.5678, 'Lunes y Viernes 08:00 - 12:00', 'EU Carlos López'),
  ('EMR Palmilla', 'estacion', 'Palmilla, Navidad', -34.0678, -71.7890, 'Primer y tercer martes del mes', 'Dr. Miguel Torres'),
  ('EMR Puertecillo', 'estacion', 'Puertecillo, Navidad', -34.1234, -71.8012, 'Segundo y cuarto miércoles del mes', 'Dra. Patricia Silva'),
  ('EMR El Manzano', 'estacion', 'El Manzano, Navidad', -34.0890, -71.9456, 'Primer y tercer jueves del mes', 'Dr. Carlos López')
ON CONFLICT DO NOTHING;

-- Horarios de boxes
INSERT INTO horarios (nombre, tipo, lunes, martes, miercoles, jueves, viernes) VALUES
  ('Box 1 - Medicina General', 'box', '08:00-13:00', '08:00-13:00', '08:00-13:00', '08:00-13:00', '08:00-13:00'),
  ('Box 2 - Enfermería', 'box', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00', '08:00-17:00'),
  ('Box 3 - Matrona', 'box', '09:00-13:00', '09:00-13:00', NULL, '09:00-13:00', '09:00-13:00'),
  ('Box 4 - Dental', 'box', '08:00-13:00', NULL, '08:00-13:00', NULL, '08:00-13:00'),
  ('Box 5 - Psicología', 'box', NULL, '10:00-13:00', '10:00-13:00', NULL, NULL),
  ('Box 6 - Nutrición', 'box', '14:00-17:00', NULL, '14:00-17:00', NULL, '14:00-17:00'),
  ('Box 7 - Kinesiología', 'box', '08:00-12:00', '08:00-12:00', NULL, '08:00-12:00', NULL),
  ('Laboratorio', 'laboratorio', '07:30-11:00', '07:30-11:00', '07:30-11:00', '07:30-11:00', '07:30-11:00')
ON CONFLICT DO NOTHING;