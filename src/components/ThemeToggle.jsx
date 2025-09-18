import { useSettings } from '../context/SettingsContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useSettings()

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}
