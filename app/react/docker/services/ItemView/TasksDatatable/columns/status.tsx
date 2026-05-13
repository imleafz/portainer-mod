import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { taskStatusBadge } from '@/docker/filters/utils';

import { multiple } from '@@/datatables/filter-types';
import { filterHOC } from '@@/datatables/Filter';

import { columnHelper } from './helper';

export const status = columnHelper.accessor((item) => item.Status?.State, {
  id: 'status',
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.services.status');
  },
  enableColumnFilter: true,
  filterFn: multiple,
  meta: {
    filter: filterHOC('Filter by state'),
    width: 100,
  },
  cell({ getValue }) {
    const value = getValue();

    return (
      <span className={clsx('label', `label-${taskStatusBadge(value)}`)}>
        {value}
      </span>
    );
  },
});
