import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@@/buttons';
import { Link } from '@@/Link';

import { ContainerId } from '../../../types';

interface DuplicateEditButtonProps {
  containerId: ContainerId;
  nodeName?: string;
  isPortainer: boolean;
}

export function DuplicateEditButton({
  containerId,
  nodeName,
  isPortainer,
}: DuplicateEditButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      color="light"
      size="small"
      as={Link}
      disabled={isPortainer}
      data-cy="duplicate-edit-container-button"
      icon={Copy}
      props={{
        to: 'docker.containers.new',
        params: {
          from: containerId,
          nodeName,
        },
      }}
    >
      {t('docker.container.duplicateEdit')}
    </Button>
  );
}
