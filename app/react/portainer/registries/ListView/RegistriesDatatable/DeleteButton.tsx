import { useTranslation } from 'react-i18next';

import { pluralize } from '@/portainer/helpers/strings';
import { notifySuccess } from '@/portainer/services/notifications';

import { DeleteButton as BaseDeleteButton } from '@@/buttons/DeleteButton';

import { Registry } from '../../types/registry';

import { useDeleteRegistriesMutation } from './useDeleteRegistriesMutation';

export function DeleteButton({ selectedItems }: { selectedItems: Registry[] }) {
  const { t } = useTranslation();
  const mutation = useDeleteRegistriesMutation();

  const confirmMessage = getMessage(selectedItems.length, t);

  return (
    <BaseDeleteButton
      data-cy="registry-removeRegistryButton"
      disabled={selectedItems.length === 0}
      confirmMessage={confirmMessage}
      onConfirmed={handleDelete}
    />
  );

  function handleDelete() {
    mutation.mutate(
      selectedItems.map((item) => item.Id),
      {
        onSuccess() {
          notifySuccess(t('common.success'), t('registries.removed'));
        },
      }
    );
  }
}

function getMessage(selectedCount: number, t: ReturnType<typeof useTranslation>) {
  const registriesMsg = pluralize(selectedCount, t('registries.registry'), t('registries.registries'));
  return t('registries.removeConfirm', { registries: registriesMsg });
}
