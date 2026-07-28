import { type HTMLAttributes } from "react";

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[];
  data: T[];
  /** Show striped rows */
  striped?: boolean;
  /** Show hover effect */
  hoverable?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  striped = false,
  hoverable = true,
  emptyMessage = "No data available",
  className = "",
  ...props
}: TableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-neutral-100 ${className}`}
      {...props}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wider"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 text-neutral-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-neutral-50 last:border-b-0 ${
                  striped && i % 2 === 1 ? "bg-neutral-50/50" : ""
                } ${hoverable ? "hover:bg-neutral-50/80 transition-colors" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-neutral-600">
                    {col.render
                      ? col.render(row, i)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
