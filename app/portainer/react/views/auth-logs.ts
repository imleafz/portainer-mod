import angular from 'angular';

import { r2a } from '@/react-tools/react2angular';
import { withUIRouter } from '@/react-tools/withUIRouter';
import { withCurrentUser } from '@/react-tools/withCurrentUser';
import { AuthLogsView } from '@/react/portainer/logs/AuthenticationLogsView/AuthLogsView';

export const authLogsModule = angular
  .module('portainer.app.react.views.auth-logs', [])
  .component(
    'reactAuthLogsView',
    r2a(withUIRouter(withCurrentUser(AuthLogsView)), [])
  ).name;
