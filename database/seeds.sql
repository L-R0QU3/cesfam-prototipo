CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS programas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descripcion TEXT,
  beneficiarios TEXT,
  horario_atencion VARCHAR(200),
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

INSERT INTO programas (nombre, categoria, descripcion, beneficiarios, horario_atencion, activo, created_at) VALUES 
('Salud Mental Comunitaria', 'salud_mental', 'Apoyo psicológico, terapia grupal y acompañamiento en salud mental.', 'Todas las edades', 'Miércoles 10:00 - 12:00', true, now()),
('Programa de Salud Infantil', 'infantil', 'Atención integral para el desarrollo saludable de niñas y niños de la comuna de Navidad.', 'Niños de 0 a 15 años', 'Lunes a Viernes 08:00 - 17:00', true, now()),
('Salud de la Mujer', 'mujer', 'Atención preventiva y curativa en salud sexual, reproductiva y climaterio.', 'Mujeres desde 15 años', 'Martes y Jueves 09:00 - 13:00', true, now()),
('Programa Cardiovascular', 'cardiovascular', 'Control y prevención de hipertensión, diabetes y enfermedades cardiovasculares.', 'Adultos mayores de 40 años con factores de riesgo', 'Lunes, Miércoles y Viernes 14:00 - 17:00', true, now());