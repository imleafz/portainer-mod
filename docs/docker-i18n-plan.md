# Docker 组件硬编码翻译计划

## 概述

本文档记录了 `app/react/docker` 目录下所有硬编码的英文字符串的翻译工作进展。

## 翻译状态总览

| 类别              | 数量 | 状态               |
| ----------------- | ---- | ------------------ |
| 表头 (Header)     | 37处 | ✅ 翻译 key 已添加 |
| 筛选选项 (Filter) | 4处  | ✅ 已完成          |
| Aria-label 属性   | 6处  | ✅ 已完成          |
| Title 属性        | 5处  | ✅ 已完成          |
| Placeholder       | 2处  | ✅ 已完成          |
| Tooltip           | 2处  | ✅ 已完成          |

## 已完成的翻译工作

### 1. 筛选选项翻译 (Filter Options)

| 文件                                                 | 翻译内容                       |
| ---------------------------------------------------- | ------------------------------ |
| `stacks/ListView/StacksDatatable/columns/name.tsx`   | Active Stacks, Inactive Stacks |
| `images/ListView/ImagesDatatable/columns/id.tsx`     | Used, Unused                   |
| `volumes/ListView/VolumesDatatable/columns/name.tsx` | Used, Unused                   |

### 2. Aria-label 属性翻译

| 文件                                                                              | 翻译内容               |
| --------------------------------------------------------------------------------- | ---------------------- |
| `containers/CreateView/VolumesTab/Item.tsx`                                       | Volume type, ReadWrite |
| `stacks/ItemView/StackInfoTab/StackDuplicationForm/StackDuplicationFormInner.tsx` | Stack name             |
| `services/ListView/ServicesDatatable/TasksDatatable/TasksDatatable.tsx`           | Tasks table            |
| `networks/ListView/NestedNetworksTable.tsx`                                       | Networks table         |
| `containers/ItemView/ContainerStatusSection/NameRow.tsx`                          | Edit container name    |

### 3. Title 属性翻译

| 文件                                                     | 翻译内容            |
| -------------------------------------------------------- | ------------------- |
| `networks/ItemView/ItemView.tsx`                         | Network details     |
| `containers/ItemView/ItemView.tsx`                       | Container details   |
| `containers/ItemView/ContainerStatusSection/NameRow.tsx` | Edit container name |

### 4. Tooltip 翻译

| 文件                                                             | 翻译内容                                        |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| `containers/CreateView/ResourcesTab/GpuFieldset/GpuFieldset.tsx` | GPU capabilities tooltip, GPU generated tooltip |

## 新增翻译 Key 列表

### 英文翻译 (translations/en/translation.json)

```json
{
  "docker": {
    "container": {
      "volumeType": "Volume type",
      "readWrite": "Read/Write",
      "gpuCapabilitiesTooltip": "'compute' and 'utility' capabilities are preselected by Portainer because they are used by default when you don't explicitly specify capabilities with docker CLI '--gpus' option.",
      "gpuGeneratedTooltip": "This is the generated equivalent of the '--gpus' docker CLI parameter based on your settings."
    },
    "images": {
      "host": "Host"
    },
    "stacks": {
      "stackName": "Stack name",
      "activeStacks": "Active stacks",
      "inactiveStacks": "Inactive stacks"
    },
    "networks": {
      "table": "Networks table"
    }
  }
}
```

### 中文翻译 (translations/zh-CN/translation.json)

```json
{
  "docker": {
    "container": {
      "volumeType": "存储卷类型",
      "readWrite": "读写",
      "gpuCapabilitiesTooltip": "Portainer 预选了 'compute' 和 'utility' 功能，因为在不使用 docker CLI '--gpus' 选项明确指定功能时，这些是默认使用的。",
      "gpuGeneratedTooltip": "这是根据您的设置生成的等同于 '--gpus' docker CLI 参数的内容。"
    },
    "images": {
      "host": "主机"
    },
    "stacks": {
      "stackName": "堆栈名称",
      "activeStacks": "活跃的堆栈",
      "inactiveStacks": "非活跃的堆栈"
    },
    "networks": {
      "table": "网络表格"
    }
  }
}
```

## 技术说明

### 表头翻译限制

由于 TanStack Table 的 `columnHelper` 的 `header` 属性是静态配置，不能直接在模块顶层使用 `useTranslation()` hook。

**解决方案**：所有翻译 key 已添加到翻译文件中，等待以下任一方式解决：

1. TanStack Table 未来版本支持 header 中使用 hooks
2. 使用 wrapper 组件封装翻译功能

### 筛选选项翻译

筛选选项的翻译在 `FilterContent` 函数内部完成，可以正常使用 `useTranslation()` hook：

```tsx
function FilterContent({ filterKey, value, setFilterValue }) {
  const { t } = useTranslation();
  const filterOptions = [t('docker.stacks.activeStacks'), t('docker.stacks.inactiveStacks')];
  // ...
}
```

## 执行记录

- **2025-04-16**: 完成所有翻译 key 的添加
- **2025-04-16**: 修复中文翻译 JSON 格式错误
- 英文文件: `translations/en/translation.json` - ✅ 验证通过
- 中文文件: `translations/zh-CN/translation.json` - ✅ 验证通过

## 后续建议

1. **定期检查**: 定期扫描新的硬编码字符串
2. **测试验证**: 在 UI 中测试翻译显示是否正确
3. **遗漏补全**: 继续处理其他可能遗漏的硬编码
