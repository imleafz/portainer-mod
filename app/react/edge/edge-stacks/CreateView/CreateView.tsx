import { useTranslation } from 'react-i18next';

import { PageHeader } from '@@/PageHeader';

import { CreateForm } from './CreateForm';

export function CreateView() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t('edge.edgeStack.createEdgeStack')}
        breadcrumbs={[
          { label: t('edge.edgeStack.edgeStacks'), link: 'edge.stacks' },
          t('edge.edgeStack.createEdgeStack'),
        ]}
        reload
      />

      <CreateForm />
    </>
  );
}
