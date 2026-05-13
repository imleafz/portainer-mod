import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Field, useFormikContext } from 'formik';

import { FormControl } from '@@/form-components/FormControl';
import { Input } from '@@/form-components/Input';
import { SwitchField } from '@@/form-components/SwitchField';
import { Icon } from '@@/Icon';

import { FormValues } from '../types';

interface Props {
  isDockerStandalone: boolean;
}

export function StackRelativePathFieldset({ isDockerStandalone }: Props) {
  const { t } = useTranslation();
  const { values, setFieldValue, errors } = useFormikContext<FormValues>();

  const supportRelativePath = values.git.SupportRelativePath || false;

  return (
    <div className="form-group">
      <div className="col-sm-12 mb-3">
        <SwitchField
          label={t('docker.stack.enableRelativePathVolumes')}
          checked={supportRelativePath}
          onChange={(checked) =>
            setFieldValue('git.SupportRelativePath', checked)
          }
          tooltip={t('docker.stack.enableRelativePathVolumesTooltip')}
          labelClass="col-sm-3 col-lg-2"
          data-cy="enable-relative-paths"
        />
      </div>

      {supportRelativePath && (
        <>
          {!isDockerStandalone && (
            <div className="col-sm-12">
              <p className="small text-muted flex items-center gap-1">
                <Icon icon={Info} className="!mr-1 text-blue-8" />
                {t('docker.stack.relativePathVolumesSwarmWarning')}
              </p>
            </div>
          )}

          <div className="col-sm-12">
            <FormControl
              label={
                isDockerStandalone
                  ? t('docker.stack.localFilesystemPath')
                  : t('docker.stack.networkFilesystemPath')
              }
              inputId="filesystem-path"
              size="medium"
              errors={errors.git?.FilesystemPath}
            >
              <Field
                as={Input}
                id="filesystem-path"
                name="git.FilesystemPath"
                placeholder="/mnt"
                data-cy="filesystem-path"
              />
            </FormControl>
          </div>
        </>
      )}
    </div>
  );
}
