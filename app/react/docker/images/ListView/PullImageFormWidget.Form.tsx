import { useTranslation } from 'react-i18next';
import { Form, useFormikContext } from 'formik';

import { ImageConfigFieldset } from '@@/ImageConfigFieldset';
import { FormSection } from '@@/form-components/FormSection';
import { FormActions } from '@@/form-components/FormActions';

import { NodeSelector } from '../../agent/NodeSelector';

import { FormValues } from './PullImageFormWidget.types';

export function PullImageForm({
  onRateLimit,
  isLoading,
  isNodeVisible,
}: {
  onRateLimit: (limited?: boolean) => void;
  isLoading: boolean;
  isNodeVisible: boolean;
}) {
  const { t } = useTranslation();
  const { values, setFieldValue, errors, isValid } =
    useFormikContext<FormValues>();

  return (
    <Form className="form-horizontal">
      <ImageConfigFieldset
        autoComplete
        values={values.config}
        setFieldValue={(field, value) =>
          setFieldValue(`config.${field}`, value)
        }
        errors={errors.config}
        onRateLimit={onRateLimit}
      >
        {isNodeVisible && (
          <FormSection title={t('docker.image.deployment')}>
            <NodeSelector
              value={values.node}
              onChange={(node) => setFieldValue('node', node)}
              error={errors.node}
            />
          </FormSection>
        )}

        <FormActions
          isLoading={isLoading}
          isValid={isValid}
          loadingText={t('docker.image.downloadInProgress')}
          submitLabel={t('docker.image.pullTheImage')}
          data-cy="pull-image-button"
        />
      </ImageConfigFieldset>
    </Form>
  );
}
