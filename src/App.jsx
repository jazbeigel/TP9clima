import { useState, useMemo } from 'react'
import SearchForm from './components/SearchForm.jsx'
import LocationButton from './components/LocationButton.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import UnitsToggle from './components/UnitsToggle.jsx'
import WeatherSummary from './components/WeatherSummary.jsx'
import ForecastList from './components/ForecastList.jsx'
import WeatherHighlights from './components/WeatherHighlights.jsx'
import Loader from './components/Loader.jsx'
import { useWeather } from './context/WeatherContext.jsx'
import { DEFAULT_LOCALE } from './utils/formatters.js'
import './App.css'

function App() {
  const { weather, status, error, searchByCity, searchByCoords } = useWeather()
  const [locationError, setLocationError] = useState(null)
  const [isLocating, setIsLocating] = useState(false)

  const isLoading = status === 'loading'

  const handleSearch = (query) => {
    setLocationError(null)
    searchByCity(query)
  }

  const handleUseLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Tu navegador no permite obtener la ubicación automáticamente.')
      return
    }

    setLocationError(null)
    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        searchByCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      (geoError) => {
        console.warn('Error al obtener la ubicación', geoError)
        setIsLocating(false)
        setLocationError('No pudimos acceder a tu ubicación. Revisá los permisos del navegador.')
      },
      { timeout: 10000 },
    )
  }

  const lastUpdateLabel = useMemo(() => {
    if (!weather?.updatedAt) return null
    try {
      return new Date(weather.updatedAt).toLocaleTimeString(DEFAULT_LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return null
    }
  }, [weather?.updatedAt])

  return (
    <div className="app">
      <header className="app__header">
        <SearchForm onSearch={handleSearch} />
        <div className="app__actions">
          <LocationButton onClick={handleUseLocation} loading={isLocating} />
          <UnitsToggle />
          <ThemeToggle />
        </div>
      </header>

      {isLoading && <Loader />}

      {error && <p className="app__error">{error.message || 'Ocurrió un error'}</p>}
      {locationError && <p className="app__error">{locationError}</p>}

      {weather && !isLoading && (
        <>
          <WeatherSummary weather={weather} lastUpdateLabel={lastUpdateLabel} />
          <WeatherHighlights weather={weather} />
          <ForecastList forecast={weather.forecast} timezoneOffset={weather.location.timezoneOffset} />
        </>
      )}
    </div>
  )
}

export default App
