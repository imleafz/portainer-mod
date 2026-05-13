import { Form, Formik } from 'formik';
import { SchemaOf, object, string } from 'yup';
import { useTranslation } from 'react-i18next';

import { useAuthorizations } from '@/react/hooks/useUser';
import { useConnectContainerMutation } from '@/react/docker/networks/queries/useConnectContainerMutation';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { notifySuccess } from '@/portainer/services/notifications';

import { FormControl } from '@@/form-components/FormControl';
import { LoadingButton } from '@@/buttons';

import { NetworkSelector } from '../../components/NetworkSelector';

interface FormValues {
  networkId: string;
}

export function ConnectNetworkForm({
  nodeName,
  containerId,
  selectedNetworks,
}: {
  nodeName?: string;
  containerId: string;
  selectedNetworks: string[];
}) {
  const { t } = useTranslation();
  const environmentId = useEnvironmentId();
  const { authorized } = useAuthorizations('DockerNetworkConnect');
  const connectMutation = useConnectContainerMutation(environmentId);
  if (!authorized) {
    return null;
  }

  return (
    <Formik<FormValues>
      initialValues={{ networkId: '' }}
      onSubmit={handleSubmit}
      validationSchema={validation}
    >
      {({ values, errors, setFieldValue }) => (
        <Form className="form-horizontal w-full">
          <FormControl
            label={t('docker.container.joinNetwork')}
            className="!mb-0"
            errors={errors.networkId}
          >
            <div className="flex items-center gap-4">
              <div className="w-full">
                <NetworkSelector
                  value={values.networkId}
                  onChange={(value) => setFieldValue('networkId', value)}
                  hiddenNetworks={selectedNetworks}
                />
              </div>
              <LoadingButton
                loadingText={t('docker.container.joiningNetwork')}
                data-cy="connect-network-button"
                isLoading={connectMutation.isLoading}
              >
                {t('docker.container.joinNetworkButton')}
              </LoadingButton>
            </div>
          </FormControl>
        </Form>
      )}
    </Formik>
  );

  function handleSubmit({ networkId }: { networkId: string }) {
    connectMutation.mutate(
      { containerId, networkId, nodeName },
      {
        onSuccess() {
          notifySuccess('Success', t('docker.container.connectedToNetwork', { networkId }));
        },
      }
    );
  }
}

function validation(): SchemaOf<FormValues> {
  return object({
    networkId: string().required('Please select a network'),
  });
}
