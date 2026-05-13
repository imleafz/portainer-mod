import { useTranslation } from 'react-i18next';

import { confirmEnableTLSVerify } from '@/react/portainer/gitops/utils';

import { SwitchField } from '@@/form-components/SwitchField';

interface Props {
  value: boolean;
  initialValue: boolean;
  onChange: (value: boolean) => void;
}

export function TLSVerificationField({ value, initialValue, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="form-group">
      <div className="col-sm-12">
        <SwitchField
          name="TLSSkipVerify"
          checked={value}
          tooltip={t('docker.stack.skipTLSVerificationTooltip')}
          labelClass="col-sm-3 col-lg-2"
          label={t('docker.stack.skipTLSVerification')}
          onChange={async (newValue) => {
            if (initialValue && !newValue) {
              const confirmed = await confirmEnableTLSVerify();
              if (!confirmed) {
                return;
              }
            }

            onChange(newValue);
          }}
          data-cy="gitops-skip-tls-verification-switch"
        />
      </div>
    </div>
  );
}
