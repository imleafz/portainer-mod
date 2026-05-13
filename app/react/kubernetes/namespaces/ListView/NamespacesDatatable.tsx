import { Layers } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Authorized, useAuthorizations } from '@/react/hooks/useUser';
import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { pluralize } from '@/portainer/helpers/strings';
import { notifyError, notifySuccess } from '@/portainer/services/notifications';

import { DeleteButton } from '@@/buttons/DeleteButton';
import { refreshableSettings } from '@@/datatables/types';
import { Datatable, TableSettingsMenu } from '@@/datatables';
import { useTableStateWithStorage } from '@@/datatables/useTableState';
import { AddButton } from '@@/buttons';

import { systemResourcesSettings } from '../../datatables/SystemResourcesSettings';
import { CreateFromManifestButton } from '../../components/CreateFromManifestButton';
import {
  DefaultDatatableSettings,
  TableSettings,
} from '../../datatables/DefaultDatatableSettings';
import { SystemResourceDescription } from '../../datatables/SystemResourceDescription';
import { isDefaultNamespace } from '../isDefaultNamespace';
import { useNamespacesQuery } from '../queries/useNamespacesQuery';
import { PortainerNamespace } from '../types';
import { useDeleteNamespaces } from '../queries/useDeleteNamespaces';
import { queryKeys } from '../queries/queryKeys';

import { useColumns } from './columns/useColumns';

export function NamespacesDatatable() {
  const { t } = useTranslation();
  const environmentId = useEnvironmentId();

  const tableState = useTableStateWithStorage<TableSettings>(
    'kube-namespaces',
    'Name',
    (set) => ({
      ...systemResourcesSettings(set),
      ...refreshableSettings(set),
    })
  );
  const namespacesQuery = useNamespacesQuery(environmentId, {
    autoRefreshRate: tableState.autoRefreshRate * 1000,
    withResourceQuota: true,
    withUnhealthyEvents: true,
  });
  const namespaces = Object.values(namespacesQuery.data ?? []);

  const hasWriteAuthQuery = useAuthorizations(
    'K8sResourcePoolDetailsW',
    undefined,
    true
  );
  const columns = useColumns();

  const filteredDataset = tableState.showSystemResources
    ? namespaces
    : namespaces.filter((namespace) => !namespace.IsSystem);

  return (
    <Datatable<PortainerNamespace>
      data-cy="k8sNamespace-namespaceTable"
      dataset={filteredDataset}
      columns={columns}
      settingsManager={tableState}
      isLoading={namespacesQuery.isLoading}
      title={t('kubernetes.namespace.namespaces')}
      titleIcon={Layers}
      getRowId={(item) => item.Id}
      disableSelect={!hasWriteAuthQuery.authorized}
      isRowSelectable={({ original: item }) =>
        !item.IsSystem && !isDefaultNamespace(item.Name)
      }
      renderTableActions={(selectedItems) => (
        <TableActions
          selectedItems={selectedItems}
          namespaces={namespacesQuery.data}
        />
      )}
      renderTableSettings={() => (
        <TableSettingsMenu>
          <DefaultDatatableSettings settings={tableState} />
        </TableSettingsMenu>
      )}
      description={
        <SystemResourceDescription
          showSystemResources={tableState.showSystemResources}
        />
      }
    />
  );
}

function TableActions({
  selectedItems,
  namespaces,
}: {
  selectedItems: PortainerNamespace[];
  namespaces?: PortainerNamespace[];
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const environmentId = useEnvironmentId();
  const deleteNamespacesMutation = useDeleteNamespaces(environmentId);

  const selectedNamespacePlural = pluralize(selectedItems.length, 'namespace');
  const includesTerminatingNamespace = selectedItems.some(
    (ns) => ns.Status.phase === 'Terminating'
  );
  const message = includesTerminatingNamespace
    ? t('kubernetes.namespace.removeConfirmTerminating')
    : t('kubernetes.namespace.removeConfirm', {
        item: selectedNamespacePlural,
      });

  return (
    <Authorized authorizations="K8sResourcePoolDetailsW" adminOnlyCE>
      <DeleteButton
        onConfirmed={() => onRemoveNamespaces(selectedItems)}
        disabled={selectedItems.length === 0}
        data-cy="delete-namespace-button"
        confirmMessage={message}
      />

      <AddButton color="secondary" data-cy="add-namespace-form-button">
        {t('kubernetes.namespace.addWithForm')}
      </AddButton>

      <CreateFromManifestButton data-cy="k8s-namespaces-deploy-button" />
    </Authorized>
  );

  function onRemoveNamespaces(selectedNamespaces: Array<PortainerNamespace>) {
    deleteNamespacesMutation.mutate(
      {
        namespaceNames: selectedNamespaces.map((namespace) => namespace.Name),
      },
      {
        onSuccess: (resp) => {
          // gather errors and deleted namespaces
          const errors = resp.data?.errors || [];
          const erroredNamespacePlural = pluralize(errors.length, 'namespace');

          const selectedNamespaceNames = selectedNamespaces.map(
            (ns) => ns.Name
          );
          const deletedNamespaces =
            resp.data?.deleted || selectedNamespaceNames;
          const deletedNamespacePlural = pluralize(
            deletedNamespaces.length,
            'namespace'
          );

          // notify user of success and errors
          if (errors.length > 0) {
            notifyError(
              t('errors.error'),
              new Error(
                t('kubernetes.namespace.failedToDelete', {
                  item: erroredNamespacePlural,
                  errors: errors
                    .map((err) => `${err.namespaceName}: ${err.error}`)
                    .join(', '),
                })
              )
            );
          }
          if (deletedNamespaces.length > 0) {
            notifySuccess(
              t('success.success'),
              t('kubernetes.namespace.successfullyDeleted', {
                item: deletedNamespacePlural,
                names: deletedNamespaces.join(', '),
              })
            );
          }

          // Plain invalidation / refetching is confusing because namespaces hang in a terminating state
          // instead, optimistically update the cache manually to hide the deleting (terminating) namespaces
          const remainingNamespaces = deletedNamespaces.reduce(
            (acc, ns) => {
              const index = acc.findIndex((n) => n.Name === ns);
              if (index !== -1) {
                acc.splice(index, 1);
              }
              return acc;
            },
            [...(namespaces ?? [])]
          );
          queryClient.setQueryData(
            queryKeys.list(environmentId, {
              withResourceQuota: true,
              withUnhealthyEvents: true,
            }),
            () => remainingNamespaces
          );
        },
      }
    );
  }
}
