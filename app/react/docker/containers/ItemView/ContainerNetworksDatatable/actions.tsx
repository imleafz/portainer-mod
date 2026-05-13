import { CellContext } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Authorized } from '@/react/hooks/useUser';
import { useDisconnectContainer } from '@/react/docker/networks/queries/useDisconnectContainerMutation';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { notifySuccess } from '@/portainer/services/notifications';

import { LoadingButton } from '@@/buttons';

import { TableNetwork, isContainerNetworkTableMeta } from './types';
import { columnHelper } from './helper';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useTranslation: useTranslationActions } = require('react-i18next');

export function buildActions({ nodeName }: { nodeName?: string } = {}) {
  return columnHelper.display({
    id: 'actions',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslationActions();
      return t('docker.container.actions');
    },
    cell: Cell,
  });

  function Cell({
    row: {
      original: { id: networkId },
    },
    table: {
      options: { meta },
    },
  }: CellContext<TableNetwork, unknown>) {
    const { t } = useTranslation();
    const environmentId = useEnvironmentId();
    const disconnectMutation = useDisconnectContainer({
      environmentId,
      networkId,
    });

    return (
      <Authorized authorizations="DockerNetworkDisconnect">
        <LoadingButton
          color="dangerlight"
          data-cy="disconnect-network-button"
          isLoading={disconnectMutation.isLoading}
          loadingText={t('docker.container.leavingNetwork')}
          type="button"
          onClick={handleSubmit}
        >
          {t('docker.container.leaveNetwork')}
        </LoadingButton>
      </Authorized>
    );

    function handleSubmit() {
      if (!isContainerNetworkTableMeta(meta)) {
        throw new Error('Invalid row meta');
      }

      disconnectMutation.mutate(
        {
          containerId: meta.containerId,
          nodeName,
        },
        {
          onSuccess() {
            notifySuccess(
              t('docker.networks.containerDisconnected'),
              networkId
            );
          },
        }
      );
    }
  }
}
