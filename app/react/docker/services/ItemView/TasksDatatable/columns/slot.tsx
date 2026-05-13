import { useTranslation } from 'react-i18next';

import { columnHelper } from './helper';

export const slot = columnHelper.accessor((item) => item.Slot || '-', {
  id: 'slot',
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.services.slot');
  },
});
