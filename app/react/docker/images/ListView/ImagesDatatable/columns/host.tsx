import { useTranslation } from 'react-i18next';

import { columnHelper } from './helper';

export const host = columnHelper.accessor('nodeName', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.images.host');
  },
  cell: ({ getValue }) => {
    const value = getValue();
    return value || '-';
  },
});
