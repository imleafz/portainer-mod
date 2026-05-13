import { useTranslation } from 'react-i18next';
import { CellContext } from '@tanstack/react-table';

import { ImagesListResponse } from '@/react/docker/images/queries/useImages';

import { Badge } from '@@/Badge';

import { columnHelper } from './helper';

export const tags = columnHelper.accessor((item) => item.tags?.join(','), {
  id: 'tags',
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.images.tags');
  },
  cell: Cell,
});

function Cell({
  row: { original: item },
}: CellContext<ImagesListResponse, unknown>) {
  const repoTags = item.tags;

  return (
    <div className="flex flex-wrap gap-1">
      {repoTags?.map((tag, idx) => (
        <Badge key={idx} type="info">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
