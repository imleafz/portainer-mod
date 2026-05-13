import { FormikErrors } from 'formik';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ButtonSelector } from '@@/form-components/ButtonSelector/ButtonSelector';
import { FormError } from '@@/form-components/FormError';
import { InputList } from '@@/form-components/InputList';
import { ItemProps } from '@@/form-components/InputList/InputList';
import { Icon } from '@@/Icon';
import { InputLabeled } from '@@/form-components/Input/InputLabeled';

export type Protocol = 'tcp' | 'udp';

export interface PortMapping {
  hostPort: string;
  protocol: Protocol;
  containerPort: string;
}

export type Values = Array<PortMapping>;

interface Props {
  value: Values;
  onChange?(value: Values): void;
  errors?: FormikErrors<PortMapping>[] | string | string[];
  disabled?: boolean;
  readOnly?: boolean;
}

export function PortsMappingField({
  value,
  onChange = () => {},
  errors,
  disabled,
  readOnly,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <InputList<PortMapping>
        label={t('docker.container.portMapping')}
        value={value}
        onChange={onChange}
        addLabel={t('docker.container.mapAdditionalPort')}
        itemBuilder={() => ({
          hostPort: '',
          containerPort: '',
          protocol: 'tcp',
        })}
        item={Item}
        errors={errors}
        disabled={disabled}
        readOnly={readOnly}
        tooltip={t('docker.container.portMappingTooltip')}
        data-cy="docker-containers-ports-mapping"
      />
      {typeof errors === 'string' && (
        <div className="form-group col-md-12">
          <FormError>{errors}</FormError>
        </div>
      )}
    </>
  );
}

function Item({
  onChange,
  item,
  error,
  disabled,
  readOnly,
  index,
}: ItemProps<PortMapping>) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <InputLabeled
          size="small"
          data-cy={`hostPort-${index}`}
          disabled={disabled}
          readOnly={readOnly}
          value={item.hostPort}
          onChange={(e) => handleChange('hostPort', e.target.value)}
          label={t('docker.container.host')}
          placeholder={t('docker.container.hostPathPlaceholder')}
          className="w-1/2"
          id={`hostPort-${index}`}
        />

        <span className="mx-3">
          <Icon icon={ArrowRight} />
        </span>

        <InputLabeled
          size="small"
          disabled={disabled}
          readOnly={readOnly}
          value={item.containerPort}
          onChange={(e) => handleChange('containerPort', e.target.value)}
          label={t('docker.container.container')}
          placeholder={t('docker.container.containerPathPlaceholder')}
          className="w-1/2"
          id={`containerPort-${index}`}
          data-cy={`containerPort-${index}`}
        />

        <ButtonSelector<Protocol>
          onChange={(value) => handleChange('protocol', value)}
          value={item.protocol}
          options={[
            { value: 'tcp', label: t('docker.container.tcp') },
            { value: 'udp', label: t('docker.container.udp') },
          ]}
          disabled={disabled}
          readOnly={readOnly}
        />
      </div>
      {!!error && <FormError>{Object.values(error)[0]}</FormError>}
    </div>
  );

  function handleChange(name: keyof PortMapping, value: string) {
    onChange({ ...item, [name]: value });
  }
}
