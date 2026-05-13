import { ChevronDown, Trash2 } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuPopover } from '@reach/menu-button';
import { positionRight } from '@reach/popover';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Authorized } from '@/react/hooks/useUser';
import { withInvalidate } from '@/react-tools/react-query';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { notifySuccess } from '@/portainer/services/notifications';
import { processItemsInBatches } from '@/react/common/processItemsInBatches';

import { Button, ButtonGroup } from '@@/buttons';
import { ButtonWithRef } from '@@/buttons/Button';
import { confirmDestructive } from '@@/modals/confirm';
import { buildConfirmButton } from '@@/modals/utils';

import { ImagesListResponse } from '../../queries/useImages';
import { queryKeys } from '../../queries/queryKeys';
import { deleteImage } from '../../queries/useDeleteImageMutation';

export function RemoveButtonMenu({
  selectedItems,
}: {
  selectedItems: Array<ImagesListResponse>;
}) {
  const { t } = useTranslation();
  const deleteImageListMutation = useDeleteImageListMutation();

  return (
    <Authorized authorizations="DockerImageDelete">
      <ButtonGroup>
        <Button
          size="small"
          color="dangerlight"
          icon={Trash2}
          disabled={selectedItems.length === 0}
          data-cy="image-removeImageButton"
          onClick={() => {
            handleRemove(false);
          }}
        >
          {t('docker.images.remove')}
        </Button>
        <Menu>
          <MenuButton
            as={ButtonWithRef}
            size="small"
            color="dangerlight"
            disabled={selectedItems.length === 0}
            icon={ChevronDown}
            data-cy="image-toggleRemoveButtonMenu"
          >
            <span className="sr-only">Toggle Dropdown</span>
          </MenuButton>
          <MenuPopover position={positionRight}>
            <div className="mt-3 bg-white th-highcontrast:bg-black th-dark:bg-black">
              <MenuItem
                onSelect={() => {
                  handleRemove(true);
                }}
              >
                {t('docker.images.forceRemove')}
              </MenuItem>
            </div>
          </MenuPopover>
        </Menu>
      </ButtonGroup>
    </Authorized>
  );

  function confirmForceRemove() {
    return confirmDestructive({
      title: t('docker.images.areYouSure'),
      message: t('docker.images.forceRemoveMessage'),
      confirmButton: buildConfirmButton(
        t('docker.images.removeImage'),
        'danger'
      ),
    });
  }

  function confirmRegularRemove() {
    return confirmDestructive({
      title: t('docker.images.areYouSure'),
      message: t('docker.images.regularRemoveMessage'),
      confirmButton: buildConfirmButton(
        t('docker.images.removeImage'),
        'danger'
      ),
    });
  }

  async function handleRemove(force: boolean) {
    const confirmed = await (force
      ? confirmForceRemove()
      : confirmRegularRemove());

    if (!confirmed) {
      return;
    }

    deleteImageListMutation.mutate({
      imageIds: selectedItems.map((image) => image.id),
      force,
    });
  }
}

function useDeleteImageListMutation() {
  const { t } = useTranslation();
  const environmentId = useEnvironmentId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageIds,
      ...args
    }: {
      imageIds: Array<string>;
    } & Omit<Parameters<typeof deleteImage>[0], 'imageId' | 'environmentId'>) =>
      processItemsInBatches(imageIds, (imageId) =>
        deleteImage({ ...args, environmentId, imageId }).then(() =>
          notifySuccess(t('docker.images.imageSuccessfullyRemoved'), imageId)
        )
      ),
    ...withInvalidate(queryClient, [queryKeys.base(environmentId)]),
  });
}
