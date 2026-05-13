import { Formik } from 'formik';
import { Copy } from 'lucide-react';
import { useRouter } from '@uirouter/react';
import { useTranslation } from 'react-i18next';

import { notifyError, notifySuccess } from '@/portainer/services/notifications';
import { Stack } from '@/react/common/stacks/types';

import { Widget } from '@@/Widget';
import { WidgetBody } from '@@/Widget/WidgetBody';
import { WidgetTitle } from '@@/Widget/WidgetTitle';
import { validateForm } from '@@/form-components/validate-form';
import { confirm } from '@@/modals/confirm';
import { ModalType } from '@@/modals';
import { buildConfirmButton } from '@@/modals/utils';

import { FormSubmitValues } from './StackDuplicationForm.types';
import { StackDuplicationFormInner } from './StackDuplicationFormInner';
import {
  getBaseValidationSchema,
  getDuplicateValidationSchema,
  getMigrateValidationSchema,
} from './StackDuplicationForm.validation';
import { useDuplicateStackMutation } from './useDuplicateStackMutation';
import { useMigrateStackMutation } from './useMigrateStackMutation';

interface StackDuplicationFormProps {
  currentEnvironmentId: number;

  yamlError?: string;

  originalFileContent: string;
  stack: Stack;
}

export function StackDuplicationForm({
  yamlError,
  originalFileContent,
  currentEnvironmentId,
  stack,
}: StackDuplicationFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const duplicateMutation = useDuplicateStackMutation();
  const migrateMutation = useMigrateStackMutation();
  const initialValues: FormSubmitValues = {
    environmentId: undefined,
    newName: '',
    actionType: 'migrate', // Default value, will be set by button clicks
  };

  return (
    <Widget>
      <WidgetTitle title={t('docker.stacks.duplicateOrMigrate')} icon={Copy} />
      <WidgetBody>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validateOnMount
          validationSchema={getBaseValidationSchema()}
        >
          <StackDuplicationFormInner
            yamlError={yamlError}
            currentEnvironmentId={currentEnvironmentId}
            currentStackName={stack.Name}
            isLoading={migrateMutation.isLoading || duplicateMutation.isLoading}
          />
        </Formik>
      </WidgetBody>
    </Widget>
  );

  async function handleSubmit(values: FormSubmitValues) {
    const { actionType, environmentId, newName } = values;

    switch (actionType) {
      case 'duplicate':
        await handleDuplicate(environmentId!, newName);
        break;
      case 'migrate':
        await handleMigrate(environmentId!, newName);
        break;
      default:
        break;
    }
  }

  async function handleDuplicate(environmentId: number, name: string) {
    const schema = getDuplicateValidationSchema();
    const errors = await validateForm(() => schema, { environmentId, name });
    if (errors) {
      notifyError(
        t('docker.stacks.validationError'),
        undefined,
        t('docker.stacks.fixErrorsAndTryAgain')
      );
      return;
    }

    duplicateMutation.mutate(
      {
        fileContent: originalFileContent,
        name,
        type: stack.Type,
        env: stack.Env,
        targetEnvironmentId: environmentId,
      },
      {
        onSuccess() {
          notifySuccess(
            t('common.success'),
            t('docker.stacks.stackDuplicatedSuccessfully')
          );
          router.stateService.go('docker.stacks', {}, { reload: true });
        },
        onError(error) {
          notifyError(
            t('common.failure'),
            error as Error,
            t('docker.stacks.unableToDuplicateStack')
          );
        },
      }
    );
  }

  async function handleMigrate(
    environmentId: number,
    name: string | undefined
  ) {
    const isRename = environmentId === currentEnvironmentId;

    const confirmed = await confirm({
      title: t('docker.stacks.confirmMigrateTitle'),
      modalType: ModalType.Warn,
      message: isRename
        ? t('docker.stacks.confirmRenameMessage')
        : t('docker.stacks.confirmMigrateMessage'),
      confirmButton: buildConfirmButton(
        isRename ? t('docker.stacks.rename') : t('docker.stacks.migrate'),
        'danger'
      ),
    });

    if (!confirmed) {
      return;
    }

    const schema = getMigrateValidationSchema(stack.Name, currentEnvironmentId);
    const errors = await validateForm(() => schema, {
      environmentId,
      name,
    });

    if (errors) {
      notifyError(
        t('docker.stacks.validationError'),
        undefined,
        t('docker.stacks.fixErrorsAndTryAgain')
      );
      return;
    }

    migrateMutation.mutate(
      {
        name,
        stackType: stack.Type,
        fromEnvId: currentEnvironmentId,
        id: stack.Id,
        targetEnvId: environmentId,
        fromSwarmId: stack.SwarmId,
      },
      {
        onSuccess() {
          notifySuccess(
            t('common.success'),
            t('docker.stacks.stackMigratedSuccessfully')
          );
          router.stateService.go('docker.stacks', {}, { reload: true });
        },
        onError(error) {
          notifyError(
            t('common.failure'),
            error as Error,
            t('docker.stacks.unableToMigrateStack')
          );
        },
      }
    );
  }
}
