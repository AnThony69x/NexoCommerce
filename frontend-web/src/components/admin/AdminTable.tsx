import type { ReactNode } from 'react'

type AdminTableProps = {
  encabezados: string[]
  children: ReactNode
}

export default function AdminTable({ encabezados, children }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-100/70">
            {encabezados.map((encabezado) => (
              <th
                key={encabezado}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500"
              >
                {encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr]:transition-colors [&_tr:hover]:bg-stone-50">
          {children}
        </tbody>
      </table>
    </div>
  )
}
