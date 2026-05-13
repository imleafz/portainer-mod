import { RefreshCw } from 'lucide-react';
import { useRouter } from '@uirouter/react';
import { useTranslation } from 'react-i18next';

import { ServiceViewModel } from '@/docker/models/service';
import { Authorized } from '@/react/hooks/useUser';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { notifySuccess } from '@/portainer/services/notifications';

import { AddButton, Button, ButtonGroup } from '@@/buttons';
import { DeleteButton } from '@@/buttons/DeleteButton';

import { confirmServiceForceUpdate } from '../../common/update-service-modal';

import { useRemoveServicesMutation } from './useRemoveServicesMutation';
import { useForceUpdateServicesMutation } from './useForceUpdateServicesMutation';

export function TableActions({
  selectedItems,
  isAddActionVisible,
  isUpdateActionVisible,
}: {
  selectedItems: Array<ServiceViewModel>;
  isAddActionVisible?: boolean;
  isUpdateActionVisible?: boolean;
}) {
  const { t } = useTranslation();
  const environmentId = useEnvironmentId();
  const removeMutation = useRemoveServicesMutation(environmentId);
  const updateMutation = useForceUpdateServicesMutation(environmentId);
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <ButtonGroup>
        {isUpdateActionVisible && (
          <Authorized authorizations="DockerServiceUpdate">
            <Button
              color="light"
              disabled={selectedItems.length === 0}
              onClick={() => handleUpdate(selectedItems)}
              icon={RefreshCw}
              data-cy="service-updateServiceButton"
            >
              {t('docker.services.update')}
            </Button>
          </Authorized>
        )}
        <Authorized authorizations="DockerServiceDelete">
          <DeleteButton
            disabled={selectedItems.length === 0}
            onConfirmed={() => handleRemove(selectedItems)}
            confirmMessage={t('docker.services.removeServiceConfirm')}
            data-cy="service-removeServiceButton"
          />
        </Authorized>
      </ButtonGroup>

      {isAddActionVisible && (
        <Authorized authorizations="DockerServiceCreate">
          <AddButton data-cy="docker-add-service-button">
            {t('docker.services.browse')}
          </AddButton>
        </Authorized>
      )}
    </div>
  );

  async function handleUpdate(selectedItems: Array<ServiceViewModel>) {
    const confirmed = await confirmServiceForceUpdate(
      t('docker.services.forceUpdateConfirm')
    );

    if (!confirmed) {
      return;
    }

    updateMutation.mutate(
      {
        ids: selectedItems.map((service) => service.Id),
        pullImage: confirmed.pullLatest,
      },
      {
        onSuccess() {
          notifySuccess(
            t('docker.container.success'),
            t('docker.services.successfullyUpdated')
          );
          router.stateService.reload();
        },
      }
    );
  }

  async function handleRemove(selectedItems: Array<ServiceViewModel>) {
    removeMutation.mutate(
      selectedItems.map((service) => service.Id),
      {
        onSuccess() {
          notifySuccess(
            t('docker.container.success'),
            t('docker.services.successfullyRemoved')
          );
          router.stateService.reload();
        },
      }
    );
  }
}
