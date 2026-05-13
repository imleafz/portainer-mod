import { useTranslation } from 'react-i18next';

import { DeleteButton } from '@@/buttons/DeleteButton';

import { Access } from './types';

export function RemoveAccessButton({
  onClick,
  items,
  isLoading,
}: {
  onClick(items: Array<Access>): void;
  items: Array<Access>;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <DeleteButton
      confirmMessage={t('accessControl.confirmRemove')}
      onConfirmed={() => onClick(items)}
      disabled={items.length === 0}
      data-cy="remove-access-button"
      isLoading={isLoading}
    />
  );
}
