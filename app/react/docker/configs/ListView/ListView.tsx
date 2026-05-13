import { useTranslation } from 'react-i18next';

import { PageHeader } from '@@/PageHeader';

import { ConfigsDatatable } from './ConfigsDatatable/ConfigsDatatable';

export function ListView() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('docker.configs.title')} breadcrumbs={t('docker.configs.browse')} reload />

      <ConfigsDatatable />
    </>
  );
}
