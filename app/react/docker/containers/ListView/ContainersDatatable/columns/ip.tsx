import { useTranslation } from 'react-i18next';

import { columnHelper } from './helper';

export const ip = columnHelper.accessor((row) => row.IP || '-', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.container.ipAddress');
  },
  id: 'ip',
});
