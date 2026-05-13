import { createColumnHelper } from '@tanstack/react-table';
import { History, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { isoDateFromTimestamp } from '@/portainer/filters/filters';

import { ExpandableDatatable } from '@@/datatables/ExpandableDatatable';
import { Button } from '@@/buttons';
import { JsonTree } from '@@/JsonTree';

import { ActivityLog } from './types';
import { getSortType } from './useActivityLogs';
import { DetailCard } from './components/DetailCard';
import { DetailItem } from './components/DetailItem';
import { StatusIcon } from './components/StatusIcon';

const columnHelper = createColumnHelper<ActivityLog>();

const actionLabels: Record<string, { label: string; color: string }> = {
  创建: { label: '创建', color: 'green' },
  更新: { label: '更新', color: 'blue' },
  删除: { label: '删除', color: 'red' },
  启动: { label: '启动', color: 'green' },
  停止: { label: '停止', color: 'orange' },
  重启: { label: '重启', color: 'blue' },
  部署: { label: '部署', color: 'purple' },
  重新部署: { label: '重新部署', color: 'blue' },
};

const resourceTypeLabels: Record<string, { label: string; category: string }> =
  {
    'Docker 容器': { label: 'Docker 容器', category: 'Docker' },
    'Docker 镜像': { label: 'Docker 镜像', category: 'Docker' },
    'Docker 网络': { label: 'Docker 网络', category: 'Docker' },
    'Docker 存储卷': { label: 'Docker 存储卷', category: 'Docker' },
    'Docker Service': { label: 'Docker Service', category: 'Docker' },
    'Docker 堆栈': { label: 'Docker 堆栈', category: 'Docker' },
    用户: { label: '用户', category: 'Portainer' },
    团队: { label: '团队', category: 'Portainer' },
    环境: { label: '环境', category: 'Portainer' },
    注册表: { label: '注册表', category: 'Portainer' },
    自定义模板: { label: '自定义模板', category: 'Portainer' },
    Webhook: { label: 'Webhook', category: 'Portainer' },
    'Helm Release': { label: 'Helm Release', category: 'Helm' },
  };

export function ActivityLogsTable({
  dataset,
  currentPage,
  keyword,
  limit,
  onChangeKeyword,
  onChangeLimit,
  onChangePage,
  onChangeSort,
  sort,
  totalItems,
}: {
  keyword: string;
  onChangeKeyword(keyword: string): void;
  sort: { id: string; desc: boolean } | undefined;
  onChangeSort(sort: { id: string; desc: boolean } | undefined): void;
  limit: number;
  onChangeLimit(limit: number): void;
  currentPage: number;
  onChangePage(page: number): void;
  totalItems: number;
  dataset?: Array<ActivityLog>;
}) {
  const { t } = useTranslation();

  const getActionLabel = (action: string) => {
    const label = actionLabels[action]?.label;
    if (!label) return action;
    switch (action) {
      case '创建':
        return t('activityLogs.filter.actionCreate');
      case '更新':
        return t('activityLogs.filter.actionUpdate');
      case '删除':
        return t('activityLogs.filter.actionDelete');
      case '启动':
        return t('activityLogs.filter.actionStart');
      case '停止':
        return t('activityLogs.filter.actionStop');
      case '重启':
        return t('activityLogs.filter.actionRestart');
      case '部署':
        return t('activityLogs.filter.actionDeploy');
      case '重新部署':
        return t('activityLogs.filter.actionUpdate');
      default:
        return label;
    }
  };

  const getResourceTypeLabel = (resourceType: string) => {
    const info = resourceTypeLabels[resourceType];
    if (!info) return resourceType;
    switch (resourceType) {
      case 'Docker 容器':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.container')}`;
      case 'Docker 镜像':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.table.resourceType')}`;
      case 'Docker 网络':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.contextType')}`;
      case 'Docker 存储卷':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.resourceType')}`;
      case 'Docker Service':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.service')}`;
      case 'Docker 堆栈':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.stack')}`;
      case '用户':
        return t('activityLogs.filter.user');
      case '团队':
        return t('activityLogs.filter.team');
      case '环境':
        return t('activityLogs.filter.environment');
      case '注册表':
        return t('activityLogs.filter.registry');
      case '自定义模板':
        return t('activityLogs.table.resourceType');
      case 'Webhook':
        return 'Webhook';
      case 'Helm Release':
        return 'Helm Release';
      default:
        return info.label;
    }
  };

  const columns = [
    columnHelper.accessor('timestamp', {
      id: 'Timestamp',
      header: () => t('activityLogs.table.timestamp'),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? isoDateFromTimestamp(value) : '';
      },
    }),
    columnHelper.accessor('username', {
      id: 'Username',
      header: () => t('activityLogs.table.username'),
    }),
    columnHelper.accessor('context', {
      id: 'Context',
      header: () => t('activityLogs.table.context'),
    }),
    columnHelper.accessor('action', {
      id: 'Action',
      header: () => t('activityLogs.table.action'),
      cell: ({ getValue }) => {
        const action = getValue();
        return getActionLabel(action);
      },
    }),
    columnHelper.accessor('resourceType', {
      id: 'ResourceType',
      header: () => t('activityLogs.table.resourceType'),
      cell: ({ getValue }) => {
        const resourceType = getValue();
        return getResourceTypeLabel(resourceType);
      },
    }),
    columnHelper.accessor('resourceName', {
      id: 'ResourceName',
      header: () => t('activityLogs.table.resourceName'),
      cell: ({ getValue, row }) => {
        const name = getValue();
        const { resourceType, resourceID, payload: rawPayload } = row.original;
        // Try to get resourceName from payload if main resourceName is empty
        const payload =
          typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
        const payloadResourceName = payload?.resourceName;

        // If main resourceName is empty, try payload.resourceName
        const displayName = name || payloadResourceName;

        if (!displayName && !resourceID) return '-';
        if (displayName) return displayName;
        return `${resourceType} #${resourceID}`;
      },
    }),
    columnHelper.accessor('payload', {
      header: () => t('activityLogs.table.details'),
      enableSorting: false,
      cell: ({ row, getValue }) =>
        getValue() ? (
          <Button
            color="link"
            onClick={() => row.toggleExpanded()}
            icon={Search}
            data-cy={`activity-logs-inspect_${row.index}`}
          >
            {t('activityLogs.subrow.view')}
          </Button>
        ) : null,
    }),
  ];

  return (
    <ExpandableDatatable<ActivityLog>
      title="Activity logs"
      titleIcon={History}
      columns={columns}
      dataset={dataset || []}
      isLoading={!dataset}
      settingsManager={{
        pageSize: limit,
        search: keyword,
        setPageSize: onChangeLimit,
        setSearch: onChangeKeyword,
        setSortBy: (id, desc) =>
          onChangeSort({ id: getSortType(id) || 'Timestamp', desc }),
        sortBy: sort
          ? {
              id: sort.id,
              desc: sort.desc,
            }
          : undefined,
      }}
      page={currentPage}
      onPageChange={onChangePage}
      isServerSidePagination
      totalCount={totalItems}
      disableSelect
      renderSubRow={(row) => <SubRow item={row.original} />}
      data-cy="activity-logs-datatable"
    />
  );
}

function SubRow({ item }: { item: ActivityLog }) {
  const { t } = useTranslation();

  const getActionLabel = (action: string) => {
    const label = actionLabels[action]?.label;
    if (!label) return action;
    switch (action) {
      case '创建':
        return t('activityLogs.filter.actionCreate');
      case '更新':
        return t('activityLogs.filter.actionUpdate');
      case '删除':
        return t('activityLogs.filter.actionDelete');
      case '启动':
        return t('activityLogs.filter.actionStart');
      case '停止':
        return t('activityLogs.filter.actionStop');
      case '重启':
        return t('activityLogs.filter.actionRestart');
      case '部署':
        return t('activityLogs.filter.actionDeploy');
      case '重新部署':
        return t('activityLogs.filter.actionUpdate');
      default:
        return label;
    }
  };

  const getResourceTypeLabel = (resourceType: string) => {
    const info = resourceTypeLabels[resourceType];
    if (!info) return resourceType;
    switch (resourceType) {
      case 'Docker 容器':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.container')}`;
      case 'Docker 镜像':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.table.resourceType')}`;
      case 'Docker 网络':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.contextType')}`;
      case 'Docker 存储卷':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.resourceType')}`;
      case 'Docker Service':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.service')}`;
      case 'Docker 堆栈':
        return `${t('activityLogs.filter.docker')} ${t('activityLogs.filter.stack')}`;
      case '用户':
        return t('activityLogs.filter.user');
      case '团队':
        return t('activityLogs.filter.team');
      case '环境':
        return t('activityLogs.filter.environment');
      case '注册表':
        return t('activityLogs.filter.registry');
      case '自定义模板':
        return t('activityLogs.table.resourceType');
      case 'Webhook':
        return 'Webhook';
      case 'Helm Release':
        return 'Helm Release';
      default:
        return info.label;
    }
  };

  const actionLabel = getActionLabel(item.action);
  const payload =
    typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;

  return (
    <tr>
      <td colSpan={Number.MAX_SAFE_INTEGER}>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg border">
            <StatusIcon action={actionLabel} size={20} />
            <span className="text-lg font-medium text-gray-900 whitespace-nowrap">
              {actionLabel}了{getResourceTypeLabel(item.resourceType)}
            </span>
            <span className="text-lg font-semibold text-blue-600 break-all">
              "{payload?.resourceName || item.resourceName}"
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <DetailCard title={t('activityLogs.subrow.basicInfo')}>
              <DetailItem
                label={t('activityLogs.subrow.resourceType')}
                value={getResourceTypeLabel(item.resourceType)}
              />
              <DetailItem
                label={t('activityLogs.subrow.resourceName')}
                value={payload?.resourceName || item.resourceName}
              />
              <DetailItem
                label={t('activityLogs.subrow.resourceId')}
                value={item.resourceID}
              />
              <DetailItem
                label={t('activityLogs.subrow.operator')}
                value={item.username}
              />
            </DetailCard>

            {(payload?.team || payload?.endpoint || payload?.namespace) && (
              <DetailCard title={t('activityLogs.subrow.relatedInfo')}>
                {payload?.team && (
                  <DetailItem
                    label={t('activityLogs.subrow.team')}
                    value={payload.team}
                  />
                )}
                {payload?.endpoint && (
                  <DetailItem
                    label={t('activityLogs.subrow.endpoint')}
                    value={payload.endpoint}
                  />
                )}
                {payload?.namespace && (
                  <DetailItem
                    label={t('activityLogs.subrow.namespace')}
                    value={payload.namespace}
                  />
                )}
              </DetailCard>
            )}

            {payload?.description && (
              <DetailCard title={t('activityLogs.subrow.operationDesc')}>
                <div className="py-2 text-blue-600 font-medium break-words whitespace-pre-wrap">
                  {payload.description}
                </div>
              </DetailCard>
            )}
          </div>

          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <span className="transform group-open:rotate-90 transition-transform">
                ▶
              </span>
              {t('activityLogs.subrow.viewRawJson')}
            </summary>
            <div className="mt-2 p-3 bg-gray-900 rounded text-gray-100 text-xs font-mono overflow-auto max-h-48">
              <JsonTree data={item.payload} />
            </div>
          </details>
        </div>
      </td>
    </tr>
  );
}
