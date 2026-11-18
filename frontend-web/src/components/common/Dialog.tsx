import { useEffect, useId, useRef, type ReactNode } from 'react'

export default function Dialog({ titulo, onCerrar, ocupado = false, children }: {
  titulo: string
  onCerrar: () => void
  ocupado?: boolean
  children: ReactNode
}) {
  const id = useId()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    const anterior = document.activeElement
    dialogo.showModal()
    return () => {
      dialogo.close()
      if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) onCerrar()
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-auto rounded-2xl bg-white p-5 text-stone-800 shadow-xl backdrop:bg-stone-900/40"
    >
      <h2 id={id} className="mb-4 text-lg font-semibold">{titulo}</h2>
      {children}
    </dialog>
  )
}
