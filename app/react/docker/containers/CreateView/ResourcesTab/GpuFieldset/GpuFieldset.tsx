import { useMemo } from 'react';
import { components, MultiValue } from 'react-select';
import { MultiValueRemoveProps } from 'react-select/dist/declarations/src/components/MultiValue';
import {
  ActionMeta,
  OnChangeValue,
} from 'react-select/dist/declarations/src/types';
import { OptionProps } from 'react-select/dist/declarations/src/components/Option';
import { useTranslation } from 'react-i18next';

import { Select } from '@@/form-components/ReactSelect';
import { Switch } from '@@/form-components/SwitchField/Switch';
import { Tooltip } from '@@/Tip/Tooltip';
import { TextTip } from '@@/Tip/TextTip';

import { Values } from './types';

interface GpuOption {
  value: string;
  label: string;
  description?: string;
}

interface GPU {
  value: string;
  name: string;
}

export interface Props {
  values: Values;
  onChange(values: Values): void;
  gpus: GPU[];
  usedGpus: string[];
  usedAllGpus: boolean;
  enableGpuManagement?: boolean;
}

const NvidiaCapabilitiesOptions = [
  {
    value: 'compute',
    label: 'compute',
    description: 'required for CUDA and OpenCL applications',
  },
  {
    value: 'compat32',
    label: 'compat32',
    description: 'required for running 32-bit applications',
  },
  {
    value: 'graphics',
    label: 'graphics',
    description: 'required for running OpenGL and Vulkan applications',
  },
  {
    value: 'utility',
    label: 'utility',
    description: 'required for using nvidia-smi and NVML',
  },
  {
    value: 'video',
    label: 'video',
    description: 'required for using the Video Codec SDK',
  },
  {
    value: 'display',
    label: 'display',
    description: 'required for leveraging X11 display',
  },
];

export function GpuFieldset({
  values,
  onChange,
  gpus = [],
  usedGpus = [],
  usedAllGpus,
  enableGpuManagement,
}: Props) {
  const { t } = useTranslation();

  const options = useMemo(() => {
    const options = (gpus || []).map((gpu) => ({
      value: gpu.value,
      label:
        usedGpus.includes(gpu.value) || usedAllGpus
          ? `${gpu.name} (${t('docker.container.inUse')})`
          : gpu.name,
    }));

    options.unshift({
      value: 'all',
      label: t('docker.container.useAllGpus'),
    });

    return options;
  }, [gpus, usedGpus, usedAllGpus, t]);

  const gpuCmd = useMemo(() => {
    const devices = values.selectedGPUs.join(',');
    const deviceStr = devices === 'all' ? 'all,' : `device=${devices},`;
    const caps = values.capabilities.join(',');
    return `--gpus '${deviceStr}"capabilities=${caps}"'`;
  }, [values.selectedGPUs, values.capabilities]);

  const gpuValue = useMemo(
    () =>
      options.filter((option) => values.selectedGPUs.includes(option.value)),
    [values.selectedGPUs, options]
  );

  const capValue = useMemo(
    () =>
      NvidiaCapabilitiesOptions.filter((option) =>
        values.capabilities.includes(option.value)
      ),
    [values.capabilities]
  );

  return (
    <div>
      <TextTip inline={false} color="blue">
        <p>{t('docker.container.gpuSupportLimited')}</p>
      </TextTip>

      {!enableGpuManagement && (
        <TextTip color="blue">{t('docker.container.gpuNotEnabled')}</TextTip>
      )}

      <div className="form-group">
        <div className="col-sm-3 col-lg-2 control-label text-left">
          {t('docker.container.enableGpu')}
          <Switch
            id="enabled"
            name="enabled"
            checked={values.enabled && !!enableGpuManagement}
            onChange={toggleEnableGpu}
            className="ml-2"
            disabled={!enableGpuManagement}
            data-cy="docker-containers-gpu-enabled-switch"
          />
        </div>
        {enableGpuManagement && values.enabled && (
          <div className="col-sm-9 col-lg-10 text-left">
            <Select<GpuOption, true>
              isMulti
              closeMenuOnSelect
              value={gpuValue}
              isClearable={false}
              backspaceRemovesValue={false}
              isDisabled={!values.enabled}
              onChange={onChangeSelectedGpus}
              options={options}
              components={{ MultiValueRemove }}
              data-cy="docker-containers-gpu-select"
              id="docker-containers-gpu-select"
            />
          </div>
        )}
      </div>

      {values.enabled && (
        <>
          <div className="form-group">
            <div className="col-sm-3 col-lg-2 control-label text-left">
              {t('docker.container.capabilities')}
              <Tooltip message={t('docker.container.gpuCapabilitiesTooltip')} />
            </div>
            <div className="col-sm-9 col-lg-10 text-left">
              <Select<GpuOption, true>
                isMulti
                closeMenuOnSelect
                value={capValue}
                options={NvidiaCapabilitiesOptions}
                components={{ Option }}
                onChange={onChangeSelectedCaps}
                data-cy="docker-containers-gpu-capabilities-select"
                id="docker-containers-gpu-capabilities-select"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="col-sm-3 col-lg-2 control-label text-left">
              {t('docker.container.control')}
              <Tooltip message={t('docker.container.gpuGeneratedTooltip')} />
            </div>
            <div className="col-sm-9 col-lg-10">
              <code>{gpuCmd}</code>
            </div>
          </div>
        </>
      )}
    </div>
  );

  function onChangeValues(key: string, newValue: boolean | string[]) {
    const newValues = {
      ...values,
      [key]: newValue,
    };
    onChange(newValues);
  }

  function toggleEnableGpu() {
    onChangeValues('enabled', !values.enabled);
  }

  function onChangeSelectedGpus(
    newValue: OnChangeValue<GpuOption, true>,
    actionMeta: ActionMeta<GpuOption>
  ) {
    let { useSpecific } = values;
    let selectedGPUs = newValue.map((option) => option.value);

    if (actionMeta.action === 'select-option') {
      useSpecific = actionMeta.option?.value !== 'all';
      selectedGPUs = selectedGPUs.filter((value) =>
        useSpecific ? value !== 'all' : value === 'all'
      );
    }

    const newValues = { ...values, selectedGPUs, useSpecific };
    onChange(newValues);
  }

  function onChangeSelectedCaps(newValue: OnChangeValue<GpuOption, true>) {
    onChangeValues(
      'capabilities',
      newValue.map((option) => option.value)
    );
  }
}

function Option(props: OptionProps<GpuOption, true>) {
  const {
    data: { value, description },
  } = props;

  return (
    <div>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <components.Option {...props}>
        {`${value} - ${description}`}
      </components.Option>
    </div>
  );
}

function MultiValueRemove(props: MultiValueRemoveProps<GpuOption, true>) {
  const {
    selectProps: { value },
  } = props;
  if (value && (value as MultiValue<GpuOption>).length === 1) {
    return null;
  }
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <components.MultiValueRemove {...props} />;
}
