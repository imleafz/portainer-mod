import { useState } from 'react';

import { PageHeader } from '@@/PageHeader';
import { useTableStateWithoutStorage } from '@@/datatables/useTableState';

import { FilterBar } from '../ActivityLogsView/FilterBar';

import { AuthenticationLogsTable } from './AuthenticationLogsTable';
import { useAuthLogs } from './useAuthLogs';

export function AuthLogsView() {
  const [range, setRange] = useState<
    { start: Date; end: Date | null } | undefined
  >(undefined);
  const [page, setPage] = useState(0);
  const tableState = useTableStateWithoutStorage('Timestamp', true);
  const offset = page * tableState.pageSize;

  const query = {
    offset,
    limit: tableState.pageSize,
    sortBy: tableState.sortBy?.id,
    sortDesc: tableState.sortBy?.desc,
    keyword: tableState.search,
    ...(range
      ? {
          after: seconds(range?.start?.valueOf()),
          before: seconds(range?.end?.valueOf()),
        }
      : undefined),
  };

  const logsQuery = useAuthLogs(query);

  return (
    <>
      <PageHeader
        title="Authentication logs"
        breadcrumbs="Authentication logs"
        reload
      />

      <div className="mx-4">
        <div className="row">
          <div className="col-sm-12">
            <FilterBar value={range} onChange={setRange} onExport={() => {}} />
          </div>
        </div>
        <AuthenticationLogsTable
          sort={tableState.sortBy}
          onChangeSort={(value) =>
            tableState.setSortBy(value?.id, value?.desc || false)
          }
          limit={tableState.pageSize}
          onChangeLimit={tableState.setPageSize}
          keyword={tableState.search}
          onChangeKeyword={tableState.setSearch}
          currentPage={page}
          onChangePage={setPage}
          totalItems={logsQuery.data?.totalCount || 0}
          dataset={logsQuery.data?.logs}
        />
      </div>
    </>
  );
}

function seconds(ms?: number) {
  if (!ms) {
    return undefined;
  }

  return Math.floor(ms / 1000);
}
