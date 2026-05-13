import { ReactNode } from 'react';

interface DetailCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DetailCard({
  title,
  children,
  className = '',
}: DetailCardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
