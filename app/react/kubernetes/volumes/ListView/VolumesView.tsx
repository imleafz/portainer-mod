import { Database, HardDrive } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@@/PageHeader';
import { WidgetTabs, Tab, useCurrentTabIndex } from '@@/Widget/WidgetTabs';

import { VolumesDatatable } from './VolumesDatatable';
import { StorageDatatable } from './StorageDatatable';

export function VolumesView() {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    {
      name: t('kubernetes.volumes.volumes'),
      icon: Database,
      widget: <VolumesDatatable />,
      selectedTabParam: 'volumes',
    },
    {
      name: t('kubernetes.volumes.storage'),
      icon: HardDrive,
      widget: <StorageDatatable />,
      selectedTabParam: 'storage',
    },
  ];

  const currentTabIndex = useCurrentTabIndex(tabs);

  return (
    <>
      <PageHeader
        title={t('kubernetes.volumes.title')}
        breadcrumbs={t('kubernetes.volumes.browse')}
        reload
      />
      <>
        <WidgetTabs tabs={tabs} currentTabIndex={currentTabIndex} />
        <div className="content">{tabs[currentTabIndex].widget}</div>
      </>
    </>
  );
}
