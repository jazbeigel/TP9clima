const LOCALE = 'es-AR'
export const DEFAULT_LOCALE = LOCALE

const TEMPERATURE_SYMBOL = {
  metric: '°C',
  imperial: '°F',
}

const SPEED_UNIT = {
  metric: 'km/h',
  imperial: 'mph',
}

const DISTANCE_UNIT = {
  metric: 'km',
  imperial: 'mi',
}

export function formatTemperature(value, units = 'metric', { withUnit = true } = {}) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  const rounded = Math.round(value)
  return withUnit ? `${rounded}${TEMPERATURE_SYMBOL[units] ?? '°'}` : `${rounded}`
}

export function formatSpeed(value, units = 'metric') {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  const converted = units === 'metric' ? value * 3.6 : value
  const unit = SPEED_UNIT[units] ?? 'km/h'
  return `${Math.round(converted)} ${unit}`
}

export function formatDistance(meters, units = 'metric') {
  if (typeof meters !== 'number' || Number.isNaN(meters)) return '--'
  if (units === 'imperial') {
    const miles = meters / 1609.34
    return `${miles.toFixed(1)} ${DISTANCE_UNIT.imperial}`
  }
  const kilometers = meters / 1000
  return `${kilometers.toFixed(1)} ${DISTANCE_UNIT.metric}`
}

export function formatPercentage(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return `${Math.round(value)}%`
}

export function formatPressure(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return `${Math.round(value)} hPa`
}

export function formatTime(timestampSeconds, timezoneOffsetSeconds, options) {
  if (typeof timestampSeconds !== 'number') return '--'
  const date = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000)
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      ...options,
    }).format(date)
  } catch {
    return date.toUTCString()
  }
}

export function capitalize(text) {
  if (!text) return ''
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}

export function formatDate(timestampSeconds, timezoneOffsetSeconds, options) {
  if (typeof timestampSeconds !== 'number') return '--'
  const date = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000)
  const formatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    ...options,
  }
  try {
    return capitalize(new Intl.DateTimeFormat(LOCALE, formatOptions).format(date))
  } catch {
    return date.toUTCString()
  }
}

export function formatShortDate(timestampSeconds, timezoneOffsetSeconds) {
  return formatDate(timestampSeconds, timezoneOffsetSeconds, {
    weekday: 'short',
    month: 'short',
  })
}

export function getWeatherIconUrl(icon, size = 4) {
  if (!icon) return null
  return `https://openweathermap.org/img/wn/${icon}@${size}x.png`
}
