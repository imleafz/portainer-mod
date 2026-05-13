import { FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';

import { FormControl } from '@@/form-components/FormControl';
import { Input } from '@@/form-components/Input';

import { ConsoleSettings } from './ConsoleSettings';
import { LoggerConfig } from './LoggerConfig';
import { OverridableInput } from './OverridableInput';
import { Values } from './types';

export function CommandsTab({
  apiVersion,
  values,
  setFieldValue,
  errors,
}: {
  apiVersion: number;
  values: Values;
  setFieldValue: (field: string, value: unknown) => void;
  errors?: FormikErrors<Values>;
}) {
  const { t } = useTranslation();

  return (
    <div className="mt-3">
      <FormControl
        label={t('docker.container.command')}
        inputId="command-input"
        size="xsmall"
        errors={errors?.cmd}
      >
        <OverridableInput
          value={values.cmd}
          onChange={(cmd) => setFieldValue('cmd', cmd)}
          id="command-input"
          placeholder={t('docker.container.commandPlaceholder')}
        />
      </FormControl>

      <FormControl
        label={t('docker.container.entrypoint')}
        inputId="entrypoint-input"
        size="xsmall"
        tooltip={t('docker.container.entrypointTooltip')}
        errors={errors?.entrypoint}
      >
        <OverridableInput
          value={values.entrypoint}
          onChange={(entrypoint) => setFieldValue('entrypoint', entrypoint)}
          id="entrypoint-input"
          placeholder={t('docker.container.entrypointPlaceholder')}
        />
      </FormControl>

      <div className="flex justify-between gap-4">
        <FormControl
          label={t('docker.container.workingDir')}
          inputId="working-dir-input"
          className="w-1/2"
          errors={errors?.workingDir}
        >
          <Input
            value={values.workingDir}
            onChange={(e) => setFieldValue('workingDir', e.target.value)}
            placeholder={t('docker.container.workingDirPlaceholder')}
            data-cy="working-dir-input"
          />
        </FormControl>
        <FormControl
          label={t('docker.container.user')}
          inputId="user-input"
          className="w-1/2"
          errors={errors?.user}
        >
          <Input
            value={values.user}
            onChange={(e) => setFieldValue('user', e.target.value)}
            placeholder={t('docker.container.userPlaceholder')}
            data-cy="user-input"
          />
        </FormControl>
      </div>

      <ConsoleSettings
        value={values.console}
        onChange={(console) => setFieldValue('console', console)}
      />

      <LoggerConfig
        apiVersion={apiVersion}
        value={values.logConfig}
        onChange={(logConfig) => setFieldValue('logConfig', logConfig)}
        errors={errors?.logConfig}
      />
    </div>
  );
}
