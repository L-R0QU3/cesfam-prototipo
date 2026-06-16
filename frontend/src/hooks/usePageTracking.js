import { useEffect, useRef } from 'react'
import { useLocation }       from 'react-router-dom'
import api                   from '../utils/api'

// Genera o recupera un ID de sesión único por navegador
const getSessionId = () => {
  let id = sessionStorage.getItem('cesfam_session')
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem('cesfam_session', id)
  }
  return id
}

const detectDispositivo = () => {
  const ua = navigator.userAgent
  if (/mobile|android|iphone/i.test(ua)) return 'movil'
  if (/tablet|ipad/i.test(ua))           return 'tablet'
  return 'desktop'
}

// Rutas del admin que NO queremos registrar
const RUTAS_IGNORADAS = ['/admin']

const usePageTracking = () => {
  const location   = useLocation()
  const lastPath   = useRef(null)

  useEffect(() => {
    const pagina = location.pathname

    // No registrar rutas de admin ni repetir la misma página
    const esAdmin = RUTAS_IGNORADAS.some(r => pagina.startsWith(r))
    if (esAdmin || pagina === lastPath.current) return

    lastPath.current = pagina

    api.post('/api/analytics/visita', {
      pagina,
      dispositivo: detectDispositivo(),
      sesion_id:   getSessionId(),
    }).catch(() => {
      // Silencioso — no interrumpir la experiencia del usuario
    })
  }, [location.pathname])
}

export default usePageTracking