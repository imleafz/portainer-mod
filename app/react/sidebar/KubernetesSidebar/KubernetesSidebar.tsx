import {
  Box,
  Edit,
  Layers,
  LayoutList,
  Lock,
  Network,
  Server,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EnvironmentId } from '@/react/portainer/environments/types';
import { Authorized } from '@/react/hooks/useUser';
import { isBE } from '@/react/portainer/feature-flags/feature-flags.service';

import { DashboardLink } from '../items/DashboardLink';
import { SidebarItem } from '../SidebarItem';
import { VolumesLink } from '../items/VolumesLink';
import { SidebarParent } from '../SidebarItem/SidebarParent';

import { KubectlShellButton } from './KubectlShellButton';

interface Props {
  environmentId: EnvironmentId;
}

export function KubernetesSidebar({ environmentId }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className="w-full flex mb-2 justify-center -mt-2">
        <KubectlShellButton environmentId={environmentId} />
      </div>

      <DashboardLink
        environmentId={environmentId}
        platformPath="kubernetes"
        data-cy="k8sSidebar-dashboard"
      />

      <SidebarItem
        to="kubernetes.templates.custom"
        params={{ endpointId: environmentId }}
        icon={Edit}
        label={t('sidebar.customTemplates')}
        data-cy="k8sSidebar-customTemplates"
      />

      <SidebarItem
        to="kubernetes.resourcePools"
        params={{ endpointId: environmentId }}
        icon={Layers}
        label={t('sidebar.namespaces')}
        data-cy="k8sSidebar-namespaces"
      />

      <SidebarItem
        to="kubernetes.applications"
        params={{ endpointId: environmentId }}
        icon={Box}
        label={t('sidebar.applications')}
        data-cy="k8sSidebar-applications"
      />

      <SidebarParent
        label={t('sidebar.networking')}
        icon={Network}
        to="kubernetes.services"
        params={{ endpointId: environmentId }}
        pathOptions={{ includePaths: ['kubernetes.ingresses'] }}
        data-cy="k8sSidebar-networking"
        listId="k8sSidebar-networking"
      >
        <SidebarItem
          to="kubernetes.services"
          params={{ endpointId: environmentId }}
          label={t('sidebar.services')}
          isSubMenu
          data-cy="k8sSidebar-services"
        />

        <SidebarItem
          to="kubernetes.ingresses"
          params={{ endpointId: environmentId }}
          label={t('sidebar.ingresses')}
          isSubMenu
          data-cy="k8sSidebar-ingresses"
        />
      </SidebarParent>

      <SidebarItem
        to="kubernetes.configurations"
        params={{ endpointId: environmentId }}
        icon={Lock}
        label={t('sidebar.configMapsAndSecrets')}
        data-cy="k8sSidebar-configurations"
      />

      <VolumesLink
        environmentId={environmentId}
        platformPath="kubernetes"
        data-cy="k8sSidebar-volumes"
      />

      <SidebarParent
        label={t('sidebar.moreResources')}
        to="kubernetes.moreResources.jobs"
        pathOptions={{
          includePaths: [
            'kubernetes.moreResources.jobs',
            'kubernetes.moreResources.serviceAccounts',
            'kubernetes.moreResources.clusterRoles',
            'kubernetes.moreResources.roles',
          ],
        }}
        icon={LayoutList}
        params={{ endpointId: environmentId }}
        data-cy="k8sSidebar-moreResources"
        listId="k8sSidebar-moreResources"
      >
        <SidebarItem
          to="kubernetes.moreResources.jobs"
          params={{ endpointId: environmentId }}
          label={t('sidebar.cronJobsAndJobs')}
          data-cy="k8sSidebar-jobs"
          isSubMenu
        />
        <Authorized
          authorizations="K8sMoreResourcesRW"
          adminOnlyCE
          environmentId={environmentId}
        >
          <SidebarItem
            to="kubernetes.moreResources.serviceAccounts"
            params={{ endpointId: environmentId }}
            label={t('sidebar.serviceAccounts')}
            data-cy="k8sSidebar-serviceAccounts"
            isSubMenu
          />
          <SidebarItem
            to="kubernetes.moreResources.clusterRoles"
            params={{ endpointId: environmentId }}
            label={t('sidebar.clusterRoles')}
            data-cy="k8sSidebar-clusterRoles"
            isSubMenu
          />
          <SidebarItem
            to="kubernetes.moreResources.roles"
            params={{ endpointId: environmentId }}
            label={t('sidebar.roles')}
            data-cy="k8sSidebar-Roles"
            isSubMenu
          />
        </Authorized>
      </SidebarParent>

      <SidebarParent
        label={t('sidebar.cluster')}
        icon={Server}
        to="kubernetes.cluster"
        params={{ endpointId: environmentId }}
        pathOptions={{ includePaths: ['kubernetes.registries'] }}
        data-cy="k8sSidebar-cluster-area"
        listId="k8sSidebar-cluster-area"
      >
        <SidebarItem
          label={t('sidebar.details')}
          to="kubernetes.cluster"
          ignorePaths={[
            'kubernetes.cluster.setup',
            'kubernetes.cluster.securityConstraint',
          ]}
          params={{ endpointId: environmentId }}
          isSubMenu
          data-cy="k8sSidebar-cluster"
        />
        <Authorized
          authorizations="K8sClusterSetupRW"
          adminOnlyCE
          environmentId={environmentId}
        >
          <SidebarItem
            to="kubernetes.cluster.setup"
            params={{ endpointId: environmentId }}
            label={t('sidebar.setup')}
            isSubMenu
            data-cy="k8sSidebar-setup"
          />
        </Authorized>

        <Authorized
          authorizations="K8sClusterSetupRW"
          adminOnlyCE
          environmentId={environmentId}
        >
          <SidebarItem
            to="kubernetes.cluster.securityConstraint"
            params={{ endpointId: environmentId }}
            label={t('sidebar.securityConstraints')}
            isSubMenu
            data-cy="k8sSidebar-securityConstraints"
          />
        </Authorized>

        {isBE && (
          <Authorized
            authorizations="K8sClusterSetupRW"
            adminOnlyCE
            environmentId={environmentId}
          >
            <SidebarItem
              to="kubernetes.cluster.securityConstraint"
              params={{ endpointId: environmentId }}
              label={t('sidebar.securityConstraints')}
              isSubMenu
              data-cy="k8sSidebar-securityConstraints"
            />
          </Authorized>
        )}

        <SidebarItem
          to="kubernetes.registries"
          params={{ endpointId: environmentId }}
          label={t('sidebar.registries')}
          isSubMenu
          data-cy="k8sSidebar-registries"
        />
      </SidebarParent>
    </>
  );
}
