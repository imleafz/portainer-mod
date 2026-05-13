import { useTranslation } from 'react-i18next';

import { columnHelper } from './helper';

export const stack = columnHelper.accessor((row) => row.StackName || '-', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.container.stack');
  },
  id: 'stack',
});
