import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsEnvironmentAdmin } from '@/react/hooks/useUser';
import { useCurrentEnvironment } from '@/react/hooks/useCurrentEnvironment';

import { InputList } from '@@/form-components/InputList';
import { ArrayError } from '@@/form-components/InputList/InputList';

import { Values, Volume } from './types';
import { InputContext } from './context';
import { Item } from './Item';

export function VolumesTab({
  onChange,
  values,
  errors,
  allowAuto = false,
}: {
  onChange: (values: Values) => void;
  values: Values;
  errors?: ArrayError<Values>;
  allowAuto?: boolean;
}) {
  const { t } = useTranslation();
  const isEnvironmentAdminQuery = useIsEnvironmentAdmin({ adminOnlyCE: true });
  const envQuery = useCurrentEnvironment();

  const allowBindMounts = !!(
    isEnvironmentAdminQuery.authorized ||
    envQuery.data?.SecuritySettings.allowBindMountsForRegularUsers
  );

  const inputContext = useMemo(
    () => ({ allowBindMounts, allowAuto }),
    [allowAuto, allowBindMounts]
  );

  return (
    <InputContext.Provider value={inputContext}>
      <InputList<Volume>
        errors={Array.isArray(errors) ? errors : []}
        label={t('docker.container.volumeMapping')}
        onChange={(volumes) => handleChange(volumes)}
        value={values}
        addLabel={t('docker.container.mapAdditionalVolume')}
        item={Item}
        itemBuilder={() => ({
          containerPath: '',
          type: 'volume',
          name: '',
          readOnly: false,
        })}
        data-cy="docker-container-volumes"
      />
    </InputContext.Provider>
  );

  function handleChange(newValues: Values) {
    onChange(newValues);
  }
}
