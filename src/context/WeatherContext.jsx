import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getWeatherData } from '../services/weatherService.js'
import { useSettings } from './SettingsContext.jsx'

const WeatherContext = createContext(null)

export function WeatherProvider({ children }) {
  const { units } = useSettings()
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const lastRequestRef = useRef(null)
  const abortControllerRef = useRef(null)

  const performFetch = useCallback(
    async (request, options = {}) => {
      if (!request) return

      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      setStatus('loading')
      setError(null)

      try {
        const data = await getWeatherData({
          ...request,
          units,
          signal: controller.signal,
        })

        if (options.persistRequest !== false) {
          lastRequestRef.current = request
        }

        setWeather(data)
        setStatus('success')
      } catch (fetchError) {
        if (fetchError?.name === 'AbortError') return

        let normalizedError = fetchError
        if (fetchError?.status === 404) {
          normalizedError = new Error('No encontramos esa ciudad. Probá con otra búsqueda.')
          normalizedError.status = fetchError.status
        } else if (!fetchError?.message) {
          normalizedError = new Error('Ocurrió un error al obtener el clima. Intentá nuevamente más tarde.')
          normalizedError.status = fetchError?.status
        }

        setError(normalizedError)
        setStatus('error')
      }
    },
    [units],
  )

  const searchByCity = useCallback(
    (city) => {
      const trimmedCity = city?.trim()
      if (!trimmedCity) return
      performFetch({ type: 'city', value: trimmedCity })
    },
    [performFetch],
  )

  const searchByCoords = useCallback(
    (coords) => {
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') return
      performFetch({ type: 'coords', value: { lat: coords.lat, lon: coords.lon } })
    },
    [performFetch],
  )

  useEffect(() => {
    if (!lastRequestRef.current) return
    performFetch(lastRequestRef.current, { persistRequest: false })
  }, [units, performFetch])

  useEffect(() => {
    searchByCity('Buenos Aires')
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [searchByCity])

  const value = useMemo(
    () => ({
      weather,
      status,
      error,
      searchByCity,
      searchByCoords,
    }),
    [weather, status, error, searchByCity, searchByCoords],
  )

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWeather() {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider')
  }
  return context
}
