import { array, string } from 'yup';
import { useTranslation } from 'react-i18next';

import { FormError } from '@@/form-components/FormError';
import { InputLabeled } from '@@/form-components/Input/InputLabeled';
import { ItemProps } from '@@/form-components/InputList';
import { ArrayError, InputList } from '@@/form-components/InputList/InputList';

export const hostFileSchema = array(
  string().required('Entry is required')
).default([]);

export function HostsFileEntries({
  values,
  onChange,
  errors,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  errors?: ArrayError<string>;
}) {
  const { t } = useTranslation();

  return (
    <InputList
      label={t('docker.container.hostsFileEntries')}
      value={values}
      onChange={(hostsFileEntries) => onChange(hostsFileEntries)}
      errors={errors}
      item={HostsFileEntryItem}
      itemBuilder={() => ''}
      data-cy="hosts-file-entries"
    />
  );
}

function HostsFileEntryItem({
  item,
  onChange,
  disabled,
  error,
  readOnly,
  index,
}: ItemProps<string>) {
  const { t } = useTranslation();

  return (
    <div>
      <InputLabeled
        label={t('docker.container.value')}
        value={item}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        data-cy={`hosts-file-entry_${index}`}
      />

      {error && <FormError>{error}</FormError>}
    </div>
  );
}
