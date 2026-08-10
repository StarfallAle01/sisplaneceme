// I Semestre 2026: Enero – Junio (Anexo B)
export const SEMESTER_START = '2026-01-05'
export const SEMESTER_END   = '2026-06-26'
export const HORAS_POR_DIA  = 6

export const MONTHS = [
  { year: 2026, month: 0, label: 'Enero 2026' },
  { year: 2026, month: 1, label: 'Febrero 2026' },
  { year: 2026, month: 2, label: 'Marzo 2026' },
  { year: 2026, month: 3, label: 'Abril 2026' },
  { year: 2026, month: 4, label: 'Mayo 2026' },
  { year: 2026, month: 5, label: 'Junio 2026' },
]

// 6 feriados No Laborables – I Semestre 2026
export const holidays = [
  { date: '2026-01-01', nombre: 'Año Nuevo' },
  { date: '2026-04-02', nombre: 'Jueves Santo' },
  { date: '2026-04-03', nombre: 'Viernes Santo' },
  { date: '2026-05-01', nombre: 'Día del Trabajo' },
  { date: '2026-06-07', nombre: 'Batalla de Arica' },
  { date: '2026-06-29', nombre: 'San Pedro y San Pablo' },
]

// Colores por Semestre — progresión visual de menor a mayor autoridad
export const EJE_COLORS = {
  'I Semestre':  '#8B6914',   // dorado oscuro – legible con texto blanco
  'II Semestre': '#0A1628',   // azul marino
  'III Semestre':'#8B6914',   // dorado oscuro
  'IV Semestre': '#0A1628',   // azul marino – máxima autoridad
}

// ---------- helpers ----------

export function dateToString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// Returns 0=Mon … 6=Sun offset for first day of month
export function getFirstDayOfMonth(year, month) {
  const dow = new Date(year, month, 1).getDay()
  return dow === 0 ? 6 : dow - 1
}

export function getHoliday(dateStr) {
  return holidays.find((h) => h.date === dateStr) ?? null
}

export function isWeekend(dateStr) {
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  return dow === 0 || dow === 6
}

export function isHoliday(dateStr) {
  return holidays.some((h) => h.date === dateStr)
}

export function isWorkday(dateStr) {
  return !isWeekend(dateStr) && !isHoliday(dateStr)
}

// All workdays between two date strings (inclusive, order-independent)
export function workdaysInRange(a, b) {
  const start = a <= b ? a : b
  const end   = a <= b ? b : a
  const days  = []
  const cur   = new Date(start + 'T12:00:00')
  const fin   = new Date(end   + 'T12:00:00')
  while (cur <= fin) {
    const ds = cur.toISOString().slice(0, 10)
    if (isWorkday(ds)) days.push(ds)
    cur.setDate(cur.getDate() + 1)
  }
  return days
}
