import { useTranslation } from 'react-i18next';

import { FormError } from '@@/form-components/FormError';
import { InputGroup } from '@@/form-components/InputGroup';
import { ItemProps } from '@@/form-components/InputList';

import { Label } from './types';

export function Item({ item, onChange, error, index }: ItemProps<Label>) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="flex w-full gap-4">
        <InputGroup className="w-1/2">
          <InputGroup.Addon>{t('docker.container.labelName')}</InputGroup.Addon>
          <InputGroup.Input
            value={item.name}
            data-cy={`label-name_${index}`}
            onChange={(e) => onChange({ ...item, name: e.target.value })}
            placeholder={t('docker.container.labelNamePlaceholder')}
          />
        </InputGroup>
        <InputGroup className="w-1/2">
          <InputGroup.Addon>{t('docker.container.labelValue')}</InputGroup.Addon>
          <InputGroup.Input
            value={item.value}
            data-cy={`label-value${index}`}
            onChange={(e) => onChange({ ...item, value: e.target.value })}
            placeholder={t('docker.container.labelValuePlaceholder')}
          />
        </InputGroup>
      </div>
      {error && <FormError>{Object.values(error)[0]}</FormError>}
    </div>
  );
}
