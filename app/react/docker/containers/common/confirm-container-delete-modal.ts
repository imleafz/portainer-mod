import { ModalType } from '@@/modals';
import { openSwitchPrompt } from '@@/modals/SwitchPrompt';
import { buildConfirmButton } from '@@/modals/utils';

interface ConfirmContainerDeletionOptions {
  autoRemoveVolumesLabel: string;
  removeButtonLabel: string;
}

export async function confirmContainerDeletion(
  title: string,
  options?: ConfirmContainerDeletionOptions
) {
  const result = await openSwitchPrompt(
    title,
    options?.autoRemoveVolumesLabel || 'Automatically remove non-persistent volumes',
    {
      confirmButton: buildConfirmButton(
        options?.removeButtonLabel || 'Remove',
        'danger'
      ),
      modalType: ModalType.Destructive,
      'data-cy': 'confirm-container-delete-button',
    }
  );

  return result ? { removeVolumes: result.value } : undefined;
}
