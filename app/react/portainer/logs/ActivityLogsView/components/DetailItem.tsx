interface DetailItemProps {
  label: string;
  value: string | number | boolean | undefined | null;
  truncate?: boolean;
}

export function DetailItem({ label, value, truncate = true }: DetailItemProps) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const displayValue =
    typeof value === 'boolean' ? (value ? '是' : '否') : String(value);

  return (
    <div className="flex justify-between items-start py-1 gap-2">
      <span className="text-gray-600 text-sm shrink-0">{label}</span>
      <span
        className={`font-medium text-gray-900 text-sm text-right break-all ${
          truncate ? 'max-w-[60%] truncate' : ''
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
}
