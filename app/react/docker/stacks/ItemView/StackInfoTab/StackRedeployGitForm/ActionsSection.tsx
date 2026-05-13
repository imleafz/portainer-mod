import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FormSection } from '@@/form-components/FormSection';
import { LoadingButton } from '@@/buttons';

interface Props {
  isDirty: boolean;
  isValid: boolean;
  isSaveLoading: boolean;
  isDeployLoading: boolean;
  onDeploy: () => void;
}

export function ActionsSection({
  isDirty,
  isValid,
  isSaveLoading,
  isDeployLoading,
  onDeploy,
}: Props) {
  const { t } = useTranslation();

  return (
    <FormSection title={t('docker.stacks.options')}>
      <LoadingButton
        size="small"
        color="primary"
        type="button"
        onClick={onDeploy}
        disabled={isDirty || isSaveLoading}
        isLoading={isDeployLoading}
        loadingText={t('docker.stacks.redeploying')}
        data-cy="stack-redeploy-button"
      >
        <RefreshCw className="mr-1" />
        {t('docker.stacks.pullAndRedeploy')}
      </LoadingButton>

      <LoadingButton
        size="small"
        color="primary"
        disabled={!isDirty || !isValid || isDeployLoading}
        isLoading={isSaveLoading}
        loadingText={t('docker.stacks.saveSettingsInProgress')}
        className="ml-2"
        data-cy="stack-save-settings-button"
      >
        {t('docker.stacks.saveSettings')}
      </LoadingButton>
    </FormSection>
  );
}
