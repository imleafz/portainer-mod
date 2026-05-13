import { useTranslation } from 'react-i18next';

import {
  EnvVarValues,
  EnvironmentVariablesPanel,
} from '@@/form-components/EnvironmentVariablesFieldset';
import { ArrayError } from '@@/form-components/InputList/InputList';

export function EnvVarsTab({
  values,
  onChange,
  errors,
}: {
  values: EnvVarValues;
  onChange(value: EnvVarValues): void;
  errors?: ArrayError<EnvVarValues>;
}) {
  const { t } = useTranslation();

  return (
    <div className="form-group">
      <EnvironmentVariablesPanel
        values={values}
        explanation={t('docker.container.envVarsExplanation')}
        onChange={handleChange}
        errors={errors}
      />
    </div>
  );

  function handleChange(values: EnvVarValues) {
    onChange(values);
  }
}
