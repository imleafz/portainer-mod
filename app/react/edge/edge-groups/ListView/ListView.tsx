import { useTranslation } from 'react-i18next';

import { PageHeader } from '@@/PageHeader';

import { EdgeGroupsDatatable } from './EdgeGroupsDatatable';

export function ListView() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('edge.edgeGroup.title')} breadcrumbs={t('edge.edgeGroup.title')} reload />
      <EdgeGroupsDatatable />
    </>
  );
}
