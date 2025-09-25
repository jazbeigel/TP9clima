import { createContext, useContext, useEffect, useState } from 'react'
import { getWeatherData } from '../services/weatherService.js'
import { useSettings } from './SettingsContext.jsx'

const WeatherContext = createContext(null)
const DEFAULT_CITY = 'Buenos Aires'

export function WeatherProvider({ children }) {
  const { units } = useSettings()
  const [query, setQuery] = useState({ type: 'city', value: DEFAULT_CITY })
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query) return

    let isCurrent = true
    setStatus('loading')
    setError(null)

    getWeatherData({ ...query, units })
      .then((data) => {
        if (!isCurrent) return
        setWeather(data)
        setStatus('success')
      })
      .catch((fetchError) => {
        if (!isCurrent) return

        const readableError =
          fetchError?.status === 404
            ? new Error('No encontramos esa ciudad. Probá con otro nombre.')
            : fetchError?.message
              ? fetchError
              : new Error('No pudimos obtener el clima. Intentá nuevamente.')

        setError(readableError)
        setStatus('error')
      })

    return () => {
      isCurrent = false
    }
  }, [query, units])

  const searchByCity = (city) => {
    const trimmed = city?.trim()
    if (!trimmed) return
    setQuery({ type: 'city', value: trimmed })
  }

  const searchByCoords = (coords) => {
    const lat = coords?.lat
    const lon = coords?.lon

    if (typeof lat !== 'number' || typeof lon !== 'number') return
    setQuery({ type: 'coords', value: { lat, lon } })
  }

  return (
    <WeatherContext.Provider value={{ weather, status, error, searchByCity, searchByCoords }}>
      {children}
    </WeatherContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWeather() {
  const context = useContext(WeatherContext)

  if (!context) {
    throw new Error('useWeather debe usarse dentro de un WeatherProvider')
  }

  return context
}
