import { useTranslation } from 'react-i18next';

import { Authorized } from '@/react/hooks/useUser';

import { AddButton } from '@@/buttons';
import { DeleteButton } from '@@/buttons/DeleteButton';

import { DecoratedStack } from './types';

export function TableActions({
  selectedItems,
  onRemove,
}: {
  selectedItems: Array<DecoratedStack>;
  onRemove: (items: Array<DecoratedStack>) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <Authorized authorizations="PortainerStackDelete">
        <DeleteButton
          disabled={selectedItems.length === 0}
          onConfirmed={() => onRemove(selectedItems)}
          confirmMessage={t('docker.stacks.removeConfirm')}
          data-cy="stack-removeStackButton"
        />
      </Authorized>

      <Authorized authorizations="PortainerStackCreate">
        <AddButton data-cy="stack-addStackButton" to=".newstack">
          {t('docker.stacks.addStack')}
        </AddButton>
      </Authorized>
    </div>
  );
}
