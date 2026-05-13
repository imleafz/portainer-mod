import { createColumnHelper } from '@tanstack/react-table';

import { isoDate } from '@/portainer/filters/filters';
import { createOwnershipColumn } from '@/react/docker/components/datatable/createOwnershipColumn';

import { buildNameColumnFromObject } from '@@/datatables/buildNameColumn';

import { ConfigViewModel } from '../../model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useTranslation } = require('react-i18next');

const columnHelper = createColumnHelper<ConfigViewModel>();

export const columns = [
  buildNameColumnFromObject<ConfigViewModel>({
    nameKey: 'Name',
    path: 'docker.configs.config',
    dataCy: 'docker-configs-name',
  }),
  columnHelper.accessor('CreatedAt', {
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t('docker.configs.creationDate');
    },
    cell: ({ getValue }) => {
      const date = getValue();
      return <time dateTime={date}>{isoDate(date)}</time>;
    },
  }),
  createOwnershipColumn<ConfigViewModel>(),
];
