import { useTranslation } from 'react-i18next';

import { TextTip } from '@@/Tip/TextTip';

interface Props {
  isSwarm: boolean;
  composeSyntaxMaxVersion?: number;
}

export function DeploymentInfo({ isSwarm, composeSyntaxMaxVersion }: Props) {
  const { t } = useTranslation();

  if (isSwarm) {
    return (
      <div className="form-group">
        <div className="col-sm-12">
          <span
            className="text-muted small"
            dangerouslySetInnerHTML={{
              __html: t('docker.stacks.swarmDeployInfo', {
                interpolation: { escapeValue: false },
              }),
            }}
          />
        </div>
      </div>
    );
  }

  if (composeSyntaxMaxVersion === 2) {
    return (
      <div className="form-group">
        <div className="col-sm-12">
          <div
            className="text-muted small mb-2"
            dangerouslySetInnerHTML={{
              __html: t('docker.stacks.composeV2DeployInfo', {
                interpolation: { escapeValue: false },
              }),
            }}
          />
          <TextTip color="orange">
            {t('docker.stacks.composeV2DeployWarning')}
          </TextTip>
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <div className="col-sm-12">
        <span
          className="text-muted small"
          dangerouslySetInnerHTML={{
            __html: t('docker.stacks.composeDeployInfo', {
              interpolation: { escapeValue: false },
            }),
          }}
        />
      </div>
    </div>
  );
}
