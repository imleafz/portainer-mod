import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import { notifySuccess } from '@/portainer/services/notifications';
import { EnvironmentId } from '@/react/portainer/environments/types';
import { Authorized } from '@/react/hooks/useUser';

import { LoadingButton } from '@@/buttons';
import { Input } from '@@/form-components/Input';
import { Select, Option } from '@@/form-components/Input/Select';
import { DetailsTable } from '@@/DetailsTable';
import { DetailsRow } from '@@/DetailsTable/DetailsRow';

import { RestartPolicy } from '../../CreateView/RestartPolicyTab/types';

import { useUpdateRestartPolicyMutation } from './useUpdateRestartPolicyMutation';

interface Props {
  environmentId: EnvironmentId;
  containerId: string;
  nodeName?: string;
  name?: RestartPolicy;
  maximumRetryCount?: number;
  onUpdateSuccess?: (policy: {
    name: RestartPolicy;
    maximumRetryCount?: number;
  }) => void;
}

export function RestartPolicySection({
  environmentId,
  containerId,
  nodeName,
  name = RestartPolicy.No,
  maximumRetryCount = 0,
  onUpdateSuccess,
}: Props) {
  const { t } = useTranslation();
  const updateMutation = useUpdateRestartPolicyMutation();

  const restartPolicyOptions: Array<Option<RestartPolicy>> = [
    { label: t('docker.container.restartPolicyNever'), value: RestartPolicy.No },
    { label: t('docker.container.restartPolicyOnFailure'), value: RestartPolicy.OnFailure },
    { label: t('docker.container.restartPolicyAlways'), value: RestartPolicy.Always },
    { label: t('docker.container.restartPolicyUnlessStopped'), value: RestartPolicy.UnlessStopped },
  ];

  return (
    <Formik
      initialValues={{ name, maximumRetryCount }}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, isValid, dirty, setFieldValue }) => (
        <Form>
          <DetailsTable
            dataCy="container-restart-policy-table"
            className="table-bordered table-condensed !m-0"
          >
            <Authorized authorizations="DockerContainerUpdate">
              <DetailsRow
                label={t('docker.container.restartPolicyName')}
                columns={[
                  <LoadingButton
                    key="update-button"
                    type="submit"
                    disabled={!isValid || !dirty}
                    isLoading={updateMutation.isLoading}
                    data-cy="container-restart-policy-update-button"
                    loadingText={t('docker.container.updating')}
                  >
                    {t('docker.container.update')}
                  </LoadingButton>,
                ]}
              >
                <Select
                  options={restartPolicyOptions}
                  value={values.name}
                  onChange={(e) => setFieldValue('name', e.target.value)}
                  data-cy="container-restart-policy-select"
                />
              </DetailsRow>
            </Authorized>
            {values.name === RestartPolicy.OnFailure && (
              <DetailsRow label={t('docker.container.maximumRetryCount')}>
                <Input
                  type="number"
                  value={values.maximumRetryCount}
                  onChange={(e) =>
                    setFieldValue('maximumRetryCount', e.target.valueAsNumber)
                  }
                  data-cy="container-restart-max-retry-input"
                  min={0}
                />
              </DetailsRow>
            )}
          </DetailsTable>
        </Form>
      )}
    </Formik>
  );

  function handleSubmit(values: {
    name: RestartPolicy;
    maximumRetryCount: number;
  }) {
    updateMutation.mutate(
      {
        environmentId,
        containerId,
        nodeName,
        policy: values,
      },
      {
        onSuccess: () => {
          notifySuccess('Success', t('docker.container.restartPolicyUpdated'));

          onUpdateSuccess?.(values);
        },
      }
    );
  }
}
