import { useSettings } from '../context/SettingsContext.jsx'

export default function UnitsToggle() {
  const { units, setUnits } = useSettings()

  return (
    <div className="units-toggle" role="group" aria-label="Cambiar unidad de temperatura">
      <button
        type="button"
        className={units === 'metric' ? 'active' : ''}
        onClick={() => setUnits('metric')}
      >
        °C
      </button>
      <button
        type="button"
        className={units === 'imperial' ? 'active' : ''}
        onClick={() => setUnits('imperial')}
      >
        °F
      </button>
    </div>
  )
}
