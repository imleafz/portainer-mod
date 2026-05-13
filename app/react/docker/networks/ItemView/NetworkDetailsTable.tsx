import { Fragment } from 'react';
import { Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import DockerNetworkHelper from '@/docker/helpers/networkHelper';
import { Authorized } from '@/react/hooks/useUser';

import { TableContainer, TableTitle } from '@@/datatables';
import { DetailsTable } from '@@/DetailsTable';
import { DeleteButton } from '@@/buttons/DeleteButton';

import { isSystemNetwork } from '../network.helper';
import { DockerNetwork, IPConfig } from '../types';

interface Props {
  network: DockerNetwork;
  onRemoveNetworkClicked: () => void;
}

export function NetworkDetailsTable({
  network,
  onRemoveNetworkClicked,
}: Props) {
  const { t } = useTranslation();
  const allowRemoveNetwork = !isSystemNetwork(network.Name);
  const ipv4Configs: IPConfig[] = DockerNetworkHelper.getIPV4Configs(
    network.IPAM?.Config
  );
  const ipv6Configs: IPConfig[] = DockerNetworkHelper.getIPV6Configs(
    network.IPAM?.Config
  );

  return (
    <TableContainer>
      <TableTitle label={t('docker.networks.networkDetails')} icon={Network} />
      <DetailsTable dataCy="networkDetails-detailsTable">
        {/* networkRowContent */}
        <DetailsTable.Row label={t('docker.networks.name')}>
          {network.Name}
        </DetailsTable.Row>
        <DetailsTable.Row label={t('docker.networks.id')}>
          {network.Id}
          {allowRemoveNetwork && (
            <span className="ml-2">
              <Authorized authorizations="DockerNetworkDelete">
                <DeleteButton
                  data-cy="networkDetails-deleteNetwork"
                  size="xsmall"
                  onConfirmed={onRemoveNetworkClicked}
                  confirmMessage={t('docker.networks.removeConfirm')}
                >
                  {t('docker.networks.deleteNetwork')}
                </DeleteButton>
              </Authorized>
            </span>
          )}
        </DetailsTable.Row>
        <DetailsTable.Row label={t('docker.networks.driver')}>
          {network.Driver}
        </DetailsTable.Row>
        <DetailsTable.Row label={t('docker.networks.scope')}>
          {network.Scope}
        </DetailsTable.Row>
        <DetailsTable.Row label={t('docker.networks.attachable')}>
          {String(network.Attachable)}
        </DetailsTable.Row>
        <DetailsTable.Row label={t('docker.networks.internal')}>
          {String(network.Internal)}
        </DetailsTable.Row>

        {/* IPV4 ConfigRowContent */}
        {ipv4Configs.map((config) => (
          <Fragment key={config.Subnet}>
            <DetailsTable.Row
              label={`${t('docker.networks.ipv4Subnet')}${getConfigDetails(config.Subnet)}`}
            >
              {`${t('docker.networks.ipv4Gateway')}${getConfigDetails(config.Gateway)}`}
            </DetailsTable.Row>
            <DetailsTable.Row
              label={`${t('docker.networks.ipv4IpRange')}${getConfigDetails(config.IPRange)}`}
            >
              {`${t('docker.networks.ipv4ExcludedIps')}${getAuxiliaryAddresses(
                config.AuxiliaryAddresses
              )}`}
            </DetailsTable.Row>
          </Fragment>
        ))}

        {/* IPV6 ConfigRowContent */}
        {ipv6Configs.map((config) => (
          <Fragment key={config.Subnet}>
            <DetailsTable.Row
              label={`${t('docker.networks.ipv6Subnet')}${getConfigDetails(config.Subnet)}`}
            >
              {`${t('docker.networks.ipv6Gateway')}${getConfigDetails(config.Gateway)}`}
            </DetailsTable.Row>
            <DetailsTable.Row
              label={`${t('docker.networks.ipv6IpRange')}${getConfigDetails(config.IPRange)}`}
            >
              {`${t('docker.networks.ipv6ExcludedIps')}${getAuxiliaryAddresses(
                config.AuxiliaryAddresses
              )}`}
            </DetailsTable.Row>
          </Fragment>
        ))}
      </DetailsTable>
    </TableContainer>
  );

  function getConfigDetails(configValue?: string) {
    return configValue ? ` - ${configValue}` : '';
  }

  function getAuxiliaryAddresses(auxiliaryAddresses?: object) {
    return auxiliaryAddresses
      ? ` - ${Object.values(auxiliaryAddresses).join(' - ')}`
      : '';
  }
}
