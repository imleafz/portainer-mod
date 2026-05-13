import { Download, Upload } from 'lucide-react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { Authorized } from '@/react/hooks/useUser';
import { notifyWarning } from '@/portainer/services/notifications';

import { Button, ButtonGroup, LoadingButton } from '@@/buttons';
import { Link } from '@@/Link';

import { ImagesListResponse } from '../../queries/useImages';
import { useExportMutation } from '../../queries/useExportImageMutation';
import { confirmImageExport } from '../../common/ConfirmExportModal';

export function ImportExportButtons({
  selectedItems,
}: {
  selectedItems: Array<ImagesListResponse>;
}) {
  const { t } = useTranslation();
  const exportMutation = useExportMutation();

  return (
    <ButtonGroup>
      <Authorized authorizations="DockerImageLoad">
        <Button
          size="small"
          color="light"
          as={Link}
          data-cy="image-importImageButton"
          icon={Upload}
          disabled={exportMutation.isLoading}
          props={{
            to: 'docker.images.import',
          }}
          aria-disabled={exportMutation.isLoading}
        >
          {t('docker.images.import')}
        </Button>
      </Authorized>
      <Authorized authorizations="DockerImageGet">
        <LoadingButton
          size="small"
          color="light"
          icon={Download}
          isLoading={exportMutation.isLoading}
          loadingText={t('docker.images.exportInProgress')}
          data-cy="image-exportImageButton"
          onClick={() => handleExport()}
          disabled={selectedItems.length === 0}
        >
          {t('docker.images.export')}
        </LoadingButton>
      </Authorized>
    </ButtonGroup>
  );

  async function handleExport() {
    if (!isValidToDownload(selectedItems)) {
      return;
    }

    const confirmed = await confirmImageExport();

    if (!confirmed) {
      return;
    }

    exportMutation.mutate({
      images: selectedItems,
      nodeName: selectedItems[0].nodeName,
    });
  }

  function isValidToDownload(selectedItems: Array<ImagesListResponse>) {
    for (let i = 0; i < selectedItems.length; i++) {
      const image = selectedItems[i];

      const untagged = image.tags?.find((item) => item.includes('<none>'));

      if (untagged) {
        notifyWarning('', t('docker.images.cannotDownloadUntaggedImage'));
        return false;
      }
    }

    if (_.uniqBy(selectedItems, 'nodeName').length > 1) {
      notifyWarning('', t('docker.images.cannotDownloadFromDifferentNodes'));
      return false;
    }

    return true;
  }
}
