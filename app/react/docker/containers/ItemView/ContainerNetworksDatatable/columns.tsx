import { buildExpandColumn } from '@@/datatables/expand-column';
import { buildNameColumnFromObject } from '@@/datatables/buildNameColumn';

import { TableNetwork } from './types';
import { columnHelper } from './helper';
import { buildActions } from './actions';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useTranslation } = require('react-i18next');

export function buildColumns({ nodeName }: { nodeName?: string } = {}) {
  return [
    buildExpandColumn<TableNetwork>(),
    {
      ...buildNameColumnFromObject<TableNetwork>({
        nameKey: 'name',
        path: 'docker.networks.network',
        dataCy: 'docker-networks-name',
        linkParamsBuilder: () => ({ nodeName }),
      }),
      header: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { t } = useTranslation();
        return t('docker.container.networkTableHeader');
      },
    },
    columnHelper.accessor((item) => item.IPAddress || '-', {
      header: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { t } = useTranslation();
        return t('docker.container.ipAddressTableHeader');
      },
      id: 'ip',
      enableSorting: false,
    }),
    columnHelper.accessor((item) => item.Gateway || '-', {
      header: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { t } = useTranslation();
        return t('docker.container.gatewayTableHeader');
      },
      id: 'gateway',
      enableSorting: false,
    }),
    columnHelper.accessor((item) => item.MacAddress || '-', {
      header: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { t } = useTranslation();
        return t('docker.container.macAddressTableHeader');
      },
      id: 'macAddress',
      enableSorting: false,
    }),
    buildActions({ nodeName }),
  ];
}
