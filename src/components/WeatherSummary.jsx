import { capitalize, formatDate, formatTemperature, getWeatherIconUrl } from '../utils/formatters.js'

export default function WeatherSummary({ weather }) {
  if (!weather) {
    return (
      <section className="weather-summary empty">
        <p>Buscá una ciudad para ver el clima actual.</p>
      </section>
    )
  }

  const { current, location, units } = weather
  const iconUrl = getWeatherIconUrl(current.icon)

  return (
    <section className="weather-summary">
      <div className="weather-summary__icon">
        {iconUrl ? (
          <img src={iconUrl} alt={current.description ?? ''} />
        ) : (
          <div className="weather-summary__icon--placeholder" aria-hidden="true" />
        )}
      </div>
      <p className="weather-summary__temperature">{formatTemperature(current.temperature, units)}</p>
      <p className="weather-summary__description">{capitalize(current.description)}</p>
      <p className="weather-summary__date">{formatDate(current.timestamp, location.timezoneOffset)}</p>
      <p className="weather-summary__location">
        {location.name}
        {location.country ? `, ${location.country}` : ''}
      </p>
      <p className="weather-summary__range">
        <span>Máx {formatTemperature(current.tempMax, units)}</span>
        <span>Mín {formatTemperature(current.tempMin, units)}</span>
      </p>
    </section>
  )
}
