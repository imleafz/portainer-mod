import { useTranslation } from 'react-i18next';

import { ModalType } from '@@/modals';
import { openConfirm } from '@@/modals/confirm';
import { buildConfirmButton } from '@@/modals/utils';

export async function confirmImageExport() {
  const { t } = useTranslation();
  return openConfirm({
    modalType: ModalType.Warn,
    title: t('docker.image.exportCaution'),
    message: t('docker.image.exportMessage'),
    confirmButton: buildConfirmButton(t('docker.image.continue')),
  });
}
