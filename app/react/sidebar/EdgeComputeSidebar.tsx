import { Box, Clock, LayoutGrid, Layers, Puzzle, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { isBE } from '../portainer/feature-flags/feature-flags.service';
import { useSettings } from '../portainer/settings/queries';

import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import { SidebarParent } from './SidebarItem/SidebarParent';

export function EdgeComputeSidebar() {
  const { t } = useTranslation();
  // this sidebar is rendered only for admins, so we can safely assume that settingsQuery will succeed
  const settingsQuery = useSettings();

  if (!settingsQuery.data || !settingsQuery.data.EnableEdgeComputeFeatures) {
    return null;
  }

  const settings = settingsQuery.data;

  return (
    <SidebarSection title={t('sidebar.edgeCompute')}>
      <SidebarItem
        to="edge.groups"
        label={t('sidebar.edgeGroups')}
        icon={LayoutGrid}
        data-cy="portainerSidebar-edgeGroups"
      />
      <SidebarItem
        to="edge.stacks"
        label={t('sidebar.edgeStacks')}
        icon={Layers}
        data-cy="portainerSidebar-edgeStacks"
      />
      <SidebarItem
        to="edge.jobs"
        label={t('sidebar.edgeJobs')}
        icon={Clock}
        data-cy="portainerSidebar-edgeJobs"
      />
      {isBE && (
        <SidebarItem
          to="edge.configurations"
          label={t('sidebar.edgeConfigurations')}
          icon={Puzzle}
          data-cy="portainerSidebar-edgeConfigurations"
        />
      )}
      {isBE && !settings.TrustOnFirstConnect && (
        <SidebarItem
          to="edge.devices.waiting-room"
          label={t('sidebar.waitingRoom')}
          icon={Box}
          data-cy="portainerSidebar-edgeDevicesWaitingRoom"
        />
      )}
      <SidebarParent
        icon={Edit}
        label={t('sidebar.edgeTemplates')}
        to="edge.templates"
        data-cy="edgeSidebar-templates"
        listId="edgeSidebar-templates"
      >
        <SidebarItem
          label={t('sidebar.application')}
          to="edge.templates"
          ignorePaths={['edge.templates.custom']}
          isSubMenu
          data-cy="edgeSidebar-appTemplates"
        />
        <SidebarItem
          label={t('sidebar.custom')}
          to="edge.templates.custom"
          isSubMenu
          data-cy="edgeSidebar-customTemplates"
        />
      </SidebarParent>
    </SidebarSection>
  );
}
