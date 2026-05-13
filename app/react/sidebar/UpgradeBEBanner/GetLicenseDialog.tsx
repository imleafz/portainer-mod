import { useTranslation } from 'react-i18next';

import { HubspotForm } from '@@/HubspotForm';
import { Modal } from '@@/modals/Modal';

export function GetLicenseDialog({
  onDismiss,
  goToUploadLicense,
}: {
  onDismiss: () => void;
  goToUploadLicense: (isSubmitted: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      onDismiss={onDismiss}
      aria-label="Upgrade Portainer to Business Edition"
      size="lg"
      className="!bg-white [&>.close-button]:!text-black"
    >
      <Modal.Body>
        <div className="max-h-[80vh] overflow-auto">
          <HubspotForm
            region="na1"
            portalId="4731999"
            formId="1ef8ea88-3e03-46c5-8aef-c1d9f48fd06b"
            onSubmitted={() => {
              goToUploadLicense(true);
            }}
            loading={<div className="text-black">{t('upgradeBE.getLicense.loading')}</div>}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
}
