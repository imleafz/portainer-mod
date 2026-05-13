angular.module('portainer.app').factory('Backup', [
  '$resource',
  'API_ENDPOINT_BACKUP',
  function BackupFactory($resource, API_ENDPOINT_BACKUP) {
    'use strict';
    return $resource(
      API_ENDPOINT_BACKUP + '/:subResource/:action',
      {},
      {
        download: {
          method: 'POST',
          responseType: 'arraybuffer',
          ignoreLoadingBar: true,
          transformResponse: (data, headersGetter, status) => {
            if (status !== 200) {
              const decoder = new TextDecoder('utf-8');
              const str = decoder.decode(data);
              return JSON.parse(str);
            }

            return {
              file: data,
              name: headersGetter('Content-Disposition').replace('attachment; filename=', ''),
            };
          },
        },
      }
    );
  },
]);
