const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

async function request(path, params) {
  const url = new URL(path, BASE_URL)
  const searchParams = new URLSearchParams(params)
  searchParams.set('appid', API_KEY)
  url.search = searchParams.toString()

  const response = await fetch(url.toString())
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(payload?.message || 'No pudimos obtener la información del clima.')
    error.status = response.status
    throw error
  }

  return payload
}

function degreesToCardinal(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
  const index = Math.round(value / 22.5) % directions.length
  return directions[index]
}

function buildForecast(list = [], timezoneOffset = 0) {
  const selection = []
  const indexes = new Map()

  list.forEach((item) => {
    const dtTxt = item?.dt_txt
    if (!dtTxt) return

    const [dateKey, time = ''] = dtTxt.split(' ')
    if (!dateKey) return

    if (!indexes.has(dateKey)) {
      indexes.set(dateKey, selection.length)
      selection.push(item)
      return
    }

    if (time.startsWith('12:')) {
      const position = indexes.get(dateKey)
      selection[position] = item
    }
  })

  return selection.slice(0, 5).map((item) => {
    const weatherInfo = item.weather?.[0] ?? {}
    return {
      dateKey: item.dt_txt,
      timestamp: item.dt,
      minTemp: item.main?.temp_min ?? null,
      maxTemp: item.main?.temp_max ?? null,
      description: weatherInfo.description ?? '',
      icon: weatherInfo.icon ?? '01d',
      timezoneOffset,
    }
  })
}

export async function getWeatherData({ type, value, units = 'metric' } = {}) {
  if (!API_KEY) {
    throw new Error('Falta definir VITE_OPENWEATHER_API_KEY en tu archivo .env.local')
  }

  if (!type || !value) {
    throw new Error('Necesitamos una ciudad o coordenadas para consultar el clima.')
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

  const current = await request('/weather', params)
  const location = {
    name: current.name,
    country: current.sys?.country ?? '',
    timezoneOffset: current.timezone ?? 0,
    coordinates: {
      lat: current.coord?.lat ?? null,
      lon: current.coord?.lon ?? null,
    },
  }

  const currentWeather = {
    timestamp: current.dt ?? null,
    temperature: current.main?.temp ?? null,
    feelsLike: current.main?.feels_like ?? null,
    tempMin: current.main?.temp_min ?? null,
    tempMax: current.main?.temp_max ?? null,
    humidity: current.main?.humidity ?? null,
    pressure: current.main?.pressure ?? null,
    description: current.weather?.[0]?.description ?? '',
    icon: current.weather?.[0]?.icon ?? '01d',
    visibility: current.visibility ?? null,
    windSpeed: current.wind?.speed ?? null,
    windDirection: degreesToCardinal(current.wind?.deg),
    clouds: current.clouds?.all ?? null,
    sunrise: current.sys?.sunrise ?? null,
    sunset: current.sys?.sunset ?? null,
  }

  if (location.coordinates.lat == null || location.coordinates.lon == null) {
    throw new Error('No pudimos determinar las coordenadas de esa ciudad.')
  }

  const forecastPayload = await request('/forecast', {
    units,
    lat: location.coordinates.lat,
    lon: location.coordinates.lon,
  })

  const forecast = buildForecast(forecastPayload.list, location.timezoneOffset)

  return {
    location,
    current: currentWeather,
    forecast,
    units,
    updatedAt: Date.now(),
  }
}
