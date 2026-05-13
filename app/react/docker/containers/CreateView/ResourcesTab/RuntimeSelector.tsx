import { useTranslation } from 'react-i18next';

import { useInfo } from '@/react/docker/proxy/queries/useInfo';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';

import { PortainerSelect } from '@@/form-components/PortainerSelect';

export function RuntimeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const environmentId = useEnvironmentId();
  const infoQuery = useInfo(environmentId, {
    select: (info) => [
      { label: t('common.default'), value: '' },
      ...Object.keys(info?.Runtimes || {}).map((runtime) => ({
        label: runtime,
        value: runtime,
      })),
    ],
  });

  return (
    <PortainerSelect
      onChange={onChange}
      value={value}
      options={infoQuery.data || []}
      isLoading={infoQuery.isLoading}
      disabled={infoQuery.isLoading}
      data-cy="docker-runtime-selector"
    />
  );
}
