import { useTranslation } from 'react-i18next';

import { ButtonSelector } from '@@/form-components/ButtonSelector/ButtonSelector';
import { FormControl } from '@@/form-components/FormControl';

import { RestartPolicy } from './types';

export function RestartPolicyTab({
  values,
  onChange,
}: {
  values: RestartPolicy;
  onChange: (values: RestartPolicy) => void;
}) {
  const { t } = useTranslation();

  return (
    <FormControl label={t('docker.container.restartPolicyTitle')}>
      <ButtonSelector
        options={[
          { label: t('docker.container.restartPolicyNever'), value: RestartPolicy.No },
          { label: t('docker.container.restartPolicyAlways'), value: RestartPolicy.Always },
          { label: t('docker.container.restartPolicyOnFailure'), value: RestartPolicy.OnFailure },
          { label: t('docker.container.restartPolicyUnlessStopped'), value: RestartPolicy.UnlessStopped },
        ]}
        value={values}
        onChange={onChange}
      />
    </FormControl>
  );
}
