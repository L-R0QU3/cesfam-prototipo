const { Client } = require('pg');
require('dotenv').config();

const programas = [
  { nombre: 'Salud Mental Comunitaria', categoria: 'salud_mental', descripcion: 'Apoyo psicológico, terapia grupal y acompañamiento en salud mental.', beneficiarios: 'Todas las edades', horario_atencion: 'Miércoles 10:00 - 12:00' },
  { nombre: 'Programa de Salud Infantil', categoria: 'infantil', descripcion: 'Atención integral para el desarrollo saludable de niñas y niños de la comuna de Navidad.', beneficiarios: 'Niños de 0 a 15 años', horario_atencion: 'Lunes a Viernes 08:00 - 17:00' },
  { nombre: 'Salud de la Mujer', categoria: 'mujer', descripcion: 'Atención preventiva y curativa en salud sexual, reproductiva y climaterio.', beneficiarios: 'Mujeres desde 15 años', horario_atencion: 'Martes y Jueves 09:00 - 13:00' },
  { nombre: 'Programa Cardiovascular', categoria: 'cardiovascular', descripcion: 'Control y prevención de hipertensión, diabetes y enfermedades cardiovasculares.', beneficiarios: 'Adultos mayores de 40 años con factores de riesgo', horario_atencion: 'Lunes, Miércoles y Viernes 14:00 - 17:00' }
];

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query('TRUNCATE programas RESTART IDENTITY;');
  for (const prog of programas) {
    await client.query(
      `INSERT INTO programas (nombre, categoria, descripcion, beneficiarios, horario_atencion, activo, created_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())`,
      [prog.nombre, prog.categoria, prog.descripcion, prog.beneficiarios, prog.horario_atencion]
    );
  }
  console.log('✅ Datos insertados correctamente');
  await client.end();
}

seed().catch(console.error);