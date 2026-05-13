import { useTranslation } from 'react-i18next';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { promiseSequence } from '@/portainer/helpers/promise-utils';
import { withGlobalError, withInvalidate } from '@/react-tools/react-query';
import { EnvironmentId } from '@/react/portainer/environments/types';
import { notifySuccess } from '@/portainer/services/notifications';
import { pluralize } from '@/portainer/helpers/strings';

import { DeleteButton } from '@@/buttons/DeleteButton';

import { ConfigViewModel } from '../../model';
import { queryKeys } from '../../queries/query-keys';
import { deleteConfig } from '../../queries/useDeleteConfigMutation';

export function DeleteConfigButton({
  selectedItems,
}: {
  selectedItems: Array<ConfigViewModel>;
}) {
  const { t } = useTranslation();
  const environmentId = useEnvironmentId();
  const mutation = useDeleteConfigListMutation(environmentId);

  return (
    <DeleteButton
      data-cy="remove-docker-configs-button"
      onConfirmed={() => {
        mutation.mutate(
          selectedItems.map((item) => item.Id),
          {
            onSuccess() {
              notifySuccess(
                t('docker.configs.successfullyRemoved'),
                selectedItems.length === 1 ? selectedItems[0].Name : ''
              );
            },
          }
        );
      }}
      confirmMessage={t('docker.configs.removeConfirm')}
      disabled={selectedItems.length === 0}
    />
  );
}

function useDeleteConfigListMutation(environmentId: EnvironmentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: Array<string>) =>
      promiseSequence(
        ids.map((configId) => () => deleteConfig({ environmentId, configId }))
      ),
    ...withGlobalError('Unable to remove configs'),
    ...withInvalidate(queryClient, [queryKeys.base(environmentId)]),
  });
}
