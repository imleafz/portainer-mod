import { useTranslation } from 'react-i18next';
import { CellContext } from '@tanstack/react-table';

import { ServiceViewModel } from '@/docker/models/service';
import { useCurrentEnvironment } from '@/react/hooks/useCurrentEnvironment';
import { PublishedPortLink } from '@/react/docker/components/ImageStatus/PublishedPortLink';

import { columnHelper } from './helper';

export const ports = columnHelper.accessor(
  (row) =>
    (row.Ports || [])
      .filter((port) => port.PublishedPort)
      .map((port) => `${port.PublishedPort}:${port.TargetPort}`)
      .join(','),
  {
    id: 'ports',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t('docker.services.publishedPorts');
    },
    cell: Cell,
  }
);

function Cell({
  row: { original: item },
}: CellContext<ServiceViewModel, string>) {
  const environmentQuery = useCurrentEnvironment();

  if (!environmentQuery.data) {
    return null;
  }

  const ports = item.Ports || [];

  if (ports.length === 0) {
    return '-';
  }

  return ports
    .filter((port) => port.PublishedPort)
    .map((port) => (
      <PublishedPortLink
        key={port.PublishedPort}
        hostPort={port.PublishedPort}
        containerPort={port.TargetPort}
        hostURL={environmentQuery.data.PublicURL}
      />
    ));
}
