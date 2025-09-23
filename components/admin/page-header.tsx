import { AutoBreadcrumbs } from "./breadcrumbs"

export function PageHeader({ title, description, right }: { title: string; description?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <AutoBreadcrumbs />
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-neutral-400">{description}</p> : null}
      </div>
      {right ? <div className="flex-shrink-0">{right}</div> : null}
    </div>
  )
}
