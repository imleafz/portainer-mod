angular.module('portainer.app').factory('BackupService', [
  '$q',
  'Backup',
  'FileUploadService',
  function BackupServiceFactory($q, Backup, FileUploadService) {
    'use strict';
    const service = {};

    service.downloadBackup = function (payload) {
      return Backup.download({}, payload).$promise;
    };

    service.uploadBackup = function (file, password) {
      return FileUploadService.uploadBackup(file, password);
    };

    return service;
  },
]);
