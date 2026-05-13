import { HeartPulseIcon } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { ContainerDetailsViewModel } from '@/docker/models/containerDetails';

import { Icon } from '@@/Icon';

export function StatusRow({
  container,
}: {
  container: ContainerDetailsViewModel;
}) {
  const { t } = useTranslation();
  const isRunning = container.State?.Running || false;
  const isCreated = container.State?.Status === 'created';
  const activityTime = calculateActivityTime(container);

  return (
    <div className="flex items-center gap-2">
      <Icon
        icon={HeartPulseIcon}
        mode={getIconColor(container.State)}
        className="lucide mr-1"
      />
      {t(`docker.container.status${getStateKey(container.State)}`, { defaultValue: getStateDefault(container.State) })} {t('docker.container.for')} {activityTime}
      {!isRunning && !isCreated && (
        <span> {t('docker.container.withExitCode')} {container.State?.ExitCode}</span>
      )}
    </div>
  );
}

function getIconColor(
  state: ContainerDetailsViewModel['State']
): 'success' | 'danger' | undefined {
  if (!state) {
    return undefined;
  }

  if (state.Running) {
    return 'success';
  }

  if (state.Status !== 'created') {
    return 'danger';
  }

  return undefined;
}

function getStateKey(state: ContainerDetailsViewModel['State']): string {
  if (state === undefined) {
    return '';
  }

  if (state.Dead) {
    return 'StatusDead';
  }

  if ('Ghost' in state && state.Ghost && state.Running) {
    return 'StatusGhost';
  }

  if (state.Running && state.Paused) {
    return 'StatusRunningPaused';
  }

  if (state.Running) {
    return 'StatusRunning';
  }

  if (state.Status === 'created') {
    return 'StatusCreated';
  }

  return 'StatusStopped';
}

function getStateDefault(state: ContainerDetailsViewModel['State']): string {
  if (state === undefined) {
    return '';
  }

  if (state.Dead) {
    return 'Dead';
  }

  if ('Ghost' in state && state.Ghost && state.Running) {
    return 'Ghost';
  }

  if (state.Running && state.Paused) {
    return 'Running (Paused)';
  }

  if (state.Running) {
    return 'Running';
  }

  if (state.Status === 'created') {
    return 'Created';
  }

  return 'Stopped';
}

function calculateActivityTime(container: ContainerDetailsViewModel): string {
  if (!container.State) {
    return '';
  }

  if (container.State.Running && container.State.StartedAt) {
    return formatDistanceToNow(parseISO(container.State.StartedAt));
  }

  if (container.State.Status === 'created' && container.Created) {
    return formatDistanceToNow(parseISO(container.Created));
  }

  if (container.State.FinishedAt) {
    return formatDistanceToNow(parseISO(container.State.FinishedAt));
  }

  return '';
}
