import { List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ContainerDetailsViewModel } from '@/docker/models/containerDetails';
import { EnvironmentId } from '@/react/portainer/environments/types';
import { joinCommand } from '@/docker/filters/utils';

import { DetailsTable } from '@@/DetailsTable';
import { Widget } from '@@/Widget';

import { RestartPolicy } from '../../CreateView/RestartPolicyTab/types';
import { RestartPolicySection } from '../RestartPolicySection/RestartPolicySection';

import { ImageRow } from './ImageRow';
import { PortConfigurationRow } from './PortConfigurationRow';
import { EnvironmentVariablesRow } from './EnvironmentVariablesRow';
import { LabelsRow } from './LabelsRow';
import { SysctlsRow } from './SysctlsRow';
import { GpuRow } from './GpuRow';

interface Props {
  environmentId: EnvironmentId;
  container: ContainerDetailsViewModel;
  nodeName?: string;
  onUpdateSuccess?(): void;
}

export function ContainerDetailsSection({
  environmentId,
  container,
  nodeName,
  onUpdateSuccess,
}: Props) {
  const { t } = useTranslation();
  const config = container.Config;
  const hostConfig = container.HostConfig;

  if (!config || !hostConfig || !container.Id) {
    return null;
  }

  const restartPolicyName = hostConfig.RestartPolicy?.Name as
    | RestartPolicy
    | undefined;

  return (
    <Widget>
      <Widget.Title
        icon={List}
        title={t('docker.container.containerDetails')}
      />
      <Widget.Body>
        <DetailsTable dataCy="container-details-table">
          <ImageRow
            image={config.Image || ''}
            imageHash={container.Image || ''}
            nodeName={nodeName}
          />

          <PortConfigurationRow ports={container.NetworkSettings?.Ports} />

          <DetailsTable.Row label={t('docker.container.cmd')}>
            <code>{joinCommand(config.Cmd)}</code>
          </DetailsTable.Row>

          <DetailsTable.Row label={t('docker.container.entrypoint')}>
            <code>
              {config.Entrypoint ? joinCommand(config.Entrypoint) : 'null'}
            </code>
          </DetailsTable.Row>

          <EnvironmentVariablesRow variables={config.Env} />

          <LabelsRow labels={config.Labels} />

          <DetailsTable.Row label={t('docker.container.restartPolicies')}>
            <RestartPolicySection
              environmentId={environmentId}
              containerId={container.Id}
              nodeName={nodeName}
              name={restartPolicyName}
              maximumRetryCount={hostConfig.RestartPolicy?.MaximumRetryCount}
              onUpdateSuccess={onUpdateSuccess}
            />
          </DetailsTable.Row>

          <SysctlsRow sysctls={hostConfig.Sysctls} />

          <GpuRow deviceRequests={hostConfig.DeviceRequests} />
        </DetailsTable>
      </Widget.Body>
    </Widget>
  );
}
