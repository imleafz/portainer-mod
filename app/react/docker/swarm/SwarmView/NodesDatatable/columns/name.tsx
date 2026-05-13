import { useTranslation } from 'react-i18next';
import { CellContext } from '@tanstack/react-table';

import { NodeViewModel } from '@/docker/models/node';

import { Link } from '@@/Link';

import { isTableMeta } from '../types';

import { columnHelper } from './column-helper';

export const name = columnHelper.accessor('Hostname', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.swarm.name');
  },
  cell: Cell,
});

function Cell({
  getValue,
  row: { original: item },
  table: {
    options: { meta },
  },
}: CellContext<NodeViewModel, NodeViewModel['Hostname']>) {
  if (!isTableMeta(meta)) {
    throw new Error('Invalid table meta');
  }

  const value = getValue();

  if (!meta.haveAccessToNode) {
    return <>{value}</>;
  }

  return (
    <Link
      to="docker.nodes.node"
      params={{ id: item.Id }}
      data-cy={`node-link-${item.Id}`}
    >
      {value}
    </Link>
  );
}
