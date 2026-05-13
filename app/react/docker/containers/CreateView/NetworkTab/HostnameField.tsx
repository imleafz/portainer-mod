import { string } from 'yup';
import { useTranslation } from 'react-i18next';

import { FormControl } from '@@/form-components/FormControl';
import { Input } from '@@/form-components/Input';

export function HostnameField({
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
    <FormControl label={t('docker.container.hostname')} errors={error}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. web01"
        data-cy="docker-container-hostname-input"
      />
    </FormControl>
  );
}

export const hostnameSchema = string().default('');
