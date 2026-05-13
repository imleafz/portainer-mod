import { createColumnHelper } from '@tanstack/react-table';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EventMessage } from 'docker-types';

import { isoDateFromTimestamp } from '@/portainer/filters/filters';

import { Datatable } from '@@/datatables';
import { createPersistedStore } from '@@/datatables/types';
import { useTableState } from '@@/datatables/useTableState';

import { createEventDetails } from './model';

const columnHelper = createColumnHelper<EventMessage>();

const tableKey = 'docker-events';
const settingsStore = createPersistedStore(tableKey, {
  id: 'Time',
  desc: true,
});

export function EventsDatatable({
  dataset,
}: {
  dataset?: Array<EventMessage>;
}) {
  const { t } = useTranslation();
  const tableState = useTableState(settingsStore, tableKey);

  const columns = [
    columnHelper.accessor('time', {
      header: () => t('docker.events.date'),
      cell: ({ getValue }) => {
        const value = getValue();
        return isoDateFromTimestamp(value);
      },
    }),
    columnHelper.accessor('Type', {
      id: 'type',
      header: () => t('docker.events.type'),
    }),
    columnHelper.accessor((item) => createEventDetails(item), {
      id: 'details',
      header: () => t('docker.events.details'),
    }),
  ];

  return (
    <Datatable
      dataset={dataset ?? []}
      isLoading={!dataset}
      columns={columns}
      settingsManager={tableState}
      title={t('docker.events.title')}
      titleIcon={Clock}
      disableSelect
      data-cy="docker-events-datatable"
    />
  );
}
