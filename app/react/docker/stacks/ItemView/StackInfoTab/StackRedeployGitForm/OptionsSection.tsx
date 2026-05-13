import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';

import { Stack, StackType } from '@/react/common/stacks/types';

import { SwitchField } from '@@/form-components/SwitchField';
import { FormSection } from '@@/form-components/FormSection';

import { FormValues } from './types';

interface Props {
  stack: Stack;
  apiVersion: number;
}

export function OptionsSection({ stack, apiVersion }: Props) {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<FormValues>();

  if (stack.Type !== StackType.DockerSwarm || apiVersion < 1.27) {
    return null;
  }

  return (
    <FormSection title={t('docker.stacks.options')}>
      <div className="form-group">
        <div className="col-sm-12">
          <SwitchField
            name="prune"
            checked={values.prune}
            tooltip={t('docker.stacks.pruneServicesTooltip')}
            labelClass="col-sm-3 col-lg-2"
            label={t('docker.stacks.pruneServices')}
            onChange={(value) => setFieldValue('prune', value)}
            data-cy="stack-prune-services-switch"
          />
        </div>
      </div>
    </FormSection>
  );
}
