import { useTranslation } from 'react-i18next';

import { humanize } from '@/portainer/filters/filters';

import { columnHelper } from './helper';

export const size = columnHelper.accessor('size', {
  id: 'size',
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.images.size');
  },
  cell: ({ getValue }) => {
    const value = getValue();
    return humanize(value) || '-';
  },
});
