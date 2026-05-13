import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsSwarm } from '@/react/docker/proxy/queries/useInfo';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { createOwnershipColumn } from '@/react/docker/components/datatable/createOwnershipColumn';
import { isoDate, truncateLeftRight } from '@/portainer/filters/filters';

import { DecoratedVolume } from '../../types';

import { columnHelper } from './helper';
import { name } from './name';

export function useColumns() {
  const environmentId = useEnvironmentId();
  const isSwarm = useIsSwarm(environmentId);
  const { t } = useTranslation();

  return useMemo(
    () =>
      _.compact([
        name,
        columnHelper.accessor((item) => item.StackName || '-', {
          id: 'stack',
          header: t('docker.volumes.stack'),
        }),
        columnHelper.accessor((item) => item.Driver, {
          id: 'driver',
          header: t('docker.volumes.driver'),
        }),
        columnHelper.accessor((item) => item.Mountpoint, {
          id: 'mountpoint',
          header: t('docker.volumes.mountPoint'),
          cell({ getValue }) {
            return truncateLeftRight(getValue());
          },
        }),
        columnHelper.accessor((item) => item.CreatedAt, {
          id: 'created',
          header: t('docker.volumes.created'),
          cell({ getValue }) {
            return isoDate(getValue());
          },
        }),
        isSwarm &&
          columnHelper.accessor((item) => item.NodeName || '-', {
            id: 'host',
            header: t('docker.volumes.host'),
          }),
        createOwnershipColumn<DecoratedVolume>(),
      ]),
    [isSwarm, t]
  );
}
