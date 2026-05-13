import { useTranslation } from 'react-i18next';
import { useCurrentStateAndParams } from '@uirouter/react';
import { Plus } from 'lucide-react';

import { AutomationTestingProps } from '@/types';

import { MenuButton, MenuButtonLink } from '@@/buttons/MenuButton';
import { Icon } from '@@/Icon';

export function CreateFromManifestButton({
  params = {},
  'data-cy': dataCy,
}: { params?: object } & AutomationTestingProps) {
  const { t } = useTranslation();
  const { state } = useCurrentStateAndParams();
  return (
    <MenuButton
      items={[
        <MenuButtonLink
          key="manifest"
          to="kubernetes.deploy"
          params={{
            referrer: state.name,
            ...params,
          }}
          label={t('kubernetes.createFromManifest')}
          data-cy={`${dataCy}-manifest`}
        >
          {t('kubernetes.manifest')}
        </MenuButtonLink>,
        <MenuButtonLink
          key="helm"
          to="kubernetes.helminstall"
          params={{
            referrer: state.name,
            ...params,
          }}
          label={t('kubernetes.createFromHelmChart')}
          data-cy={`${dataCy}-helm`}
        >
          {t('kubernetes.helmChart')}
        </MenuButtonLink>,
      ]}
      data-cy={dataCy}
    >
      <Icon icon={Plus} size="xs" />
      {t('kubernetes.createFromCode')}
    </MenuButton>
  );
}
