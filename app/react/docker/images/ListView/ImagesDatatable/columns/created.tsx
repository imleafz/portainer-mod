import { useTranslation } from 'react-i18next';

import { isoDateFromTimestamp } from '@/portainer/filters/filters';

import { columnHelper } from './helper';

export const created = columnHelper.accessor('created', {
  id: 'created',
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.images.created');
  },
  cell: ({ getValue }) => {
    const value = getValue();
    return isoDateFromTimestamp(value);
  },
});
