export default function LocationButton({ onClick, isLoading }) {
  return (
    <button
      type="button"
      className="secondary-button"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? 'Obteniendo ubicación…' : 'Usar mi ubicación'}
    </button>
  )
}
