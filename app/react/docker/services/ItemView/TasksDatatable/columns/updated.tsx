import { useTranslation } from 'react-i18next';

import { isoDate } from '@/portainer/filters/filters';

import { columnHelper } from './helper';

export const updated = columnHelper.accessor('Updated', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.services.lastUpdate');
  },
  cell: ({ getValue }) => isoDate(getValue()),
});
