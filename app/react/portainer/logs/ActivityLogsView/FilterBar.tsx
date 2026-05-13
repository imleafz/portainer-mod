import { DownloadIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Widget } from '@@/Widget';
import { TextTip } from '@@/Tip/TextTip';
import { Button } from '@@/buttons';

import { DateRangePicker } from '../components/DateRangePicker';

export function FilterBar({
  value,
  onChange,
  onExport,
}: {
  value: { start: Date; end: Date | null } | undefined;
  onChange: (value?: { start: Date; end: Date | null }) => void;
  onExport: () => void;
}) {
  const { t } = useTranslation();

  const actionOptions = [
    { value: '创建', label: t('activityLogs.filter.actionCreate') },
    { value: '更新', label: t('activityLogs.filter.actionUpdate') },
    { value: '删除', label: t('activityLogs.filter.actionDelete') },
    { value: '启动', label: t('activityLogs.filter.actionStart') },
    { value: '停止', label: t('activityLogs.filter.actionStop') },
    { value: '重启', label: t('activityLogs.filter.actionRestart') },
    { value: '部署', label: t('activityLogs.filter.actionDeploy') },
  ];

  const resourceTypeOptions = [
    {
      label: t('activityLogs.filter.docker'),
      options: [
        { value: 'Docker 容器', label: t('activityLogs.filter.container') },
        { value: 'Docker Service', label: t('activityLogs.filter.service') },
        { value: 'Docker 堆栈', label: t('activityLogs.filter.stack') },
      ],
    },
    {
      label: t('activityLogs.filter.portainer'),
      options: [
        { value: '用户', label: t('activityLogs.filter.user') },
        { value: '团队', label: t('activityLogs.filter.team') },
        { value: '环境', label: t('activityLogs.filter.environment') },
        { value: '注册表', label: t('activityLogs.filter.registry') },
      ],
    },
  ];

  const contextOptions = [
    { value: 'Docker', label: t('activityLogs.filter.docker') },
    { value: 'Kubernetes', label: t('activityLogs.filter.kubernetes') },
    { value: 'Portainer', label: t('activityLogs.filter.portainer') },
  ];

  const [showFilters, setShowFilters] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>(
    []
  );
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);

  const hasActiveFilters =
    selectedActions.length > 0 ||
    selectedResourceTypes.length > 0 ||
    selectedContexts.length > 0;

  return (
    <Widget>
      <Widget.Body>
        <form className="form-horizontal">
          <DateRangePicker value={value} onChange={onChange} />

          <TextTip color="blue">
            Portainer user activity logs have a maximum retention of 7 days.
          </TextTip>

          <div className="mt-4 flex items-center gap-4">
            <Button
              color="secondary"
              onClick={() => setShowFilters(!showFilters)}
              data-cy="activity-logs-advanced-filter-button"
            >
              {t('activityLogs.filter.advancedFilter')}
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {selectedActions.length +
                    selectedResourceTypes.length +
                    selectedContexts.length}
                </span>
              )}
            </Button>

            <Button
              color="primary"
              icon={DownloadIcon}
              onClick={onExport}
              data-cy="activity-logs-export-csv-button"
            >
              {t('activityLogs.filter.exportCsv')}
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                color="link"
                onClick={() => {
                  setSelectedActions([]);
                  setSelectedResourceTypes([]);
                  setSelectedContexts([]);
                }}
                data-cy="activity-logs-reset-filter-button"
              >
                {t('activityLogs.filter.resetFilters')}
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded border">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('activityLogs.filter.actionType')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {actionOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer ${
                        selectedActions.includes(option.value)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedActions.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedActions([
                              ...selectedActions,
                              option.value,
                            ]);
                          } else {
                            setSelectedActions(
                              selectedActions.filter((v) => v !== option.value)
                            );
                          }
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('activityLogs.filter.resourceType')}
                </label>
                <div className="space-y-2">
                  {resourceTypeOptions.map((group) => (
                    <div key={group.label}>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {group.label}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => (
                          <label
                            key={option.value}
                            className={`inline-flex items-center px-2 py-1 rounded text-sm cursor-pointer ${
                              selectedResourceTypes.includes(option.value)
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={selectedResourceTypes.includes(
                                option.value
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedResourceTypes([
                                    ...selectedResourceTypes,
                                    option.value,
                                  ]);
                                } else {
                                  setSelectedResourceTypes(
                                    selectedResourceTypes.filter(
                                      (v) => v !== option.value
                                    )
                                  );
                                }
                              }}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('activityLogs.filter.contextType')}
                </label>
                <div className="flex gap-2">
                  {contextOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`inline-flex items-center px-3 py-1 rounded text-sm cursor-pointer ${
                        selectedContexts.includes(option.value)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedContexts.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContexts([
                              ...selectedContexts,
                              option.value,
                            ]);
                          } else {
                            setSelectedContexts(
                              selectedContexts.filter((v) => v !== option.value)
                            );
                          }
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </Widget.Body>
    </Widget>
  );
}
