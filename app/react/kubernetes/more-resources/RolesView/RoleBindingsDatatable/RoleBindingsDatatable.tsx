import { Trash2, Link as LinkIcon } from 'lucide-react';
import { useRouter } from '@uirouter/react';
import { Row } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import { useAuthorizations, Authorized } from '@/react/hooks/useUser';
import { notifyError, notifySuccess } from '@/portainer/services/notifications';
import { SystemResourceDescription } from '@/react/kubernetes/datatables/SystemResourceDescription';
import {
  DefaultDatatableSettings,
  TableSettings as KubeTableSettings,
} from '@/react/kubernetes/datatables/DefaultDatatableSettings';
import { CreateFromManifestButton } from '@/react/kubernetes/components/CreateFromManifestButton';
import { useKubeStore } from '@/react/kubernetes/datatables/default-kube-datatable-store';

import { confirmDelete } from '@@/modals/confirm';
import { Datatable, Table, TableSettingsMenu } from '@@/datatables';
import { LoadingButton } from '@@/buttons';
import {
  type FilteredColumnsTableSettings,
  filteredColumnsSettings,
} from '@@/datatables/types';

import { RoleBinding } from './types';
import { columns } from './columns';
import { useRoleBindings } from './queries/useRoleBindings';
import { useDeleteRoleBindingsMutation } from './queries/useDeleteRoleBindingsMutation';

const storageKey = 'roleBindings';
interface TableSettings
  extends KubeTableSettings, FilteredColumnsTableSettings {}

export function RoleBindingsDatatable() {
  const { t } = useTranslation();
  const environmentId = useEnvironmentId();
  const tableState = useKubeStore<TableSettings>(
    storageKey,
    undefined,
    (set) => ({
      ...filteredColumnsSettings(set),
    })
  );
  const roleBindingsQuery = useRoleBindings(environmentId, {
    autoRefreshRate: tableState.autoRefreshRate * 1000,
  });
  const filteredRoleBindings = useMemo(
    () =>
      tableState.showSystemResources
        ? roleBindingsQuery.data
        : roleBindingsQuery.data?.filter((rb) => !rb.isSystem),
    [roleBindingsQuery.data, tableState.showSystemResources]
  );

  const { authorized: isAuthorisedToAddEdit } = useAuthorizations([
    'K8sRoleBindingsW',
  ]);

  return (
    <Datatable
      dataset={filteredRoleBindings || []}
      columns={columns}
      settingsManager={tableState}
      isLoading={roleBindingsQuery.isLoading}
      emptyContentLabel={t('kubernetes.roleBindings.noRoleBindingsFound')}
      title={t('kubernetes.roleBindings.title')}
      titleIcon={LinkIcon}
      getRowId={(row) => row.uid}
      isRowSelectable={(row) => !row.original.isSystem}
      renderTableActions={(selectedRows) => (
        <TableActions selectedItems={selectedRows} />
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
      disableSelect={!isAuthorisedToAddEdit}
      renderRow={renderRow}
      data-cy="k8s-role-bindings-datatable"
    />
  );
}

// needed to apply custom styling to the row and not globally required in the AC's for this ticket.
function renderRow(row: Row<RoleBinding>, highlightedItemId?: string) {
  return (
    <Table.Row<RoleBinding>
      cells={row.getVisibleCells()}
      className={clsx('[&>td]:!py-4 [&>td]:!align-top', {
        active: highlightedItemId === row.id,
      })}
    />
  );
}

interface SelectedRole {
  namespace: string;
  name: string;
}

type TableActionsProps = {
  selectedItems: RoleBinding[];
};

function TableActions({ selectedItems }: TableActionsProps) {
  const { t } = useTranslation();
  const environmentId = useEnvironmentId();
  const deleteRoleBindingsMutation =
    useDeleteRoleBindingsMutation(environmentId);
  const router = useRouter();

  async function handleRemoveClick(roles: SelectedRole[]) {
    const confirmed = await confirmDelete(
      <>
        <p>{t('kubernetes.roleBindings.removeConfirm')}</p>
        <ul className="mt-2 max-h-96 list-inside overflow-hidden overflow-y-auto text-sm">
          {roles.map((r, index) => (
            <li key={index}>
              {r.namespace}/{r.name}
            </li>
          ))}
        </ul>
      </>
    );
    if (!confirmed) {
      return null;
    }

    const payload: Record<string, string[]> = {};
    roles.forEach((r) => {
      payload[r.namespace] = payload[r.namespace] || [];
      payload[r.namespace].push(r.name);
    });

    deleteRoleBindingsMutation.mutate(
      { environmentId, data: payload },
      {
        onSuccess: () => {
          notifySuccess(
            t('kubernetes.roleBindings.successfullyRemoved'),
            roles.map((r) => `${r.namespace}/${r.name}`).join(', ')
          );
          router.stateService.reload();
        },
        onError: (error) => {
          notifyError(
            t('kubernetes.roleBindings.unableToDelete'),
            error as Error,
            roles.map((r) => `${r.namespace}/${r.name}`).join(', ')
          );
        },
      }
    );
    return roles;
  }

  return (
    <Authorized authorizations="K8sRoleBindingsW">
      <LoadingButton
        className="btn-wrapper"
        color="dangerlight"
        disabled={selectedItems.length === 0}
        onClick={() => handleRemoveClick(selectedItems)}
        icon={Trash2}
        isLoading={deleteRoleBindingsMutation.isLoading}
        loadingText={t('kubernetes.roleBindings.removing')}
        data-cy="k8s-role-bindings-remove-button"
      >
        {t('common.delete')}
      </LoadingButton>

      <CreateFromManifestButton
        params={{
          tab: 'roleBindings',
        }}
        data-cy="k8s-role-bindings-deploy-button"
      />
    </Authorized>
  );
}
