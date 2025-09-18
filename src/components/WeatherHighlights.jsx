import {
  formatDistance,
  formatPercentage,
  formatPressure,
  formatSpeed,
  formatTemperature,
  formatTime,
} from '../utils/formatters.js'

export default function WeatherHighlights({ weather }) {
  if (!weather) return null

  const { current, location, units } = weather

  const items = [
    {
      id: 'feels-like',
      label: 'Sensación térmica',
      value: formatTemperature(current.feelsLike, units),
    },
    {
      id: 'wind',
      label: 'Viento',
      value: formatSpeed(current.windSpeed, units),
      detail: current.windDirection ? `Dirección ${current.windDirection}` : null,
    },
    {
      id: 'humidity',
      label: 'Humedad',
      value: formatPercentage(current.humidity),
    },
    {
      id: 'visibility',
      label: 'Visibilidad',
      value: formatDistance(current.visibility, units),
    },
    {
      id: 'pressure',
      label: 'Presión',
      value: formatPressure(current.pressure),
    },
    {
      id: 'sunrise',
      label: 'Amanecer',
      value: formatTime(current.sunrise, location.timezoneOffset),
    },
    {
      id: 'sunset',
      label: 'Atardecer',
      value: formatTime(current.sunset, location.timezoneOffset),
    },
    {
      id: 'clouds',
      label: 'Nubosidad',
      value: formatPercentage(current.clouds),
    },
  ]

  return (
    <section className="weather-highlights">
      <h2>Condiciones actuales</h2>
      <div className="weather-highlights__grid">
        {items.map((item) => (
          <article key={item.id} className="highlight-card">
            <p className="highlight-card__label">{item.label}</p>
            <p className="highlight-card__value">{item.value}</p>
            {item.detail ? <p className="highlight-card__detail">{item.detail}</p> : null}
          </article>
        ))}
      </div>
    </section>
  )
}
