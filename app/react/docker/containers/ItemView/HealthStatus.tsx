import { ComponentProps } from 'react';
import { HeartPulse, Server } from 'lucide-react';
import { Health } from 'docker-types/generated/1.44';
import { useTranslation } from 'react-i18next';

import { TableContainer, TableTitle } from '@@/datatables';
import { DetailsTable } from '@@/DetailsTable';
import { Icon } from '@@/Icon';

const StatusMode: Record<
  Exclude<Health['Status'], undefined | 'none'>,
  ComponentProps<typeof Icon>['mode']
> = {
  healthy: 'success',
  unhealthy: 'danger',
  starting: 'warning',
};

interface Props {
  health: Health;
}

export function HealthStatus({ health }: Props) {
  const { t } = useTranslation();

  return (
    <TableContainer>
      <TableTitle label={t('docker.container.containerHealth')} icon={Server} />

      <DetailsTable dataCy="health-status-table">
        <DetailsTable.Row label={t('docker.container.healthStatus')}>
          {health.Status && health.Status !== 'none' ? (
            <div className="vertical-center">
              <Icon
                icon={HeartPulse}
                mode={StatusMode[health.Status]}
                className="space-right"
              />
              {health.Status}
            </div>
          ) : (
            <div>{t('docker.container.noHealthStatus')}</div>
          )}
        </DetailsTable.Row>

        <DetailsTable.Row label={t('docker.container.failureCount')}>
          <div className="vertical-center">{health.FailingStreak}</div>
        </DetailsTable.Row>

        {!!health.Log && (
          <DetailsTable.Row label={t('docker.container.lastOutput')}>
            {health.Log[health.Log.length - 1].Output}
          </DetailsTable.Row>
        )}
      </DetailsTable>
    </TableContainer>
  );
}
