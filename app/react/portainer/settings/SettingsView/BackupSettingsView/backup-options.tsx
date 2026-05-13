import { DownloadCloud } from 'lucide-react';

import { BadgeIcon } from '@@/BadgeIcon';

export const options = [
  {
    id: 'backup_file',
    icon: <BadgeIcon icon={DownloadCloud} />,
    label: 'Download backup file',
    value: 'file',
  },
];
