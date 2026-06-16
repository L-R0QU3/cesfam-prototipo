import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const useClaveUnica = () => {
  const [searchParams]  = useSearchParams()
  const [resultado, setResultado] = useState(null)
  const [error,     setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token  = searchParams.get('token')
    const nombre = searchParams.get('nombre')
    const rut    = searchParams.get('rut')
    const via    = searchParams.get('via')
    const err    = searchParams.get('error')
    const msg    = searchParams.get('msg')

    if (err) {
      setError(msg ?? 'Error de autenticación con ClaveÚnica')
      // Limpiar URL
      navigate('/examenes', { replace: true })
      return
    }

    if (token && via === 'claveunica') {
      // Guardar token y datos del usuario
      sessionStorage.setItem('paciente_token',  token)
      sessionStorage.setItem('paciente_nombre', nombre ?? '')
      sessionStorage.setItem('paciente_rut',    rut ?? '')
      sessionStorage.setItem('paciente_via',    'claveunica')

      setResultado({ token, paciente: { nombre, rut }, via: 'claveunica' })

      // Limpiar URL (quitar token de la barra)
      navigate('/examenes', { replace: true })
    }
  }, [])

  return { resultado, error }
}

export default useClaveUnica