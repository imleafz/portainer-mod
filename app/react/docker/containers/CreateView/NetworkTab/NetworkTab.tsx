import { FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';

import { useIsPodman } from '@/react/portainer/environments/queries/useIsPodman';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';

import { FormControl } from '@@/form-components/FormControl';
import { Input } from '@@/form-components/Input';

import { NetworkSelector } from '../../components/NetworkSelector';

import { CONTAINER_MODE, Values } from './types';
import { ContainerSelector } from './ContainerSelector';
import { HostsFileEntries } from './HostsFileEntries';
import { HostnameField } from './HostnameField';

export function NetworkTab({
  values,
  setFieldValue,
  errors,
}: {
  values: Values;
  setFieldValue: (field: string, value: unknown) => void;
  errors?: FormikErrors<Values>;
}) {
  const { t } = useTranslation();
  const envId = useEnvironmentId();
  const isPodman = useIsPodman(envId);
  const additionalOptions = isPodman
    ? []
    : [{ label: t('docker.container.container'), value: CONTAINER_MODE }];
  return (
    <div className="mt-3">
      <FormControl
        label={t('docker.container.network')}
        errors={errors?.networkMode}
      >
        <NetworkSelector
          value={values.networkMode}
          additionalOptions={additionalOptions}
          onChange={(networkMode) => setFieldValue('networkMode', networkMode)}
        />
      </FormControl>

      {values.networkMode === CONTAINER_MODE && (
        <FormControl
          label={t('docker.container.container')}
          errors={errors?.container}
        >
          <ContainerSelector
            value={values.container}
            onChange={(container) => setFieldValue('container', container)}
          />
        </FormControl>
      )}

      <HostnameField
        value={values.hostname}
        onChange={(value) => setFieldValue('hostname', value)}
      />

      <FormControl
        label={t('docker.container.domainName')}
        errors={errors?.domain}
      >
        <Input
          value={values.domain}
          onChange={(e) => setFieldValue('domain', e.target.value)}
          placeholder={t('docker.container.domainNamePlaceholder')}
          data-cy="docker-container-domain-input"
        />
      </FormControl>

      <FormControl
        label={t('docker.container.macAddress')}
        errors={errors?.macAddress}
      >
        <Input
          value={values.macAddress}
          onChange={(e) => setFieldValue('macAddress', e.target.value)}
          placeholder={t('docker.container.macAddressPlaceholder')}
          data-cy="docker-container-mac-address-input"
        />
      </FormControl>

      <FormControl
        label={t('docker.container.ipv4Address')}
        errors={errors?.ipv4Address}
      >
        <Input
          value={values.ipv4Address}
          onChange={(e) => setFieldValue('ipv4Address', e.target.value)}
          placeholder={t('docker.container.ipv4AddressPlaceholder')}
          data-cy="docker-container-ipv4-address-input"
        />
      </FormControl>

      <FormControl
        label={t('docker.container.ipv6Address')}
        errors={errors?.ipv6Address}
      >
        <Input
          value={values.ipv6Address}
          onChange={(e) => setFieldValue('ipv6Address', e.target.value)}
          placeholder={t('docker.container.ipv6AddressPlaceholder')}
          data-cy="docker-container-ipv6-address-input"
        />
      </FormControl>

      <FormControl
        label={t('docker.container.primaryDns')}
        errors={errors?.primaryDns}
      >
        <Input
          value={values.primaryDns}
          onChange={(e) => setFieldValue('primaryDns', e.target.value)}
          placeholder={t('docker.container.primaryDnsPlaceholder')}
          data-cy="docker-container-primary-dns-input"
        />
      </FormControl>

      <FormControl
        label={t('docker.container.secondaryDns')}
        errors={errors?.secondaryDns}
      >
        <Input
          value={values.secondaryDns}
          onChange={(e) => setFieldValue('secondaryDns', e.target.value)}
          placeholder={t('docker.container.secondaryDnsPlaceholder')}
          data-cy="docker-container-secondary-dns-input"
        />
      </FormControl>

      <HostsFileEntries
        values={values.hostsFileEntries}
        onChange={(v) => setFieldValue('hostsFileEntries', v)}
        errors={errors?.hostsFileEntries}
      />
    </div>
  );
}
