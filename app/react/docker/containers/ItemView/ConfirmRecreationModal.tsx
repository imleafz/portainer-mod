import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal, OnSubmit, ModalType, openModal } from '@@/modals';
import { Button } from '@@/buttons';
import { SwitchField } from '@@/form-components/SwitchField';
import { TextTip } from '@@/Tip/TextTip';

interface Props {
  onSubmit: OnSubmit<{ pullLatest: boolean }>;

  cannotPullImage: boolean;
}

function ConfirmRecreationModal({ onSubmit, cannotPullImage }: Props) {
  const { t } = useTranslation();
  const [pullLatest, setPullLatest] = useState(false);

  return (
    <Modal
      onDismiss={() => onSubmit()}
      aria-label={t('docker.container.confirmRecreateModal')}
    >
      <Modal.Header
        title={t('docker.container.areYouSureConfirm')}
        modalType={ModalType.Destructive}
      />

      <Modal.Body>
        <p>{t('docker.container.recreateWarning')}</p>
        <SwitchField
          name="pullLatest"
          data-cy="recreate-pull-latest-switch"
          label={t('docker.container.rePullImage')}
          checked={pullLatest}
          onChange={setPullLatest}
          disabled={cannotPullImage}
        />
        {cannotPullImage && (
          <div className="mt-1 text-sm">
            <TextTip color="orange">
              {t('docker.container.cannotRePullImage')}
            </TextTip>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => onSubmit()}
          color="default"
          data-cy="cancel-recreate"
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => onSubmit({ pullLatest })}
          color="danger"
          data-cy="confirm-recreate"
        >
          {t('docker.container.recreate')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export async function confirmContainerRecreation(cannotPullImage: boolean) {
  return openModal(ConfirmRecreationModal, {
    cannotPullImage,
  });
}
