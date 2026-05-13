import { useStore } from 'zustand';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { environmentStore } from '@/react/hooks/current-environment-store';
import { Environment } from '@/react/portainer/environments/types';
import { snapshotEndpoints } from '@/react/portainer/environments/environment.service';
import { isEdgeEnvironment } from '@/react/portainer/environments/utils';
import * as notifications from '@/portainer/services/notifications';

import { confirm } from '@@/modals/confirm';
import { PageHeader } from '@@/PageHeader';
import { ModalType } from '@@/modals';
import { buildConfirmButton } from '@@/modals/utils';

import { EnvironmentList } from './EnvironmentList';
import { EdgeLoadingSpinner } from './EdgeLoadingSpinner';
import { LicenseNodePanel } from './LicenseNodePanel';
import { BackupFailedPanel } from './BackupFailedPanel';

export function HomeView() {
  const { t } = useTranslation();
  const { clear: clearStore } = useStore(environmentStore);

  const { params } = useCurrentStateAndParams();
  const [connectingToEdgeEndpoint, setConnectingToEdgeEndpoint] = useState(
    !!params.redirect
  );

  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      const options = {
        title: t('home.failedConnectingToEdge', {
          name: params.environmentName,
        }),
        message: t('home.edgeAgentIssue'),
        confirmButton: buildConfirmButton(t('home.retry'), 'primary', 10),
        modalType: ModalType.Destructive,
      };

      if (await confirm(options)) {
        setConnectingToEdgeEndpoint(true);
        router.stateService.go(params.route, {
          endpointId: params.environmentId,
        });
      } else {
        clearStore();
        router.stateService.go(
          'portainer.home',
          {},
          { reload: true, inherit: false }
        );
      }
    }

    if (params.redirect) {
      redirect();
    }
  }, [params, setConnectingToEdgeEndpoint, router, clearStore, t]);

  return (
    <>
      <PageHeader
        reload
        title={t('home.title')}
        breadcrumbs={[{ label: t('home.environments') }]}
      />

      {process.env.PORTAINER_EDITION !== 'CE' && <LicenseNodePanel />}

      {process.env.PORTAINER_EDITION !== 'CE' && <BackupFailedPanel />}

      {connectingToEdgeEndpoint ? (
        <EdgeLoadingSpinner />
      ) : (
        <EnvironmentList
          onClickBrowse={handleBrowseClick}
          onRefresh={confirmTriggerSnapshot}
        />
      )}
    </>
  );

  async function confirmTriggerSnapshot() {
    const result = await confirmEndpointSnapshot();
    if (!result) {
      return;
    }
    try {
      await snapshotEndpoints();
      notifications.success(t('common.success'), t('home.environmentsUpdated'));
      router.stateService.reload();
    } catch (err) {
      notifications.error(
        t('common.failure'),
        err as Error,
        t('home.snapshotError')
      );
    }
  }

  function handleBrowseClick(environment: Environment) {
    if (isEdgeEnvironment(environment.Type)) {
      setConnectingToEdgeEndpoint(true);
    }
  }

  async function confirmEndpointSnapshot() {
    return confirm({
      title: t('home.confirmSnapshot'),
      modalType: ModalType.Warn,
      message: t('home.snapshotWarning'),
    });
  }
}
