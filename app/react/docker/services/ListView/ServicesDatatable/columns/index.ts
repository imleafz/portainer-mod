import { useMemo } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { ServiceViewModel } from '@/docker/models/service';
import { isoDate } from '@/portainer/filters/filters';
import { createOwnershipColumn } from '@/react/docker/components/datatable/createOwnershipColumn';

import { buildNameColumn } from '@@/datatables/buildNameColumn';
import { buildExpandColumn } from '@@/datatables/expand-column';

import { image } from './image';
import { columnHelper } from './helper';
import { schedulingMode } from './schedulingMode';
import { ports } from './ports';

export function useColumns(isStackColumnVisible?: boolean) {
  const { t } = useTranslation();

  return useMemo(
    () =>
      _.compact([
        buildExpandColumn<ServiceViewModel>(),
        buildNameColumn<ServiceViewModel>(
          'Name',
          'docker.services.service',
          'docker-services-name'
        ),
        isStackColumnVisible &&
          columnHelper.accessor((item) => item.StackName || '-', {
            id: 'stack',
            header: (): string => t('docker.services.stack'),
            enableHiding: false,
          }),
        image,
        schedulingMode,
        ports,
        columnHelper.accessor('UpdatedAt', {
          id: 'lastUpdate',
          header: (): string => t('docker.services.lastUpdate'),
          cell: ({ getValue }) => isoDate(getValue()),
        }),
        createOwnershipColumn<ServiceViewModel>(),
      ]),
    [isStackColumnVisible, t]
  );
}
