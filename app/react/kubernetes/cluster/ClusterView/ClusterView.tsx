import { useTranslation } from 'react-i18next';

import { useCurrentEnvironment } from '@/react/hooks/useCurrentEnvironment';
import { PageHeader } from '@/react/components/PageHeader';
import { NodesDatatable } from '@/react/kubernetes/cluster/HomeView/NodesDatatable';

import { ClusterResourceReservation } from './ClusterResourceReservation';

export function ClusterView() {
  const { t } = useTranslation();
  const { data: environment } = useCurrentEnvironment();

  return (
    <>
      <PageHeader
        title={t('kubernetes.cluster.title')}
        breadcrumbs={[
          {
            label: t('kubernetes.cluster.environments'),
            link: 'portainer.endpoints',
          },
          {
            label: environment?.Name || '',
            link: 'portainer.endpoints.endpoint',
            linkParams: { id: environment?.Id },
          },
          t('kubernetes.cluster.clusterInformation'),
        ]}
        reload
      />

      <ClusterResourceReservation />

      <div className="row">
        <NodesDatatable />
      </div>
    </>
  );
}
