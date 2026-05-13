import { FormikErrors } from 'formik';
import { array, object, SchemaOf, string } from 'yup';
import { useTranslation } from 'react-i18next';

import { FormError } from '@@/form-components/FormError';
import { InputList, ItemProps } from '@@/form-components/InputList';
import { InputLabeled } from '@@/form-components/Input/InputLabeled';

interface Sysctls {
  name: string;
  value: string;
}

export type Values = Array<Sysctls>;

export function SysctlsField({
  values,
  onChange,
  errors,
}: {
  values: Values;
  onChange: (value: Values) => void;
  errors?: FormikErrors<Sysctls>[];
}) {
  const { t } = useTranslation();

  return (
    <InputList
      value={values}
      onChange={onChange}
      item={Item}
      addLabel={t('docker.container.addSysctl')}
      label={t('docker.container.sysctls')}
      errors={errors}
      itemBuilder={() => ({ name: '', value: '' })}
      data-cy="docker-container-sysctls"
    />
  );
}

function Item({ item, onChange, error, index }: ItemProps<Sysctls>) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="flex w-full gap-4">
        <InputLabeled
          value={item.name}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
          label={t('docker.container.sysctlName')}
          placeholder={t('docker.container.sysctlNamePlaceholder')}
          className="w-1/2"
          size="small"
          data-cy={`docker-container-sysctl-name_${index}`}
        />
        <InputLabeled
          value={item.value}
          onChange={(e) => onChange({ ...item, value: e.target.value })}
          label={t('docker.container.sysctlValue')}
          placeholder={t('docker.container.sysctlValuePlaceholder')}
          className="w-1/2"
          size="small"
          data-cy={`docker-container-sysctl-value_${index}`}
        />
      </div>
      {error && <FormError>{Object.values(error)[0]}</FormError>}
    </div>
  );
}

export function sysctlsValidation(): SchemaOf<Values> {
  return array(
    object({
      name: string().required('Name is required'),
      value: string().required('Value is required'),
    })
  );
}
