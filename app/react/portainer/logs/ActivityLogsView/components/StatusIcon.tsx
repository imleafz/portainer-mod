import {
  Plus,
  Edit,
  Trash2,
  Play,
  Square,
  RotateCcw,
  Upload,
  RefreshCw,
  Activity,
} from 'lucide-react';

interface StatusIconProps {
  action: string;
  size?: number;
}

const actionConfig: Record<
  string,
  { icon: typeof Activity; color: string; bgColor: string }
> = {
  创建: { icon: Plus, color: 'text-green-600', bgColor: 'bg-green-100' },
  更新: { icon: Edit, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  删除: { icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100' },
  启动: { icon: Play, color: 'text-green-600', bgColor: 'bg-green-100' },
  停止: { icon: Square, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  重启: { icon: RotateCcw, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  部署: { icon: Upload, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  重新部署: { icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-100' },
};

export function StatusIcon({ action, size = 16 }: StatusIconProps) {
  const config = actionConfig[action] || {
    icon: Activity,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor}`}
    >
      <Icon className={config.color} size={size} />
    </span>
  );
}
