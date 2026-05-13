import { FormikErrors } from 'formik';
import { array, object, SchemaOf, string } from 'yup';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { useLoggingPlugins } from '@/react/docker/proxy/queries/usePlugins';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { useIsPodman } from '@/react/portainer/environments/queries/useIsPodman';

import { FormControl } from '@@/form-components/FormControl';
import { FormSection } from '@@/form-components/FormSection';
import { InputGroup } from '@@/form-components/InputGroup';
import { InputList, ItemProps } from '@@/form-components/InputList';
import { PortainerSelect } from '@@/form-components/PortainerSelect';
import { TextTip } from '@@/Tip/TextTip';
import { FormError } from '@@/form-components/FormError';

export interface LogConfig {
  type: string;
  options: Array<{ option: string; value: string }>;
}

export function LoggerConfig({
  value,
  onChange,
  apiVersion,
  errors,
}: {
  value: LogConfig;
  onChange: (value: LogConfig) => void;
  apiVersion: number;
  errors?: FormikErrors<LogConfig>;
}) {
  const { t } = useTranslation();
  const envId = useEnvironmentId();
  const isPodman = useIsPodman(envId);
  const isSystem = apiVersion < 1.25;
  const pluginsQuery = useLoggingPlugins(envId, isSystem, isPodman);

  if (!pluginsQuery.data) {
    return null;
  }

  const isDisabled = !value.type || value.type === 'none';

  const pluginOptions = [
    { label: t('docker.container.defaultLoggingDriver'), value: '' },
    ...pluginsQuery.data.map((p) => ({ label: p, value: p })),
    { label: 'none', value: 'none' },
  ];

  return (
    <FormSection title={t('docker.container.logging')}>
      <FormControl label={t('docker.container.driver')}>
        <PortainerSelect
          value={value.type}
          onChange={(type) => onChange({ ...value, type: type || '' })}
          options={pluginOptions}
          data-cy="docker-logging-driver-selector"
        />
      </FormControl>

      <TextTip color="blue">
        {t('docker.container.loggingDriverOverride')}
        <a
          href="https://docs.docker.com/engine/admin/logging/overview/#supported-logging-drivers"
          target="_blank"
          rel="noreferrer"
        >
          {t('docker.container.dockerDocumentation')}
        </a>
        .
      </TextTip>

      <InputList
        tooltip={
          isDisabled
            ? t('docker.container.loggingOptionsDisabled')
            : ''
        }
        label={t('docker.container.options')}
        onChange={(options) => handleChange({ options })}
        value={value.options}
        item={Item}
        itemBuilder={() => ({ option: '', value: '' })}
        disabled={isDisabled}
        errors={errors?.options}
        data-cy="docker-logging-options"
      />
    </FormSection>
  );

  function handleChange(partial: Partial<LogConfig>) {
    onChange({ ...value, ...partial });
  }
}

function Item({
  item: { option, value },
  onChange,
  error,
  index,
}: ItemProps<{ option: string; value: string }>) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex w-full gap-4">
        <InputGroup className="w-1/2">
          <InputGroup.Addon>{t('docker.container.option')}</InputGroup.Addon>
          <InputGroup.Input
            value={option}
            onChange={(e) => handleItemChange({ option: e.target.value })}
            placeholder={t('docker.container.optionPlaceholder')}
            data-cy={`docker-logging-option_${index}`}
          />
        </InputGroup>
        <InputGroup className="w-1/2">
          <InputGroup.Addon>{t('docker.container.value')}</InputGroup.Addon>
          <InputGroup.Input
            value={value}
            onChange={(e) => handleItemChange({ value: e.target.value })}
            placeholder={t('docker.container.valuePlaceholder')}
            data-cy={`docker-logging-value_${index}`}
          />
        </InputGroup>
      </div>
      {error && <FormError>{_.first(Object.values(error))}</FormError>}
    </div>
  );

  function handleItemChange(partial: Partial<{ option: string; value: string }>) {
    onChange({ option, value, ...partial });
  }
}

export function validation(): SchemaOf<LogConfig> {
  return object({
    options: array().of(
      object({
        option: string().required('Option is required'),
        value: string().required('Value is required'),
      })
    ),
    type: string().default(''),
  });
}