type NodeFieldListProps = {
  fields: Array<{
    label: string;
    value: string;
  }>;
};

export function NodeFieldList({ fields }: NodeFieldListProps) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {field.label}
          </dt>
          <dd className="mt-1 text-xs font-medium text-slate-900 md:text-sm">{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}
