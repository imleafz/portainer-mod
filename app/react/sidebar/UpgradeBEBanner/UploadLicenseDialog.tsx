import { Field, Form, Formik } from 'formik';
import { object, SchemaOf, string } from 'yup';
import { useTranslation } from 'react-i18next';

import { useUpgradeEditionMutation } from '@/react/portainer/system/useUpgradeEditionMutation';
import { notifySuccess } from '@/portainer/services/notifications';

import { Button, LoadingButton } from '@@/buttons';
import { FormControl } from '@@/form-components/FormControl';
import { Input } from '@@/form-components/Input';
import { Modal } from '@@/modals/Modal';
import { Alert } from '@@/Alert';

interface FormValues {
  license: string;
}

const initialValues: FormValues = {
  license: '',
};

export function UploadLicenseDialog({
  onDismiss,
  goToLoading,
  goToGetLicense,
  isGetLicenseSubmitted,
}: {
  onDismiss: () => void;
  goToLoading: () => void;
  goToGetLicense: () => void;
  isGetLicenseSubmitted: boolean;
}) {
  const { t } = useTranslation();
  const upgradeMutation = useUpgradeEditionMutation();

  return (
    <Modal
      onDismiss={onDismiss}
      aria-label="Upgrade Portainer to Business Edition"
    >
      <Modal.Header
        title={<h4 className="text-xl font-medium">{t('upgradeBE.uploadLicense.title')}</h4>}
      />
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validation}
        validateOnMount
      >
        {({ errors }) => (
          <Form noValidate>
            <Modal.Body>
              {!isGetLicenseSubmitted ? (
                <p className="font-semibold text-gray-7">
                  {t('upgradeBE.uploadLicense.enterLicense')}
                </p>
              ) : (
                <div className="mb-4">
                  <Alert color="success" title={t('upgradeBE.uploadLicense.licenseSent')}>
                    {t('upgradeBE.uploadLicense.checkEmail')}
                  </Alert>
                </div>
              )}

              <FormControl
                label={t('upgradeBE.uploadLicense.license')}
                errors={errors.license}
                required
                size="vertical"
              >
                <Field name="license" as={Input} required />
              </FormControl>
            </Modal.Body>
            <Modal.Footer>
              <div className="flex w-full gap-2 [&>*]:w-1/2">
                <Button
                  color="default"
                  data-cy="get-license-button"
                  size="medium"
                  className="w-full"
                  onClick={goToGetLicense}
                >
                  {t('upgradeBE.uploadLicense.getLicense')}
                </Button>
                <LoadingButton
                  color="primary"
                  data-cy="start-upgrade-button"
                  size="medium"
                  loadingText={t('upgradeBE.uploadLicense.validatingLicense')}
                  isLoading={upgradeMutation.isLoading}
                >
                  {t('upgradeBE.uploadLicense.startUpgrade')}
                </LoadingButton>
              </div>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );

  function handleSubmit(values: FormValues) {
    upgradeMutation.mutate(values, {
      onSuccess() {
        notifySuccess(
          t('upgradeBE.uploadLicense.startingUpgrade'),
          t('upgradeBE.uploadLicense.licenseValidated')
        );
        goToLoading();
      },
    });
  }
}

function validation(): SchemaOf<FormValues> {
  return object().shape({
    license: string()
      .required('License is required')
      .matches(/^\d-.+/, 'License is invalid'),
  });
}
