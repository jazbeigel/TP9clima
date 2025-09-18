import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SettingsContext = createContext(null)

const STORAGE_KEY = 'weather-app-settings'

function getInitialSettings() {
  if (typeof window === 'undefined') {
    return { theme: 'light', units: 'metric' }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') {
        return {
          theme: parsed.theme === 'dark' ? 'dark' : 'light',
          units: parsed.units === 'imperial' ? 'imperial' : 'metric',
        }
      }
    }
  } catch (error) {
    console.warn('Unable to read settings from localStorage', error)
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches

  return {
    theme: prefersDark ? 'dark' : 'light',
    units: 'metric',
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => getInitialSettings())

  useEffect(() => {
    if (typeof document === 'undefined') return

    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn('Unable to persist settings on localStorage', error)
    }
  }, [settings])

  const value = useMemo(
    () => ({
      theme: settings.theme,
      units: settings.units,
      setTheme: (theme) =>
        setSettings((prev) => ({
          ...prev,
          theme: theme === 'dark' ? 'dark' : 'light',
        })),
      toggleTheme: () =>
        setSettings((prev) => ({
          ...prev,
          theme: prev.theme === 'dark' ? 'light' : 'dark',
        })),
      setUnits: (units) =>
        setSettings((prev) => ({
          ...prev,
          units: units === 'imperial' ? 'imperial' : 'metric',
        })),
      toggleUnits: () =>
        setSettings((prev) => ({
          ...prev,
          units: prev.units === 'metric' ? 'imperial' : 'metric',
        })),
    }),
    [settings.theme, settings.units],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }

  return context
}
