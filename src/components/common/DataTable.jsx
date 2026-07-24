import { Loader2, Inbox, AlertCircle } from "lucide-react";

export default function DataTable({ columns, rows, loading, error, emptyLabel = "Nothing here yet" }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-ink-800/50">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <AlertCircle className="h-6 w-6 text-danger" />
        <p className="text-sm font-medium text-ink-950">Couldn't load this list</p>
        <p className="max-w-sm text-xs text-ink-800/50">{error}</p>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-ink-800/40">
        <Inbox className="h-6 w-6" />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-surface-200 text-left text-xs uppercase tracking-wide text-ink-800/40">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id ?? idx}
              className="border-b border-surface-100 last:border-0 hover:bg-surface-50"
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3.5 align-middle text-ink-900">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
