import { createContext, useContext, useEffect, useState } from 'react'

const SettingsContext = createContext(null)
const STORAGE_KEY = 'weather-app-settings'
const DEFAULT_SETTINGS = { theme: 'light', units: 'metric' }

function readSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_SETTINGS

    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS

    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      units: parsed.units === 'imperial' ? 'imperial' : 'metric',
    }
  } catch (error) {
    console.warn('No se pudieron leer las preferencias guardadas', error)
    return DEFAULT_SETTINGS
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => readSettings())

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn('No se pudieron guardar las preferencias', error)
    }
  }, [settings])

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }

  const setUnits = (units) => {
    setSettings((prev) => ({
      ...prev,
      units: units === 'imperial' ? 'imperial' : 'metric',
    }))
  }

  return (
    <SettingsContext.Provider value={{ theme: settings.theme, units: settings.units, toggleTheme, setUnits }}>
      {children}
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettings debe usarse dentro de un SettingsProvider')
  }

  return context
}
