const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

function assertApiKey() {
  if (!API_KEY) {
    throw new Error('No se encontró la API Key de OpenWeather. Definí la variable VITE_OPENWEATHER_API_KEY en un archivo .env.local.')
  }
}

function buildUrl(pathname, searchParams) {
  const url = new URL(pathname, BASE_URL)
  url.search = searchParams.toString()
  return url.toString()
}

async function requestJson(pathname, params, { signal } = {}) {
  const searchParams = new URLSearchParams(params)
  searchParams.set('appid', API_KEY)

  const response = await fetch(buildUrl(pathname, searchParams), { signal })

  if (!response.ok) {
    let message = 'No se pudo obtener la información del clima.'
    try {
      const errorPayload = await response.json()
      if (errorPayload?.message) message = errorPayload.message
    } catch { /* noop */ }

    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return response.json()
}

function degreesToCardinal(degrees) {
  if (typeof degrees !== 'number' || Number.isNaN(degrees)) return null
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

function getLocalDateKey(timestampSeconds, timezoneOffsetSeconds) {
  const date = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000)
  const y = date.getUTCFullYear()
  const m = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  const d = `${date.getUTCDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getLocalHour(timestampSeconds, timezoneOffsetSeconds) {
  const date = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000)
  return date.getUTCHours()
}

function selectRepresentativeEntry(entries, timezoneOffsetSeconds) {
  if (!entries || entries.length === 0) return null
  const targetHour = 12
  return entries.reduce((best, entry) => {
    if (!best) return entry
    const bestDiff = Math.abs(getLocalHour(best.dt, timezoneOffsetSeconds) - targetHour)
    const entryDiff = Math.abs(getLocalHour(entry.dt, timezoneOffsetSeconds) - targetHour)
    return entryDiff < bestDiff ? entry : best
  }, null)
}

function buildDailyForecast(entries, timezoneOffsetSeconds) {
  if (!Array.isArray(entries)) return []

  const byDate = new Map()
  entries.forEach((entry) => {
    const key = getLocalDateKey(entry.dt, timezoneOffsetSeconds)
    const bucket = byDate.get(key)
    if (bucket) bucket.push(entry)
    else byDate.set(key, [entry])
  })

  const days = Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([dateKey, dayEntries]) => {
      let minTemp = Number.POSITIVE_INFINITY
      let maxTemp = Number.NEGATIVE_INFINITY

      dayEntries.forEach(({ main }) => {
        if (!main) return
        if (typeof main.temp_min === 'number') minTemp = Math.min(minTemp, main.temp_min)
        if (typeof main.temp_max === 'number') maxTemp = Math.max(maxTemp, main.temp_max)
      })

      const representative = selectRepresentativeEntry(dayEntries, timezoneOffsetSeconds) ?? dayEntries[0]
      const repWeather = representative?.weather?.[0] ?? {}

      return {
        dateKey,
        timestamp: representative?.dt ?? dayEntries[0]?.dt,
        minTemp: Number.isFinite(minTemp) ? minTemp : null,
        maxTemp: Number.isFinite(maxTemp) ? maxTemp : null,
        icon: repWeather.icon ?? '01d',
        description: repWeather.description ?? '',
      }
    })

  const todayKey = getLocalDateKey(Math.floor(Date.now() / 1000), timezoneOffsetSeconds)
  const filtered = days.filter((d) => d.dateKey >= todayKey)
  return filtered.slice(0, 5)
}

function normalizeCurrentWeather(payload) {
  const weatherInfo = payload.weather?.[0] ?? {}
  const timezoneOffset = payload.timezone ?? 0

  return {
    location: {
      name: payload.name,
      country: payload.sys?.country ?? '',
      coordinates: {
        lat: payload.coord?.lat ?? null,
        lon: payload.coord?.lon ?? null,
      },
      timezoneOffset,
    },
    current: {
      timestamp: payload.dt ?? null,
      temperature: payload.main?.temp ?? null,
      feelsLike: payload.main?.feels_like ?? null,
      humidity: payload.main?.humidity ?? null,
      pressure: payload.main?.pressure ?? null,
      tempMin: payload.main?.temp_min ?? null,
      tempMax: payload.main?.temp_max ?? null,
      description: weatherInfo.description ?? '',
      icon: weatherInfo.icon ?? '01d',
      visibility: payload.visibility ?? null,
      windSpeed: payload.wind?.speed ?? null,
      windDeg: payload.wind?.deg ?? null,
      windDirection: degreesToCardinal(payload.wind?.deg),
      clouds: payload.clouds?.all ?? null,
      sunrise: payload.sys?.sunrise ?? null,
      sunset: payload.sys?.sunset ?? null,
    },
  }
}

export async function getWeatherData({ type, value, units = 'metric', signal } = {}) {
  assertApiKey()

  if (!type || !value) {
    throw new Error('Se necesita una ciudad o coordenadas para buscar el clima.')
  }

  const params = { units }
  if (type === 'city') {
    params.q = value
  } else if (type === 'coords' && typeof value === 'object') {
    params.lat = value.lat
    params.lon = value.lon
  } else {
    throw new Error('Tipo de búsqueda inválido.')
  }

  const currentPayload = await requestJson('/weather', params, { signal })
  const { location, current } = normalizeCurrentWeather(currentPayload)

  if (
    location.coordinates.lat == null ||
    Number.isNaN(location.coordinates.lat) ||
    location.coordinates.lon == null ||
    Number.isNaN(location.coordinates.lon)
  ) {
    throw new Error('No fue posible obtener las coordenadas de la ciudad seleccionada.')
  }

  const forecastPayload = await requestJson(
    '/forecast',
    { units, lat: location.coordinates.lat, lon: location.coordinates.lon },
    { signal },
  )

  const forecast = buildDailyForecast(forecastPayload.list, location.timezoneOffset)

  return {
    location,
    current,
    forecast,
    units,
    updatedAt: Date.now(),
  }
}
