import { useTranslation } from 'react-i18next';

import { DetailsTable } from '@@/DetailsTable';

interface LabelsRowProps {
  labels?: Record<string, string>;
}

export function LabelsRow({ labels }: LabelsRowProps) {
  const { t } = useTranslation();
  if (!labels || Object.keys(labels).length === 0) {
    return null;
  }

  return (
    <DetailsTable.Row label={t('docker.container.labels')}>
      <table className="table table-bordered table-condensed !m-0">
        <tbody>
          {Object.entries(labels).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DetailsTable.Row>
  );
}
