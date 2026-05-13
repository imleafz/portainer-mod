import { useTranslation } from 'react-i18next';

import { isoDateFromTimestamp } from '@/portainer/filters/filters';

import { columnHelper } from './helper';

export const created = columnHelper.accessor(
  (row) => isoDateFromTimestamp(row.Created),
  {
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t('docker.container.created');
    },
    id: 'created',
    cell: ({ row }) => isoDateFromTimestamp(row.original.Created),
  }
);
