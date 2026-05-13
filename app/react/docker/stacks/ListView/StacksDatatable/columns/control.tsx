import { useTranslation } from 'react-i18next';
import { CellContext } from '@tanstack/react-table';
import { AlertCircle } from 'lucide-react';
import { PropsWithChildren } from 'react';

import {
  isExternalStack,
  isOrphanedStack,
  isRegularStack,
} from '@/react/docker/stacks/view-models/utils';

import { TooltipWithChildren } from '@@/Tip/TooltipWithChildren';
import { Icon } from '@@/Icon';

import { DecoratedStack } from '../types';

import { columnHelper } from './helper';

export const control = columnHelper.display({
  header: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation();
    return t('docker.stacks.control');
  },
  id: 'control',
  cell: ControlCell,
  enableHiding: false,
});

function ControlCell({
  row: { original: item },
}: CellContext<DecoratedStack, unknown>) {
  const { t } = useTranslation();

  if (isRegularStack(item)) {
    return <>{t('docker.stack.total')}</>;
  }

  if (isExternalStack(item)) {
    return (
      <Warning tooltip={t('docker.stack.externalStackLimited')}>
        {t('docker.stack.limited')}
      </Warning>
    );
  }

  if (isOrphanedStack(item)) {
    return (
      <Warning tooltip={t('docker.stack.orphanedStackTooltip')}>
        {t('docker.stack.orphaned')}
      </Warning>
    );
  }

  return null;
}

function Warning({
  tooltip,
  children,
}: PropsWithChildren<{ tooltip: string }>) {
  return (
    <TooltipWithChildren message={tooltip}>
      <span className="flex items-center gap-2">
        {children}
        <Icon icon={AlertCircle} mode="warning" />
      </span>
    </TooltipWithChildren>
  );
}
