import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { createOwnershipColumn } from '@/react/docker/components/datatable/createOwnershipColumn';

import { buildExpandColumn } from '@@/datatables/expand-column';

import { DecoratedNetwork } from '../types';

import { columnHelper } from './helper';
import { name } from './name';

export function useColumns(isHostColumnVisible?: boolean) {
  const { t } = useTranslation();

  return useMemo(
    () =>
      _.compact([
        buildExpandColumn<DecoratedNetwork>(),
        name,
        columnHelper.accessor((item) => item.StackName || '-', {
          id: 'stack',
          header: t('docker.networks.stack'),
        }),
        columnHelper.accessor('Driver', {
          id: 'driver',
          header: t('docker.networks.driver'),
        }),
        columnHelper.accessor('Attachable', {
          id: 'attachable',
          header: t('docker.networks.attachable'),
        }),
        columnHelper.accessor('IPAM.Driver', {
          id: 'ipamDriver',
          header: t('docker.networks.ipamDriver'),
        }),
        columnHelper.accessor(
          (item) => item.IPAM?.IPV4Configs?.[0]?.Subnet ?? '-',
          {
            id: 'ipv4Subnet',
            header: t('docker.networks.ipv4IpamSubnet'),
          }
        ),
        columnHelper.accessor(
          (item) => item.IPAM?.IPV4Configs?.[0]?.Gateway ?? '-',
          {
            id: 'ipv4Gateway',
            header: t('docker.networks.ipv4IpamGateway'),
          }
        ),
        columnHelper.accessor(
          (item) => item.IPAM?.IPV6Configs?.[0]?.Subnet ?? '-',
          {
            id: 'ipv6Subnet',
            header: t('docker.networks.ipv6IpamSubnet'),
          }
        ),
        columnHelper.accessor(
          (item) => item.IPAM?.IPV6Configs?.[0]?.Gateway ?? '-',
          {
            id: 'ipv6Gateway',
            header: t('docker.networks.ipv6IpamGateway'),
          }
        ),
        isHostColumnVisible &&
          columnHelper.accessor('NodeName', {
            id: 'node',
            header: t('docker.networks.node'),
          }),
        createOwnershipColumn<DecoratedNetwork>(),
      ]),
    [isHostColumnVisible, t]
  );
}
