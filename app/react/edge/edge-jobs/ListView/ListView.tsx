import { useTranslation } from 'react-i18next';

import { InformationPanel } from '@@/InformationPanel';
import { PageHeader } from '@@/PageHeader';

import { EdgeJobsDatatable } from './EdgeJobsDatatable';

export function ListView() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('edgeJobs.title')} breadcrumbs={t('edgeJobs.title')} reload />

      <div className="row">
        <div className="col-sm-12">
          <InformationPanel title={t('common.info')}>
            <p className="small text-muted">
              {t('edgeJobs.infoMessage')}
            </p>
          </InformationPanel>
        </div>
      </div>

      <EdgeJobsDatatable />
    </>
  );
}
