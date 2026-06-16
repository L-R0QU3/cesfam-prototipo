const db = require('../config/database')
const logger = require('../config/logger')

// ── Registrar visita (público, sin auth) ──────────────────
exports.registrarVisita = async (req, res, next) => {
  try {
    const { pagina, dispositivo, sesion_id } = req.body

    if (!pagina) {
      return res.status(400).json({ success: false, message: 'Página requerida' })
    }

    // Detectar dispositivo desde user-agent si no viene
    const ua = req.headers['user-agent'] || ''
    let device = dispositivo
    if (!device) {
      if (/mobile|android|iphone|ipad/i.test(ua)) {
        device = 'movil'
      } else if (/tablet/i.test(ua)) {
        device = 'tablet'
      } else {
        device = 'desktop'
      }
    }

    await db.query(
      `INSERT INTO visitas (pagina, dispositivo, sesion_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [pagina, device, sesion_id || null]
    )

    res.status(201).json({ success: true })
  } catch (error) {
    logger.error('Error registrando visita:', error)
    next(error)
  }
}

// ── Resumen general (admin) ───────────────────────────────
exports.getResumen = async (req, res, next) => {
  try {
    // Visitas este mes
    const visitasMes = await db.query(`
      SELECT COUNT(*) as total
      FROM visitas
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
    `)

    // Visitas mes anterior
    const visitasMesAnterior = await db.query(`
      SELECT COUNT(*) as total
      FROM visitas
      WHERE DATE_TRUNC('month', created_at) =
            DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    `)

    // Sesiones únicas este mes
    const sesionesUnicas = await db.query(`
      SELECT COUNT(DISTINCT sesion_id) as total
      FROM visitas
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        AND sesion_id IS NOT NULL
    `)

    // Calcular variación
    const totalMes    = parseInt(visitasMes.rows[0].total)
    const totalAnterior = parseInt(visitasMesAnterior.rows[0].total)
    const variacion   = totalAnterior > 0
      ? Math.round(((totalMes - totalAnterior) / totalAnterior) * 100)
      : 100

    // Distribución por dispositivo
    const dispositivos = await db.query(`
      SELECT
        dispositivo,
        COUNT(*) as total,
        ROUND(COUNT(*) * 100.0 / NULLIF((
          SELECT COUNT(*) FROM visitas
          WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        ), 0), 1) as porcentaje
      FROM visitas
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
      GROUP BY dispositivo
      ORDER BY total DESC
    `)

    res.json({
      success: true,
      data: {
        visitas_mes:      totalMes,
        visitas_anterior: totalAnterior,
        variacion_pct:    variacion,
        sesiones_unicas:  parseInt(sesionesUnicas.rows[0].total),
        dispositivos:     dispositivos.rows,
      }
    })
  } catch (error) {
    logger.error('Error obteniendo resumen:', error)
    next(error)
  }
}

// ── Visitas por mes (últimos 6 meses) ────────────────────
exports.getVisitasPorMes = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as mes,
        DATE_TRUNC('month', created_at) as fecha,
        COUNT(*) as total
      FROM visitas
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY fecha ASC
    `)

    res.json({ success: true, data: result.rows })
  } catch (error) {
    logger.error('Error obteniendo visitas por mes:', error)
    next(error)
  }
}

// ── Páginas más visitadas ─────────────────────────────────
exports.getPaginasPopulares = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        pagina,
        COUNT(*) as visitas
      FROM visitas
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
      GROUP BY pagina
      ORDER BY visitas DESC
      LIMIT 8
    `)

    // Calcular porcentajes
    const total = result.rows.reduce((sum, r) => sum + parseInt(r.visitas), 0)
    const data  = result.rows.map(r => ({
      pagina:  r.pagina,
      visitas: parseInt(r.visitas),
      pct:     total > 0 ? Math.round((parseInt(r.visitas) / total) * 100) : 0,
    }))

    res.json({ success: true, data })
  } catch (error) {
    logger.error('Error obteniendo páginas:', error)
    next(error)
  }
}

// ── Visitas de hoy ────────────────────────────────────────
exports.getVisitasHoy = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        EXTRACT(HOUR FROM created_at) as hora,
        COUNT(*) as total
      FROM visitas
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY hora
      ORDER BY hora ASC
    `)

    res.json({ success: true, data: result.rows })
  } catch (error) {
    logger.error('Error obteniendo visitas de hoy:', error)
    next(error)
  }
}

// ── Stats para el Dashboard KPI ──────────────────────────
exports.getKpis = async (req, res, next) => {
  try {
    const [mes, anterior, hoy, sesiones] = await Promise.all([
      db.query(`SELECT COUNT(*) as total FROM visitas WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`),
      db.query(`SELECT COUNT(*) as total FROM visitas WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')`),
      db.query(`SELECT COUNT(*) as total FROM visitas WHERE DATE(created_at) = CURRENT_DATE`),
      db.query(`SELECT COUNT(DISTINCT sesion_id) as total FROM visitas WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) AND sesion_id IS NOT NULL`),
    ])

    const totalMes    = parseInt(mes.rows[0].total)
    const totalAnt    = parseInt(anterior.rows[0].total)
    const variacion   = totalAnt > 0
      ? Math.round(((totalMes - totalAnt) / totalAnt) * 100)
      : 100

    res.json({
      success: true,
      data: {
        visitas_mes:     totalMes,
        variacion_pct:   variacion,
        visitas_hoy:     parseInt(hoy.rows[0].total),
        sesiones_unicas: parseInt(sesiones.rows[0].total),
      }
    })
  } catch (error) {
    logger.error('Error obteniendo KPIs:', error)
    next(error)
  }
}