const axios = require('axios');
const jwt = require('jsonwebtoken');
const { db, admin } = require('../config/firebase');
const logger = require('../config/logger');

const normalizarRut = (rut) => String(rut).replace(/\./g, '').replace(/-/g, '').toUpperCase().trim();
const formatearRut = (numero, dv) => {
  const num = String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${num}-${dv}`;
};

exports.iniciarLogin = (req, res) => {
  const { tipo = 'paciente' } = req.query;
  const params = new URLSearchParams({
    client_id: process.env.CLAVEUNICA_CLIENT_ID,
    redirect_uri: process.env.CLAVEUNICA_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid run name email',
    state: Buffer.from(JSON.stringify({ tipo, ts: Date.now() })).toString('base64'),
  });
  const url = `${process.env.CLAVEUNICA_AUTH_URL}?${params.toString()}`;
  logger.info(`Redirigiendo a ClaveÚnica: tipo=${tipo}`);
  res.redirect(url);
};

exports.callback = async (req, res) => {
  const { code, state, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL;
  if (error) {
    logger.error('Error ClaveÚnica:', error);
    return res.redirect(`${frontendUrl}/examenes?error=claveunica_error&msg=${encodeURIComponent('Autenticación cancelada')}`);
  }
  if (!code) {
    return res.redirect(`${frontendUrl}/examenes?error=no_code&msg=${encodeURIComponent('No se recibió código de autorización')}`);
  }
  let stateData = { tipo: 'paciente' };
  try { stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8')); } catch {}
  try {
    const tokenResponse = await axios.post(process.env.CLAVEUNICA_TOKEN_URL,
      new URLSearchParams({
        client_id: process.env.CLAVEUNICA_CLIENT_ID,
        client_secret: process.env.CLAVEUNICA_CLIENT_SECRET,
        redirect_uri: process.env.CLAVEUNICA_REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
    );
    const { access_token } = tokenResponse.data;
    const userResponse = await axios.get(process.env.CLAVEUNICA_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
      timeout: 10000,
    });
    const userData = userResponse.data;
    const rutNumero = userData.RolUnico?.numero;
    const rutDV = userData.RolUnico?.DV;
    const nombres = userData.name?.nombres?.join(' ') ?? '';
    const apellidos = userData.name?.apellidos?.join(' ') ?? '';
    const email = userData.email ?? null;
    if (!rutNumero || !rutDV) throw new Error('ClaveÚnica no devolvió RUT válido');
    const rutFormateado = formatearRut(rutNumero, rutDV);
    const rutNormalizado = normalizarRut(rutFormateado);
    const nombreCompleto = `${nombres} ${apellidos}`.trim();
    logger.info(`ClaveÚnica login: ${rutNormalizado} (${nombreCompleto})`);
    
    // Buscar o crear paciente en Firestore
    let pacienteRef;
    const snapshot = await db.collection('pacientes').where('rut', '==', rutNormalizado).get();
    if (snapshot.empty) {
      const newPaciente = {
        rut: rutNormalizado,
        nombre: nombreCompleto,
        email,
        clave_unica_sub: String(rutNumero),
        activo: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('pacientes').add(newPaciente);
      pacienteRef = docRef;
    } else {
      pacienteRef = snapshot.docs[0].ref;
      await pacienteRef.update({
        nombre: nombreCompleto,
        email,
        clave_unica_sub: String(rutNumero),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    const pacienteDoc = await pacienteRef.get();
    const paciente = { id: pacienteDoc.id, ...pacienteDoc.data() };
    const token = jwt.sign(
      { sub: paciente.id, rut: paciente.rut, nombre: paciente.nombre, tipo: 'paciente', via: 'claveunica' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    const destino = stateData.tipo === 'paciente'
      ? `/examenes?token=${token}&nombre=${encodeURIComponent(nombreCompleto)}&rut=${encodeURIComponent(rutFormateado)}&via=claveunica`
      : `/admin/dashboard?token=${token}`;
    res.redirect(`${frontendUrl}${destino}`);
  } catch (error) {
    logger.error('Error en callback ClaveÚnica:', error.message);
    res.redirect(`${frontendUrl}/examenes?error=auth_failed&msg=${encodeURIComponent('Error al conectar con ClaveÚnica. Intenta con RUT y contraseña.')}`);
  }
};

exports.verificarTokenPaciente = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No autenticado' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo !== 'paciente') return res.status(403).json({ success: false, message: 'Acceso no permitido' });
    req.paciente = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};