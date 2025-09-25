import { useState } from 'react'
import SearchForm from './components/SearchForm.jsx'
import LocationButton from './components/LocationButton.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import UnitsToggle from './components/UnitsToggle.jsx'
import WeatherSummary from './components/WeatherSummary.jsx'
import ForecastList from './components/ForecastList.jsx'
import WeatherHighlights from './components/WeatherHighlights.jsx'
import Loader from './components/Loader.jsx'
import { useWeather } from './context/WeatherContext.jsx'
import { capitalize } from './utils/formatters.js'
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

  const lastUpdateLabel = weather
    ? new Date(weather.updatedAt).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <header className="sidebar__header">
          <h1 className="app-title">Pronóstico</h1>
          <ThemeToggle />
        </header>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        <LocationButton onClick={handleUseLocation} isLoading={isLocating || isLoading} />
        {locationError ? <p className="hint hint--error">{locationError}</p> : null}
        {error ? <p className="hint hint--error">{capitalize(error.message)}</p> : null}
        {isLoading && !weather ? <Loader /> : <WeatherSummary weather={weather} />}
      </aside>
      <main className="main-content">
        <div className="main-content__toolbar">
          <UnitsToggle />
          {lastUpdateLabel ? <p className="last-update">Actualizado {lastUpdateLabel}</p> : null}
        </div>
        {isLoading && weather ? (
          <div className="loading-overlay">
            <Loader />
          </div>
        ) : null}
        <ForecastList weather={weather} />
        <WeatherHighlights weather={weather} />
      </main>
    </div>
  )
}

export default App
