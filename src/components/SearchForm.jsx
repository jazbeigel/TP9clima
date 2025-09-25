import { useState } from 'react'

export default function SearchForm({ onSearch, isLoading }) {
  const [value, setValue] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSearch?.(trimmed)
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="city"
        autoComplete="off"
        placeholder="Buscar ciudad"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Buscar ciudad"
      />
      <button type="submit" className="search-button" disabled={isLoading}>
        {isLoading ? 'Buscando…' : 'Buscar'}
      </button>
    </form>
  )
}
