import { FormikErrors } from 'formik';
import { array, object, SchemaOf, string } from 'yup';
import { DeviceMapping } from 'docker-types';
import { useTranslation } from 'react-i18next';

import { FormError } from '@@/form-components/FormError';
import { InputList, ItemProps } from '@@/form-components/InputList';
import { InputLabeled } from '@@/form-components/Input/InputLabeled';

interface Device {
  pathOnHost: string;
  pathInContainer: string;
}

export type Values = Array<Device>;

export function DevicesField({
  values,
  onChange,
  errors,
}: {
  values: Values;
  onChange: (value: Values) => void;
  errors?: FormikErrors<Device>[];
}) {
  const { t } = useTranslation();

  return (
    <InputList
      value={values}
      onChange={onChange}
      item={Item}
      addLabel={t('docker.container.addDevice')}
      label={t('docker.container.devices')}
      errors={errors}
      itemBuilder={() => ({ pathOnHost: '', pathInContainer: '' })}
      data-cy="docker-container-devices"
    />
  );
}

function Item({ item, onChange, error, index }: ItemProps<Device>) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="flex w-full gap-4">
        <InputLabeled
          value={item.pathOnHost}
          data-cy={`device-path-on-host_${index}`}
          onChange={(e) => onChange({ ...item, pathOnHost: e.target.value })}
          label={t('docker.container.hostPath')}
          placeholder={t('docker.container.hostPathPlaceholder')}
          className="w-1/2"
          size="small"
        />
        <InputLabeled
          value={item.pathInContainer}
          data-cy={`device-path-on-container_${index}`}
          onChange={(e) =>
            onChange({ ...item, pathInContainer: e.target.value })
          }
          label={t('docker.container.containerPath')}
          placeholder={t('docker.container.containerPathPlaceholder')}
          className="w-1/2"
          size="small"
        />
      </div>
      {error && <FormError>{Object.values(error)[0]}</FormError>}
    </div>
  );
}

export function devicesValidation(): SchemaOf<Values> {
  return array(
    object({
      pathOnHost: string().required('Host path is required'),
      pathInContainer: string().required('Container path is required'),
    })
  );
}

export function toDevicesViewModel(devices: Array<DeviceMapping>): Values {
  return devices.filter(hasPath).map((device) => ({
    pathOnHost: device.PathOnHost,
    pathInContainer: device.PathInContainer,
  }));

  function hasPath(
    device: DeviceMapping
  ): device is { PathOnHost: string; PathInContainer: string } {
    return !!device.PathOnHost && !!device.PathInContainer;
  }
}
