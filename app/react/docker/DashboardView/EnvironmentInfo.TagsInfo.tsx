import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { useTags } from '@/portainer/tags/queries';

import { DetailsTable } from '@@/DetailsTable';

export function TagsInfo({ ids }: { ids: number[] }) {
  const { t } = useTranslation();
  const tagsQuery = useTags();

  if (!tagsQuery.data) {
    return null;
  }

  const tags = tagsQuery.data;

  const tagNameList = ids.length
    ? _.compact(
        ids
          .map((id) => {
            const tag = tags.find((tag) => tag.ID === id);
            return tag ? tag.Name : '';
          })
          .join(', ')
      )
    : '-';

  return (
    <DetailsTable.Row label={t('docker.dashboard.tags')}>
      {tagNameList}
    </DetailsTable.Row>
  );
}
