import { Check, UserX } from 'lucide-react';
import { useMemo, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import {
  TeamAccessViewModel,
  UserAccessViewModel,
} from '@/portainer/models/access';
import { isBE } from '@/react/portainer/feature-flags/feature-flags.service';

import { Datatable } from '@@/datatables';
import { createPersistedStore } from '@@/datatables/types';
import { useTableState } from '@@/datatables/useTableState';
import { withMeta } from '@@/datatables/extend-options/withMeta';
import { LoadingButton } from '@@/buttons';
import { TextTip } from '@@/Tip/TextTip';
import { mergeOptions } from '@@/datatables/extend-options/mergeOptions';

import { useColumns } from './columns/useColumns';
import { Access } from './types';
import { RemoveAccessButton } from './RemoveAccessButton';

type Props = {
  tableKey: string;
  dataset?: Array<Access>;
  onRemove(items: Array<Access>): void;
  onUpdate(
    users: Array<UserAccessViewModel>,
    teams: Array<TeamAccessViewModel>
  ): void;
  showWarning?: boolean;
  isUpdateEnabled?: boolean;
  showRoles?: boolean;
  inheritFrom?: boolean;
  isUpdatingAccess: boolean;
  isLoading: boolean;
};

export function AccessDatatable({
  dataset,
  tableKey,
  onRemove,
  onUpdate,
  showWarning = false,
  isUpdateEnabled = false,
  showRoles = false,
  inheritFrom = false,
  isUpdatingAccess,
  isLoading,
}: Props) {
  const { t } = useTranslation();
  const columns = useColumns({ showRoles, inheritFrom });
  const [store] = useState(() => createPersistedStore(tableKey));
  const tableState = useTableState(store, tableKey);
  const rolesState = useRolesState();

  return (
    <Datatable
      data-cy="access-datatable"
      title={t('accessControl.title')}
      titleIcon={UserX}
      dataset={dataset || []}
      isLoading={isLoading}
      columns={columns}
      settingsManager={tableState}
      getRowId={(row) => `${row.Type}-${row.Id}`}
      extendTableOptions={mergeOptions(
        withMeta({
          table: 'access-table',
          roles: rolesState,
        })
      )}
      isRowSelectable={({ original: item }) => !inheritFrom || !item.Inherited}
      renderTableActions={(selectedItems) => (
        <>
          <RemoveAccessButton items={selectedItems} onClick={onRemove} />

          {isBE && isUpdateEnabled && (
            <LoadingButton
              data-cy="update-access-button"
              icon={Check}
              disabled={rolesState.count === 0}
              onClick={handleUpdate}
              isLoading={isUpdatingAccess}
              loadingText={t('accessControl.updating')}
            >
              {t('accessControl.update')}
            </LoadingButton>
          )}
        </>
      )}
      description={
        <>
          {inheritFrom && (
            <div className="small text-muted">
              <div
                dangerouslySetInnerHTML={{
                  __html: t('accessControl.inheritDescription'),
                }}
              />
              <div
                dangerouslySetInnerHTML={{
                  __html: t('accessControl.overrideDescription'),
                }}
              />
            </div>
          )}
          {isBE && showWarning && isUpdateEnabled && (
            <TextTip>
              <div className="text-warning-9 th-highcontrast:text-warning-1 th-dark:text-warning-7">
                {t('accessControl.logoutRequired')}
              </div>
            </TextTip>
          )}
        </>
      }
    />
  );

  function handleUpdate() {
    const update = rolesState.getUpdate();
    const teamsAccess = getAccess(update.teams, 'team');
    const usersAccess = getAccess(update.users, 'user');

    onUpdate(usersAccess, teamsAccess);

    function getAccess(
      accesses: Record<number, number | undefined>,
      type: 'team' | 'user'
    ) {
      return _.compact(
        Object.entries(accesses).map(([strId, role]) => {
          if (!strId || !role) {
            return undefined;
          }

          const id = parseInt(strId, 10);
          const entity = dataset?.find(
            (item) => item.Type === type && item.Id === id
          );
          if (!entity) {
            return undefined;
          }

          return {
            ...entity,
            Role: {
              Id: role,
              Name: '',
            },
          };
        })
      );
    }
  }
}

function useRolesState() {
  const [teamRoles, setTeamRoles] = useState<
    Record<number, number | undefined>
  >({});
  const [userRoles, setUserRoles] = useState<
    Record<number, number | undefined>
  >({});

  const count = useMemo(
    () => Object.keys(teamRoles).length + Object.keys(userRoles).length,
    [teamRoles, userRoles]
  );

  return { getRoleValue, setRolesValue, getUpdate, count };

  function getRoleValue(id: number, entity: 'user' | 'team') {
    if (entity === 'team') {
      return teamRoles[id];
    }
    return userRoles[id];
  }

  function setRolesValue(
    id: number,
    entity: 'user' | 'team',
    value: number | undefined
  ) {
    if (entity === 'team') {
      setTeamRoles(updater);

      return;
    }

    setUserRoles(updater);

    function updater(roles: Record<number, number | undefined>) {
      const newRoles = { ...roles };
      if (typeof value === 'undefined') {
        delete newRoles[id];
      } else {
        newRoles[id] = value;
      }
      return newRoles;
    }
  }

  function getUpdate() {
    return {
      users: userRoles,
      teams: teamRoles,
    };
  }
}
