import { string } from 'yup';
import { useTranslation } from 'react-i18next';

import { FormControl } from '@@/form-components/FormControl';
import { Input } from '@@/form-components/Input';

export function NameField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <FormControl label={t('docker.container.name')} inputId="name-input" errors={error}>
      <Input
        id="name-input"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={t('docker.container.namePlaceholder')}
        data-cy="container-name-input"
      />
    </FormControl>
  );
}

export function nameValidation() {
  return string().default('');
}
