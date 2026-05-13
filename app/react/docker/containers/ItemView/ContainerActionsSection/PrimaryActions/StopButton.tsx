import { Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Authorized } from '@/react/hooks/useUser';
import { EnvironmentId } from '@/react/portainer/environments/types';
import { notifySuccess } from '@/portainer/services/notifications';

import { LoadingButton } from '@@/buttons';

import { ContainerId } from '../../../types';
import { useStopContainer } from '../queries/useStopContainer';

interface StopButtonProps {
  environmentId: EnvironmentId;
  containerId: ContainerId;
  nodeName?: string;
  isRunning: boolean;
  isPortainer: boolean;
  onSuccess?(): void;
}

export function StopButton({
  environmentId,
  containerId,
  nodeName,
  isRunning,
  isPortainer,
  onSuccess = () => {},
}: StopButtonProps) {
  const { t } = useTranslation();
  const stopMutation = useStopContainer();

  function handleStop() {
    stopMutation.mutate(
      { environmentId, containerId, nodeName },
      {
        onSuccess() {
          notifySuccess(t('common.success'), t('docker.container.containerStopped'));
          onSuccess();
        },
      }
    );
  }

  return (
    <Authorized authorizations="DockerContainerStop">
      <LoadingButton
        color="light"
        size="small"
        onClick={handleStop}
        disabled={!isRunning || isPortainer}
        isLoading={stopMutation.isLoading}
        loadingText={t('docker.container.stopping')}
        data-cy="stop-container-button"
        icon={Square}
      >
        {t('docker.container.stop')}
      </LoadingButton>
    </Authorized>
  );
}
