import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@@/buttons';
import { Modal } from '@@/modals/Modal';
import { ModalType } from '@@/modals/Modal/types';

export function NonAdminUpgradeDialog({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal aria-label="Upgrade Portainer to Business Edition">
      <Modal.Header
        title={t('upgradeBE.nonAdmin.title')}
        modalType={ModalType.Warn}
      />
      <Modal.Body>
        {t('upgradeBE.nonAdmin.message')}
      </Modal.Body>
      <Modal.Footer>
        <div className="flex w-full gap-2">
          <Button
            color="default"
            data-cy="non-admin-cancel-upgrade"
            size="medium"
            className="w-1/3"
            onClick={() => onDismiss()}
          >
            {t('upgradeBE.nonAdmin.cancel')}
          </Button>

          <a
            href="https://www.portainer.io/take-5"
            target="_blank"
            rel="noreferrer"
            className="no-link w-2/3"
          >
            <Button
              color="primary"
              data-cy="non-admin-learn-about-business-edition"
              size="medium"
              className="w-full"
              icon={ExternalLink}
            >
              {t('upgradeBE.nonAdmin.learnAbout')}
            </Button>
          </a>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
