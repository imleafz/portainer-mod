import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Authorized } from '@/react/hooks/useUser';
import { EnvironmentId } from '@/react/portainer/environments/types';
import { notifySuccess } from '@/portainer/services/notifications';

import { LoadingButton } from '@@/buttons';

import { ContainerId } from '../../../types';
import { useResumeContainer } from '../queries/useResumeContainer';

interface ResumeButtonProps {
  environmentId: EnvironmentId;
  containerId: ContainerId;
  nodeName?: string;
  isPaused: boolean;
  isPortainer: boolean;
  onSuccess?(): void;
}

export function ResumeButton({
  environmentId,
  containerId,
  nodeName,
  isPaused,
  isPortainer,
  onSuccess = () => {},
}: ResumeButtonProps) {
  const { t } = useTranslation();
  const resumeMutation = useResumeContainer();

  function handleResume() {
    resumeMutation.mutate(
      { environmentId, containerId, nodeName },
      {
        onSuccess() {
          notifySuccess(t('common.success'), t('docker.container.containerResumed'));
          onSuccess();
        },
      }
    );
  }

  return (
    <Authorized authorizations="DockerContainerUnpause">
      <LoadingButton
        color="light"
        size="small"
        onClick={handleResume}
        disabled={!isPaused || isPortainer}
        isLoading={resumeMutation.isLoading}
        loadingText={t('docker.container.resuming')}
        data-cy="unpause-container-button"
        icon={Play}
      >
        {t('docker.container.resume')}
      </LoadingButton>
    </Authorized>
  );
}
