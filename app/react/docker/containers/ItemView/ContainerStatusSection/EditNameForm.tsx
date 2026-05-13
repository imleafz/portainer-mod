import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { Form, Formik } from 'formik';
import * as yup from 'yup';

import { EnvironmentId } from '@/react/portainer/environments/types';
import { trimContainerName } from '@/docker/filters/utils';
import { notifySuccess } from '@/portainer/services/notifications';

import { Button } from '@@/buttons';
import { Icon } from '@@/Icon';

import { ContainerId } from '../../types';
import { useRenameContainer } from '../../queries/useRenameContainer';

interface FormValues {
  name: string;
}

const validationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('container.nameRequired')
    .min(1, 'container.nameEmpty'),
});

export function EditNameForm({
  name,
  onCancel,
  containerId,
  environmentId,
  nodeName,
  onSuccess,
}: {
  name: string;
  onCancel(): void;
  onSuccess(): void;
  containerId: ContainerId;
  environmentId: EnvironmentId;
  nodeName: string | undefined;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const renameMutation = useRenameContainer();

  const initialValues: FormValues = {
    name: trimContainerName(name),
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ values, handleChange, isSubmitting }) => (
        <Form className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            name="name"
            className="form-control form-control-sm containerNameInput"
            value={values.name}
            onChange={handleChange}
            data-cy="containerNameInput"
            aria-label={t('docker.container.containerName')}
          />
          <Button
            size="xsmall"
            color="none"
            className="!p-0 hover:no-underline"
            onClick={() => onCancel()}
            type="button"
            data-cy="container-cancel-rename-button"
            title={t('common.cancel')}
            aria-label={t('docker.container.cancelContainerNameEdit')}
          >
            <Icon icon={X} className="lucide" />
          </Button>
          <Button
            size="xsmall"
            color="none"
            className="!p-0 hover:no-underline"
            type="submit"
            data-cy="container-confirm-rename-button"
            disabled={isSubmitting}
            title={t('docker.container.rename')}
            aria-label={t('docker.container.renameContainer')}
          >
            <Icon icon={Check} className="lucide" />
          </Button>
        </Form>
      )}
    </Formik>
  );

  function handleSubmit(values: FormValues) {
    if (values.name === trimContainerName(name)) {
      onCancel();
      return;
    }

    renameMutation.mutate(
      {
        containerId,
        environmentId,
        name: values.name,
        nodeName,
      },
      {
        onSuccess(_, variables) {
          notifySuccess(
            t('docker.container.success'),
            t('docker.container.renamedSuccessfully', { name: variables.name })
          );
          onSuccess();
        },
      }
    );
  }
}
