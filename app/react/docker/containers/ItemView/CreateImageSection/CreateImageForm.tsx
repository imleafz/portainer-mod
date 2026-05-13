import { Form, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';

import { ImageConfigFieldset } from '@@/ImageConfigFieldset';
import { LoadingButton } from '@@/buttons';

import { FormValues } from './types';

export function CreateImageForm({
  onRateLimit,
  isLoading,
}: {
  onRateLimit: (limited?: boolean) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const { values, setFieldValue, errors, isValid } =
    useFormikContext<FormValues>();

  return (
    <Form className="form-horizontal">
      <div className="form-group">
        <div className="col-sm-12">
          <span className="small text-muted">
            {t('docker.container.createImageDescription')}
          </span>
        </div>
      </div>

      <ImageConfigFieldset
        autoComplete
        values={values.config}
        setFieldValue={(field, value) =>
          setFieldValue(`config.${field}`, value)
        }
        errors={errors.config}
        onRateLimit={onRateLimit}
      />

      {/* Tag note */}
      <div className="form-group">
        <div className="col-sm-12">
          <span className="small text-muted">
            {t('docker.container.imageTagNote')}
          </span>
        </div>
      </div>

      <LoadingButton
        isLoading={isLoading}
        disabled={!isValid}
        loadingText={t('docker.container.creatingImage')}
        data-cy="create-image-button"
      >
        {t('docker.container.createImage')}
      </LoadingButton>
    </Form>
  );
}
