import { useNavigate } from 'react-router-dom'

type BackButtonProps = {
  fallback?: string
}

export default function BackButton({ fallback = '/' }: BackButtonProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(fallback)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500"
    >
      Volver
    </button>
  )
}
