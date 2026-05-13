import { useTranslation } from 'react-i18next';
import { DeviceRequest } from 'docker-types/generated/1.44';
import _ from 'lodash';

import { DetailsTable } from '@@/DetailsTable';

interface GpuRowProps {
  deviceRequests?: Array<DeviceRequest>;
}

export function GpuRow({ deviceRequests }: GpuRowProps) {
  const { t } = useTranslation();
  if (!deviceRequests?.length) {
    return null;
  }

  const gpuCommand = computeDockerGPUCommand(deviceRequests, t);

  if (!gpuCommand) {
    return null;
  }

  return (
    <DetailsTable.Row label={t('docker.container.gpu', 'GPU')}>
      {gpuCommand}
    </DetailsTable.Row>
  );
}

export function computeDockerGPUCommand(
  deviceRequests: Array<DeviceRequest>,
  translateFn: (key: string) => string
): string | null {
  const gpuOptions = deviceRequests?.find(
    (o) =>
      o.Driver === 'nvidia' ||
      (o.Capabilities &&
        o.Capabilities.length > 0 &&
        o.Capabilities[0].length > 0 &&
        o.Capabilities[0][0] === 'gpu')
  );
  if (!gpuOptions) {
    return translateFn('docker.container.noGpuConfigFound');
  }

  let gpuStr = 'all';
  if (gpuOptions.Count !== -1) {
    gpuStr = `"device=${_.join(gpuOptions.DeviceIDs, ',')}"`;
  }

  const capStr = gpuOptions.Capabilities
    ? `"capabilities=${_.join(gpuOptions.Capabilities[0], ',')}"`
    : '';
  return `${gpuStr},${capStr}`;
}
