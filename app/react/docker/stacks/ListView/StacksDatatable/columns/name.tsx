import { useTranslation } from 'react-i18next';
import { CellContext, Column } from '@tanstack/react-table';

import { useIsEdgeAdmin } from '@/react/hooks/useUser';
import { getValueAsArrayOfStrings } from '@/portainer/helpers/array';
import { StackStatus } from '@/react/common/stacks/types';
import {
  isExternalStack,
  isOrphanedStack,
  isRegularStack,
} from '@/react/docker/stacks/view-models/utils';

import { Link } from '@@/Link';
import { MultipleSelectionFilter } from '@@/datatables/Filter';

import { DecoratedStack } from '../types';

import { columnHelper } from './helper';

export const name = columnHelper.accessor('Name', {
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.stacks.name');
  },
  id: 'name',
  cell: NameCell,
  enableHiding: false,
  enableColumnFilter: true,
  filterFn: ({ original: stack }, columnId, filterValue: Array<string>) => {
    if (filterValue.length === 0) {
      return true;
    }

    if (isExternalStack(stack) || !stack.Status) {
      return true;
    }

    const activeLabel = 'Active Stacks';
    const inactiveLabel = 'Inactive Stacks';

    return (
      (stack.Status === StackStatus.Active &&
        filterValue.includes(activeLabel)) ||
      (stack.Status === StackStatus.Inactive &&
        filterValue.includes(inactiveLabel))
    );
  },
  meta: {
    filter: Filter,
  },
});

function NameCell({
  row: { original: item },
}: CellContext<DecoratedStack, string>) {
  const { t } = useTranslation();
  return (
    <>
      <NameLink item={item} />
      {isRegularStack(item) && item.Status === 2 && (
        <span className="label label-warning image-tag space-left ml-2">
          {t('docker.stacks.inactive')}
        </span>
      )}
    </>
  );
}

function NameLink({ item }: { item: DecoratedStack }) {
  const isAdminQuery = useIsEdgeAdmin();

  const name = item.Name;

  if (isExternalStack(item)) {
    return (
      <Link
        to="docker.stacks.stack"
        params={{
          name: item.Name,
          type: item.Type,
          external: true,
        }}
        title={name}
        data-cy="docker-external-stack-link"
      >
        {name}
      </Link>
    );
  }

  if (!isAdminQuery.isAdmin && isOrphanedStack(item)) {
    return <>{name}</>;
  }

  return (
    <Link
      to="docker.stacks.stack"
      params={{
        name: item.Name,
        id: item.Id,
        type: item.Type,
        regular: item.Regular,
        orphaned: item.Orphaned,
        orphanedRunning: item.OrphanedRunning,
      }}
      title={name}
      data-cy={`docker-stack-link-${item.Name}`}
    >
      {name}
    </Link>
  );
}

function Filter<TData extends { Used: boolean }>({
  column: { getFilterValue, setFilterValue, id },
}: {
  column: Column<TData>;
}) {
  const value = getFilterValue();

  const valueAsArray = getValueAsArrayOfStrings(value);

  return (
    <FilterContent
      filterKey={id}
      value={valueAsArray}
      setFilterValue={setFilterValue}
    />
  );
}

function FilterContent({
  filterKey,
  value,
  setFilterValue,
}: {
  filterKey: string;
  value: string[];
  setFilterValue: (value: string[] | null) => void;
}) {
  const { t } = useTranslation();

  const filterOptions = [
    t('docker.stacks.activeStacks'),
    t('docker.stacks.inactiveStacks'),
  ];

  return (
    <MultipleSelectionFilter
      options={filterOptions}
      filterKey={filterKey}
      value={value}
      onChange={setFilterValue}
      menuTitle={t('docker.stacks.filterByActivity')}
    />
  );
}
