import { useTranslation } from 'react-i18next';

import { FormControl } from '@@/form-components/FormControl';
import { CodeEditor } from '@@/CodeEditor';
import { ShortcutsTooltip } from '@@/CodeEditor/ShortcutsTooltip';

type Props = {
  values: string;
  setValues: (values: string) => void;
  valuesRef: string;
  isValuesRefLoading: boolean;
};

export function HelmValuesInput({
  values,
  setValues,
  valuesRef,
  isValuesRefLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormControl
        label={t('helm.userDefinedValues')}
        inputId="user-values-editor"
        size="vertical"
        className="[&>label]:!mb-1 !mx-0"
        tooltip={
          <>
            {t('helm.userDefinedValuesOverride')}
            <br />
            {t('helm.moreInfoAboutValues')}{' '}
            <a
              href="https://helm.sh/docs/chart_template_guide/values_files/"
              target="_blank"
              data-cy="helm-values-reference-link"
              rel="noreferrer"
            >
              {t('helm.officialDocumentation')}
            </a>
            .
          </>
        }
      >
        <CodeEditor
          id="user-values-editor"
          value={values}
          onChange={setValues}
          height="50vh"
          type="yaml"
          data-cy="helm-user-values-editor"
          placeholder={t('helm.valuesPlaceholder')}
          showToolbar={false}
        />
      </FormControl>
      <FormControl
        label={
          <div className="flex justify-between w-full">
            {t('helm.valuesReference')}
            <ShortcutsTooltip />
          </div>
        }
        inputId="values-reference"
        size="vertical"
        isLoading={isValuesRefLoading}
        loadingText={t('common.loadingValues')}
        className="[&>label]:w-full [&>label]:!mb-1 !mx-0"
      >
        <CodeEditor
          id="values-reference"
          value={valuesRef}
          height="50vh"
          type="yaml"
          readonly
          data-cy="helm-values-reference"
          placeholder={t('helm.noValuesReference')}
          showToolbar={false}
        />
      </FormControl>
    </div>
  );
}
