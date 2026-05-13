import {
  ArrowRightIcon,
  PlayIcon,
  PlusIcon,
  StopCircleIcon,
  Trash2Icon,
} from 'lucide-react';
import { useRouter } from '@uirouter/react';
import { useTranslation } from 'react-i18next';

import { Authorized } from '@/react/hooks/useUser';
import { Stack, StackStatus } from '@/react/common/stacks/types';
import { useDeleteStackMutation } from '@/react/common/stacks/queries/useDeleteStackMutation';
import { notifyError, notifySuccess } from '@/portainer/services/notifications';

import { Button, LoadingButton } from '@@/buttons';
import { Link } from '@@/Link';
import { confirm, confirmDelete } from '@@/modals/confirm';
import { ModalType } from '@@/modals/Modal/types';
import { buildConfirmButton } from '@@/modals/utils';

import { useUpdateStackMutation } from '../../useUpdateStack';

import { useStartStackMutation } from './useStartStackMutation';
import { useStopStackMutation } from './useStopStackMutation';

export function StackActions({
  stack,
  fileContent,
  isRegular,
  environmentId,
  isExternal,
  status,
}: {
  stack: Stack;
  fileContent?: string;
  isRegular?: boolean;
  environmentId: number;
  isExternal: boolean;
  status: Stack['Status'];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const startStackMutation = useStartStackMutation();
  const stopStackMutation = useStopStackMutation();
  const deleteStackMutation = useDeleteStackMutation();
  const detachFromGitMutation = useUpdateStackMutation();

  const isMutating =
    startStackMutation.isLoading ||
    stopStackMutation.isLoading ||
    deleteStackMutation.isLoading ||
    detachFromGitMutation.isLoading;

  const stackId = stack.Id;

  return (
    <div className="flex items-center gap-2">
      {isRegular && (
        <Authorized authorizations="PortainerStackUpdate">
          {status === StackStatus.Active ? (
            <Button
              icon={StopCircleIcon}
              color="dangerlight"
              size="xsmall"
              onClick={() => handleStop()}
              disabled={isMutating}
              data-cy="stack-stop-btn"
            >
              {t('docker.stack.stopThisStack')}
            </Button>
          ) : (
            <Button
              icon={PlayIcon}
              color="success"
              data-cy="stack-start-btn"
              size="xsmall"
              disabled={isMutating}
              onClick={() =>
                startStackMutation.mutate(
                  { id: stackId, environmentId },
                  {
                    onError(err) {
                      notifyError(
                        t('docker.stack.failure'),
                        err as Error,
                        t('docker.stack.unableToStartStack')
                      );
                    },
                    onSuccess() {
                      notifySuccess(
                        t('docker.stack.success'),
                        t('docker.stack.stackStartedSuccessfully', {
                          name: stack.Name,
                        })
                      );
                      router.stateService.reload();
                    },
                  }
                )
              }
            >
              {t('docker.stack.startThisStack')}
            </Button>
          )}
        </Authorized>
      )}

      <Authorized authorizations="PortainerStackDelete">
        <Button
          icon={Trash2Icon}
          color="dangerlight"
          size="xsmall"
          onClick={() => handleDelete()}
          disabled={isMutating}
          data-cy="stack-delete-btn"
        >
          {t('docker.stack.deleteThisStack')}
        </Button>
      </Authorized>

      {!!(isRegular && fileContent) && (
        <Button
          as={Link}
          icon={PlusIcon}
          color="primary"
          size="xsmall"
          data-cy="stack-create-template-btn"
          props={{
            to: 'docker.templates.custom.new',
            params: {
              fileContent,
              type: stack.Type,
            },
          }}
        >
          {t('docker.stack.createTemplateFromStack')}
        </Button>
      )}

      {!!(
        isRegular &&
        fileContent &&
        !stack.FromAppTemplate &&
        stack.GitConfig
      ) && (
        <Authorized authorizations="PortainerStackUpdate">
          <LoadingButton
            icon={ArrowRightIcon}
            color="primary"
            size="xsmall"
            onClick={() => handleDetachFromGit()}
            disabled={isMutating}
            data-cy="stack-detach-git-btn"
            isLoading={detachFromGitMutation.isLoading}
            loadingText={t('docker.stack.detachInProgress')}
          >
            {t('docker.stack.detachFromGit')}
          </LoadingButton>
        </Authorized>
      )}
    </div>
  );

  async function handleStop() {
    const confirmed = await confirm({
      title: t('docker.stack.areYouSure'),
      modalType: ModalType.Warn,
      message: t('docker.stack.areYouSureStopStack'),
      confirmButton: buildConfirmButton(t('docker.stack.stop'), 'danger'),
    });

    if (!confirmed) {
      return;
    }

    stopStackMutation.mutate(
      { id: stackId, environmentId },
      {
        onError(err) {
          notifyError(
            t('docker.stack.failure'),
            err as Error,
            t('docker.stack.unableToStopStack')
          );
        },
        onSuccess() {
          notifySuccess(
            t('docker.stack.success'),
            t('docker.stack.stackStoppedSuccessfully', { name: stack.Name })
          );
          router.stateService.reload();
        },
      }
    );
  }

  async function handleDelete() {
    const confirmed = await confirmDelete(
      t('docker.stack.areYouSureDeleteStack')
    );
    if (!confirmed) {
      return;
    }
    deleteStackMutation.mutate(
      {
        id: stack.Id,
        name: stack.Name,
        environmentId: stack.EndpointId,
        external: isExternal,
      },
      {
        onError(err) {
          notifyError(
            t('docker.stack.failure'),
            err as Error,
            t('docker.stack.unableToRemoveStack', { name: stack.Name })
          );
        },
        onSuccess() {
          notifySuccess(t('docker.stack.stackRemovedSuccessfully'), stack.Name);
          router.stateService.go('^');
        },
      }
    );
  }

  async function handleDetachFromGit() {
    const confirmed = await confirm({
      modalType: ModalType.Warn,
      title: t('docker.stack.areYouSure'),
      message: t('docker.stack.areYouSureDetachGit'),
      confirmButton: buildConfirmButton(t('docker.stack.detach'), 'danger'),
    });

    if (!confirmed) {
      return;
    }

    detachFromGitMutation.mutate(
      {
        environmentId,
        stackId: stack.Id,
        payload: {
          stackFileContent: fileContent!,
          env: stack.Env,
          prune: false,
        },
      },
      {
        onSuccess() {
          router.stateService.go('^');
        },
      }
    );
  }
}
