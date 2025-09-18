import { capitalize, formatShortDate, formatTemperature, getWeatherIconUrl } from '../utils/formatters.js'

export default function ForecastList({ weather }) {
  if (!weather || !weather.forecast?.length) return null

  const { forecast, units, location } = weather

  return (
    <section className="forecast">
      <h2>Próximos días</h2>
      <div className="forecast__grid">
        {forecast.map((day) => (
          <article key={day.dateKey} className="forecast-card">
            <p className="forecast-card__date">
              {formatShortDate(day.timestamp, location.timezoneOffset)}
            </p>
            <div className="forecast-card__icon">
              {day.icon ? (
                <img src={getWeatherIconUrl(day.icon, 2)} alt={day.description ?? ''} />
              ) : (
                <div className="forecast-card__icon--placeholder" aria-hidden="true" />
              )}
            </div>
            <p className="forecast-card__description">{capitalize(day.description)}</p>
            <div className="forecast-card__temperatures">
              <span>{formatTemperature(day.maxTemp, units)}</span>
              <span>{formatTemperature(day.minTemp, units)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
