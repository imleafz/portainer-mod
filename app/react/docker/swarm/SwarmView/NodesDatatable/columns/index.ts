import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { humanize } from '@/portainer/filters/filters';

import { columnHelper } from './column-helper';
import { name } from './name';
import { status } from './status';
import { availability } from './availability';

export { name, status };

export const role = columnHelper.accessor('Role', {});

export const engine = columnHelper.accessor('EngineVersion', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.swarm.engine');
  },
});

export const ip = columnHelper.accessor('Addr', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.swarm.ipAddress');
  },
});

export const cpu = columnHelper.accessor(
  (item) => (item.CPUs ? item.CPUs / 1000000000 : 0),
  {
    id: 'cpu',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t('docker.swarm.cpu');
    },
  }
);

export const memory = columnHelper.accessor('Memory', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.swarm.memory');
  },
  cell({ getValue }) {
    const value = getValue();
    return humanize(value);
  },
});

export function useColumns(isIpColumnVisible: boolean) {
  return useMemo(
    () =>
      _.compact([
        name,
        role,
        cpu,
        memory,
        engine,
        isIpColumnVisible && ip,
        status,
        availability,
      ]),
    [isIpColumnVisible]
  );
}
