import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSystemStatus } from '@/react/portainer/system/useSystemStatus';

import { Modal } from '@@/modals/Modal';
import { Icon } from '@@/Icon';

export function LoadingDialog() {
  const { t } = useTranslation();
  useWaitForServerStatus();

  return (
    <Modal aria-label="Upgrade Portainer to Business Edition">
      <Modal.Body>
        <div className="flex w-full flex-col items-center justify-center">
          <Icon
            icon={Loader2}
            className="animate-spin-slow !text-8xl !text-blue-8"
            aria-label="loading"
          />

          <h1 className="!text-2xl">{t('upgradeBE.loading.upgrading')}</h1>

          <p className="text-center text-xl text-gray-6">
            {t('upgradeBE.loading.pleaseWait')}
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
}

function useWaitForServerStatus() {
  const [enabled, setEnabled] = useState(false);
  useSystemStatus({
    enabled,
    retry: true,
    onSuccess() {
      window.location.reload();
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setEnabled(true);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  });
}
