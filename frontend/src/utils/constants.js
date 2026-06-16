export const PROGRAMAS_CONFIG = {
  infantil: {
    label:       'Programa Infantil',
    color:       'from-emerald-500 to-teal-600',
    bgLight:     'bg-emerald-50',
    textColor:   'text-emerald-700',
    borderColor: 'border-emerald-200',
    badgeBg:     'bg-emerald-100 text-emerald-800',
    emoji:       '👶',
  },
  mujer: {
    label:       'Salud de la Mujer',
    color:       'from-pink-500 to-rose-600',
    bgLight:     'bg-pink-50',
    textColor:   'text-pink-700',
    borderColor: 'border-pink-200',
    badgeBg:     'bg-pink-100 text-pink-800',
    emoji:       '🌸',
  },
  cardiovascular: {
    label:       'Cardiovascular',
    color:       'from-orange-500 to-red-500',
    bgLight:     'bg-orange-50',
    textColor:   'text-orange-700',
    borderColor: 'border-orange-200',
    badgeBg:     'bg-orange-100 text-orange-800',
    emoji:       '❤️',
  },
  salud_mental: {
    label:       'Salud Mental',
    color:       'from-purple-500 to-indigo-600',
    bgLight:     'bg-purple-50',
    textColor:   'text-purple-700',
    borderColor: 'border-purple-200',
    badgeBg:     'bg-purple-100 text-purple-800',
    emoji:       '🧠',
  },
};

export const POSTAS_CONFIG = {
  posta: {
    label:   'Posta Rural',
    color:   'bg-blue-600',
    bgLight: 'bg-blue-50',
    emoji:   '🏥',
  },
  estacion: {
    label:   'Estación Médica Rural',
    color:   'bg-teal-600',
    bgLight: 'bg-teal-50',
    emoji:   '🏕️',
  },
};

export const ALERTAS_EPIDEMIOLOGICAS = [
  {
    id: 1,
    tipo: 'warning',
    titulo: 'Alerta Respiratoria',
    descripcion: 'Aumento de casos de Influenza. Vacunación disponible en CESFAM.',
    fecha: '2024-02-10',
    activa: true,
  },
  {
    id: 2,
    tipo: 'info',
    titulo: 'Chagas: Operativo Rural',
    descripcion: 'Campaña de detección en postas rurales. Consulta horarios.',
    fecha: '2024-02-08',
    activa: true,
  },
];