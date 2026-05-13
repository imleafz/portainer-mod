import { History } from 'lucide-react';

import { Datatable } from '@@/datatables';

import { AuthLog } from './types';
import { columns } from './columns';

export function AuthenticationLogsTable({
  dataset,
  currentPage,
  keyword,
  limit,
  onChangeKeyword,
  onChangeLimit,
  onChangePage,
  onChangeSort,
  sort,
  totalItems,
}: {
  keyword: string;
  onChangeKeyword(keyword: string): void;
  sort: { id: string; desc: boolean } | undefined;
  onChangeSort(sort: { id: string; desc: boolean } | undefined): void;
  limit: number;
  onChangeLimit(limit: number): void;
  currentPage: number;
  onChangePage(page: number): void;
  totalItems: number;
  dataset?: Array<AuthLog>;
}) {
  return (
    <Datatable<AuthLog>
      title="Authentication events"
      titleIcon={History}
      columns={columns}
      dataset={dataset || []}
      isLoading={!dataset}
      settingsManager={{
        pageSize: limit,
        search: keyword,
        setPageSize: onChangeLimit,
        setSearch: onChangeKeyword,
        setSortBy: (id, desc) => onChangeSort({ id: id || 'timestamp', desc }),
        sortBy: sort
          ? {
              id: sort.id,
              desc: sort.desc,
            }
          : undefined,
      }}
      page={currentPage}
      onPageChange={onChangePage}
      isServerSidePagination
      totalCount={totalItems}
      disableSelect
      data-cy="authentication-logs-datatable"
    />
  );
}
