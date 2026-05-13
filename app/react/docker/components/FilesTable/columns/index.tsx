import {
  CellContext,
  ColumnDef,
  ColumnDefTemplate,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { humanize, isoDateFromTimestamp } from '@/portainer/filters/filters';

import { FileData } from '../types';

import { columnHelper } from './helper';
import { NameCell } from './NameCell';
import { ActionsCell } from './ActionsCell';

export const columns = [
  columnHelper.accessor('Name', {
    id: 'name',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t('docker.files.name');
    },
    cell: NameCell,
  }),
  columnHelper.accessor('Size', {
    id: 'size',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t('docker.files.size');
    },
    cell: hideIfCustom(({ getValue }) => humanize(getValue())),
  }),
  columnHelper.accessor('ModTime', {
    id: 'lastModification',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t('docker.files.lastModification');
    },
    cell: hideIfCustom(({ getValue }) => isoDateFromTimestamp(getValue())),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation();
      return t('docker.files.actions');
    },
    cell: hideIfCustom(ActionsCell),
  }),
  columnHelper.accessor('Dir', {}), // workaround, to enable sorting by Dir (put directory first)
] as ColumnDef<FileData>[];

function hideIfCustom<TValue>(
  template: ColumnDefTemplate<CellContext<FileData, TValue>>
): ColumnDefTemplate<CellContext<FileData, TValue>> {
  return (props) => {
    if (props.row.original.custom) {
      return null;
    }
    return typeof template === 'string' ? template : template(props);
  };
}
