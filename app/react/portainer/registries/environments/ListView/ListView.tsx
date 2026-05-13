import { useTranslation } from 'react-i18next';

import { PageHeader } from '@@/PageHeader';

import { EnvironmentRegistriesDatatable } from './EnvironmentRegistriesDatatable';

export function ListView() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t('registries.environmentRegistries')}
        breadcrumbs={t('registries.management')}
        reload
      />

      <EnvironmentRegistriesDatatable />
    </>
  );
}
