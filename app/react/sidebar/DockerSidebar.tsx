import {
  Box,
  Clock,
  Layers,
  List,
  Lock,
  Shuffle,
  Trello,
  Clipboard,
  Edit,
  Network,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  type Environment,
  type EnvironmentId,
} from '@/react/portainer/environments/types';
import { Authorized, useIsEnvironmentAdmin } from '@/react/hooks/useUser';
import { useInfo } from '@/react/docker/proxy/queries/useInfo';
import { useApiVersion } from '@/react/docker/proxy/queries/useVersion';

import { SidebarItem } from './SidebarItem';
import { DashboardLink } from './items/DashboardLink';
import { VolumesLink } from './items/VolumesLink';
import { SidebarParent } from './SidebarItem/SidebarParent';

interface Props {
  environmentId: EnvironmentId;
  environment: Environment;
}

export function DockerSidebar({ environmentId, environment }: Props) {
  const { t } = useTranslation();
  const { authorized: isEnvironmentAdmin } = useIsEnvironmentAdmin({
    adminOnlyCE: true,
  });

  const envInfoQuery = useInfo(environmentId, {
    select: (info) => !!info.Swarm?.NodeID && !!info.Swarm?.ControlAvailable,
  });

  const apiVersion = useApiVersion(environmentId);

  const isSwarmManager = envInfoQuery.data;

  const areStacksVisible =
    isEnvironmentAdmin ||
    environment.SecuritySettings.allowStackManagementForRegularUsers;

  const setupSubMenuProps = isSwarmManager
    ? {
        label: t('sidebar.swarm'),
        icon: Trello,
        to: 'docker.swarm',
        dataCy: 'portainerSidebar-swarm',
      }
    : {
        label: t('sidebar.host'),
        icon: Trello,
        to: 'docker.host',
        dataCy: 'portainerSidebar-host',
      };

  const featSubMenuTo = isSwarmManager
    ? 'docker.swarm.featuresConfiguration'
    : 'docker.host.featuresConfiguration';
  const registrySubMenuTo = isSwarmManager
    ? 'docker.swarm.registries'
    : 'docker.host.registries';

  return (
    <>
      <DashboardLink
        environmentId={environmentId}
        platformPath="docker"
        data-cy="dockerSidebar-dashboard"
      />
      <SidebarParent
        icon={Edit}
        label={t('sidebar.templates')}
        to="docker.templates"
        params={{ endpointId: environmentId }}
        data-cy="portainerSidebar-templates"
        listId="dockerSidebar-templates"
      >
        <SidebarItem
          label={t('sidebar.application')}
          to="docker.templates"
          ignorePaths={['docker.templates.custom']}
          params={{ endpointId: environmentId }}
          isSubMenu
          data-cy="portainerSidebar-appTemplates"
        />
        <SidebarItem
          label={t('sidebar.custom')}
          to="docker.templates.custom"
          params={{ endpointId: environmentId }}
          isSubMenu
          data-cy="dockerSidebar-customTemplates"
        />
      </SidebarParent>

      {areStacksVisible && (
        <SidebarItem
          to="docker.stacks"
          params={{ endpointId: environmentId }}
          icon={Layers}
          label={t('sidebar.stacks')}
          data-cy="dockerSidebar-stacks"
        />
      )}

      {isSwarmManager && (
        <SidebarItem
          to="docker.services"
          params={{ endpointId: environmentId }}
          icon={Shuffle}
          label={t('sidebar.services')}
          data-cy="dockerSidebar-services"
        />
      )}

      <SidebarItem
        to="docker.containers"
        params={{ endpointId: environmentId }}
        icon={Box}
        label={t('sidebar.containers')}
        data-cy="dockerSidebar-containers"
      />

      <SidebarItem
        to="docker.images"
        params={{ endpointId: environmentId }}
        icon={List}
        label={t('sidebar.images')}
        data-cy="dockerSidebar-images"
      />

      <SidebarItem
        to="docker.networks"
        params={{ endpointId: environmentId }}
        icon={Network}
        label={t('sidebar.networks')}
        data-cy="dockerSidebar-networks"
      />

      <VolumesLink
        environmentId={environmentId}
        platformPath="docker"
        data-cy="dockerSidebar-volumes"
      />

      {apiVersion >= 1.3 && isSwarmManager && (
        <SidebarItem
          to="docker.configs"
          params={{ endpointId: environmentId }}
          icon={Clipboard}
          label={t('sidebar.configs')}
          data-cy="dockerSidebar-configs"
        />
      )}

      {apiVersion >= 1.25 && isSwarmManager && (
        <SidebarItem
          to="docker.secrets"
          params={{ endpointId: environmentId }}
          icon={Lock}
          label={t('sidebar.secrets')}
          data-cy="dockerSidebar-secrets"
        />
      )}

      {!isSwarmManager && isEnvironmentAdmin && (
        <SidebarItem
          to="docker.events"
          params={{ endpointId: environmentId }}
          icon={Clock}
          label={t('sidebar.events')}
          data-cy="dockerSidebar-events"
        />
      )}

      <SidebarParent
        label={setupSubMenuProps.label}
        icon={setupSubMenuProps.icon}
        to={setupSubMenuProps.to}
        params={{ endpointId: environmentId }}
        data-cy="portainerSidebar-host-area"
        listId="portainerSidebar-host-area"
      >
        <SidebarItem
          label={t('sidebar.details')}
          isSubMenu
          to={setupSubMenuProps.to}
          params={{ endpointId: environmentId }}
          ignorePaths={[featSubMenuTo, registrySubMenuTo]}
          data-cy={setupSubMenuProps.dataCy}
        />

        <Authorized
          authorizations="PortainerEndpointUpdateSettings"
          adminOnlyCE
          environmentId={environmentId}
        >
          <SidebarItem
            label={t('sidebar.setup')}
            isSubMenu
            to={featSubMenuTo}
            params={{ endpointId: environmentId }}
            data-cy="portainerSidebar-docker-setup"
          />
        </Authorized>

        <SidebarItem
          label={t('sidebar.registries')}
          isSubMenu
          to={registrySubMenuTo}
          params={{ endpointId: environmentId }}
          data-cy="portainerSidebar-docker-registries"
        />
      </SidebarParent>
    </>
  );
}
