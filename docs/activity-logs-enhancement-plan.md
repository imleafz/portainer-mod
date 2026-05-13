# Activity 活动日志功能完善方案

## 文档信息

| 项目     | 内容       |
| -------- | ---------- |
| 文档版本 | v1.0       |
| 创建日期 | 2026-04-17 |
| 状态     | 待实施     |

---

## 一、现状分析

### 1.1 当前日志系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     Activity Log 系统                            │
├─────────────────────────────────────────────────────────────────┤
│  数据模型层                                                       │
│  api/dataservices/activitylog/models.go                        │
│  ├── ActivityLog { Action, Context, ResourceType, ResourceID,   │
│  │                ResourceName, Payload }                        │
│  └── AuthLog { ActivityType, AuthMethod, Success }              │
├─────────────────────────────────────────────────────────────────┤
│  服务层                                                           │
│  api/internal/activitylog/logger.go                            │
│  └── LogActivity(userID, username, action, context,            │
│                  resourceType, resourceID, resourceName, payload)│
├─────────────────────────────────────────────────────────────────┤
│  Handler层 (已记录日志的34个位置)                                  │
│  api/http/handler/{resource}/                                  │
│  └── stacks/, endpoints/, registries/, teams/, users/ 等        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 当前存在的问题

#### 问题 1：Payload 为空或信息不足

| Handler 文件                  | 问题                | 示例             |
| ----------------------------- | ------------------- | ---------------- |
| `customtemplate_create.go:75` | Payload 为 `nil`    | 无任何详情       |
| `stack_update.go:132-134`     | 只有 `endpointID`   | 无法理解操作内容 |
| `team_create.go:83-85`        | 只有 `teamLeaders`  | 无操作描述       |
| `endpoint_create.go:296-308`  | 只有 `endpointType` | 信息单一         |

#### 问题 2：Action/ResourceType 硬编码

```go
// 当前实现 - 硬编码字符串
activitylog.LogActivity(
    operatorUserID,
    operatorUsername,
    "create",        // ❌ 硬编码，容易拼写错误
    "portainer",     // ❌ 硬编码
    "endpoint",      // ❌ 硬编码，不准确
    strconv.Itoa(int(endpoint.ID)),
    endpoint.Name,
    payload,
)
```

#### 问题 3：前端展示不友好

- 直接显示 JSON Tree，不可读
- 缺少结构化的详情卡片
- 操作类型和资源类型映射不完整
- 筛选功能单一

#### 问题 4：Docker 代理层无日志

Docker 资源（Container、Service、Image 等）通过代理层访问，**完全没有日志记录**。

---

## 二、Phase 3：日志内容优化

### 2.1 新增常量定义文件

**文件路径**: `api/dataservices/activitylog/constants.go`

```go
package activitylog

// Action 常量 - 使用更直观的中文描述
const (
    // 通用资源操作
    ActionCreate   = "创建"
    ActionUpdate   = "更新"
    ActionDelete   = "删除"
    ActionStart    = "启动"
    ActionStop     = "停止"
    ActionRestart  = "重启"
    ActionDeploy   = "部署"
    ActionRedeploy = "重新部署"
    ActionScale    = "扩缩容"
    ActionToggle   = "切换"
    ActionImport   = "导入"
    ActionExport   = "导出"

    // 认证操作
    ActionLogin   = "登录"
    ActionLogout  = "登出"
    ActionRegister = "注册"
)

// ResourceType 常量 - 使用准确的资源类型描述
const (
    // Docker 资源
    ResourceTypeDockerContainer  = "Docker 容器"
    ResourceTypeDockerImage       = "Docker 镜像"
    ResourceTypeDockerNetwork     = "Docker 网络"
    ResourceTypeDockerVolume      = "Docker 存储卷"
    ResourceTypeDockerService     = "Docker Service"
    ResourceTypeDockerConfig      = "Docker Config"
    ResourceTypeDockerSecret      = "Docker Secret"
    ResourceTypeDockerStack       = "Docker 堆栈"
    ResourceTypeDockerSwarm      = "Docker Swarm"

    // Kubernetes 资源
    ResourceTypeK8sDeployment   = "Kubernetes Deployment"
    ResourceTypeK8sService      = "Kubernetes Service"
    ResourceTypeK8sIngress      = "Kubernetes Ingress"
    ResourceTypeK8sConfigMap    = "Kubernetes ConfigMap"
    ResourceTypeK8sSecret       = "Kubernetes Secret"
    ResourceTypeK8sNamespace    = "Kubernetes 命名空间"
    ResourceTypeK8sPod          = "Kubernetes Pod"
    ResourceTypeK8sStatefulSet  = "Kubernetes StatefulSet"
    ResourceTypeK8sDaemonSet    = "Kubernetes DaemonSet"
    ResourceTypeK8sJob          = "Kubernetes Job"
    ResourceTypeK8sCronJob      = "Kubernetes CronJob"
    ResourceTypeK8sPV           = "Kubernetes PersistentVolume"
    ResourceTypeK8sPVC         = "Kubernetes PersistentVolumeClaim"

    // Portainer 资源
    ResourceTypeUser           = "用户"
    ResourceTypeTeam           = "团队"
    ResourceTypeTeamMembership = "团队成员"
    ResourceTypeEndpoint       = "环境"
    ResourceTypeEndpointGroup  = "环境分组"
    ResourceTypeRegistry       = "注册表"
    ResourceTypeCustomTemplate = "自定义模板"
    ResourceTypeWebhook        = "Webhook"
    ResourceTypeRole           = "角色"
    ResourceTypeTag            = "标签"
    ResourceTypeSettings       = "系统设置"
    ResourceTypeSSL            = "SSL 证书"
    ResourceTypeResourceControl = "访问控制"
    ResourceTypeHelmRelease   = "Helm Release"

    // Edge 资源
    ResourceTypeEdgeGroup = "Edge 分组"
    ResourceTypeEdgeJob   = "Edge 任务"
    ResourceTypeEdgeStack = "Edge 堆栈"
)

// Context 常量
const (
    ContextDocker     = "Docker"
    ContextKubernetes = "Kubernetes"
    ContextPortainer  = "Portainer"
    ContextEdge       = "Edge"
)

// ContextToResourcePrefix 上下文对应的资源前缀
var ContextToResourcePrefix = map[string]string{
    ContextDocker:     "Docker",
    ContextKubernetes: "Kubernetes",
    ContextPortainer:  "Portainer",
    ContextEdge:       "Edge",
}
```

### 2.2 新增统一日志构建器

**文件路径**: `api/internal/activitylog/builder.go`

```go
package activitylog

import "fmt"

// ActivityLogBuilder 统一构建活动日志
type ActivityLogBuilder struct {
    userID       int
    username     string
    action       string
    context      string
    resourceType string
    resourceID  string
    resourceName string
    payload      map[string]interface{}
}

// NewActivityLogBuilder 创建日志构建器
// 参数:
//   - action: 操作类型，如 ActivityLog.ActionCreate
//   - context: 上下文，如 ActivityLog.ContextDocker
//   - resourceType: 资源类型，如 ActivityLog.ResourceTypeDockerService
func NewActivityLogBuilder(action, context, resourceType string) *ActivityLogBuilder {
    return &ActivityLogBuilder{
        action:       action,
        context:      context,
        resourceType: resourceType,
        payload:      make(map[string]interface{}),
    }
}

// WithUser 设置用户信息
func (b *ActivityLogBuilder) WithUser(userID int, username string) *ActivityLogBuilder {
    b.userID = userID
    b.username = username
    return b
}

// WithResource 设置资源信息
func (b *ActivityLogBuilder) WithResource(id, name string) *ActivityLogBuilder {
    b.resourceID = id
    b.resourceName = name
    return b
}

// WithPayload 设置单个详细信息
func (b *ActivityLogBuilder) WithPayload(key string, value interface{}) *ActivityLogBuilder {
    b.payload[key] = value
    return b
}

// WithDetails 批量设置详细信息
func (b *ActivityLogBuilder) WithDetails(details map[string]interface{}) *ActivityLogBuilder {
    for k, v := range details {
        b.payload[k] = v
    }
    return b
}

// WithDescription 设置操作描述
func (b *ActivityLogBuilder) WithDescription(description string) *ActivityLogBuilder {
    b.payload["description"] = description
    return b
}

// WithTeam 设置团队信息
func (b *ActivityLogBuilder) WithTeam(teamName string) *ActivityLogBuilder {
    b.payload["team"] = teamName
    return b
}

// WithEndpoint 设置环境信息
func (b *ActivityLogBuilder) WithEndpoint(endpointName string) *ActivityLogBuilder {
    b.payload["endpoint"] = endpointName
    return b
}

// WithNamespace 设置命名空间信息
func (b *ActivityLogBuilder) WithNamespace(namespace string) *ActivityLogBuilder {
    b.payload["namespace"] = namespace
    return b
}

// WithResourceType 设置资源类型
func (b *ActivityLogBuilder) WithResourceType(resourceType string) *ActivityLogBuilder {
    b.payload["resourceType"] = resourceType
    return b
}

// WithResourceName 设置资源名称
func (b *ActivityLogBuilder) WithResourceName(resourceName string) *ActivityLogBuilder {
    b.payload["resourceName"] = resourceName
    return b
}

// Log 记录日志
func (b *ActivityLogBuilder) Log() error {
    // 生成默认描述
    if _, ok := b.payload["description"]; !ok {
        b.payload["description"] = b.generateDescription()
    }

    return LogActivity(
        b.userID,
        b.username,
        b.action,
        b.context,
        b.resourceType,
        b.resourceID,
        b.resourceName,
        b.payload,
    )
}

// generateDescription 生成默认操作描述
func (b *ActivityLogBuilder) generateDescription() string {
    return fmt.Sprintf("%s了%s", b.action, b.resourceName)
}

// GetPayload 获取 payload 副本
func (b *ActivityLogBuilder) GetPayload() map[string]interface{} {
    result := make(map[string]interface{})
    for k, v := range b.payload {
        result[k] = v
    }
    return result
}
```

### 2.3 Handler 改造详细清单

#### 2.3.1 stacks/stack_create.go

**改造前**:

```go
payload := map[string]interface{}{
    "stackType":  stack.Type,
    "method":     "create",
    "endpointID": stack.EndpointID,
}

activitylog.LogActivity(
    int(userID),
    username,
    "create",
    "docker",
    "stack",
    strconv.Itoa(int(stack.ID)),
    stack.Name,
    payload,
)
```

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionCreate,
    activitylog.ContextDocker,
    activitylog.ResourceTypeDockerStack,
).
    WithUser(int(userID), username).
    WithResource(strconv.Itoa(int(stack.ID)), stack.Name).
    WithDetails(map[string]interface{}{
        "description":    fmt.Sprintf("创建 Docker 堆栈成功"),
        "stackName":      stack.Name,
        "stackType":      stack.Type.String(), // DockerSwarmStack, DockerComposeStack, KubernetesStack
        "endpoint":       endpoint.Name,
        "method":         method, // string, repository, file
        "entryPoint":     stack.EntryPoint,
    }).
    Log()
```

#### 2.3.2 stacks/stack_update.go

**改造前**:

```go
activitylog.LogActivity(
    operatorUserID,
    operatorUsername,
    "update",
    "docker",
    "stack",
    strconv.Itoa(int(stack.ID)),
    stack.Name,
    map[string]interface{}{
        "endpointID": stack.EndpointID,
    },
)
```

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionUpdate,
    activitylog.ContextDocker,
    activitylog.ResourceTypeDockerStack,
).
    WithUser(operatorUserID, operatorUsername).
    WithResource(strconv.Itoa(int(stack.ID)), stack.Name).
    WithDetails(map[string]interface{}{
        "description":    fmt.Sprintf("更新 Docker 堆栈成功"),
        "stackName":      stack.Name,
        "stackType":      stack.Type.String(),
        "endpoint":       endpoint.Name,
        "method":         method,
        "redeploy":       payload.RepullImageAndRedeploy,
    }).
    Log()
```

#### 2.3.3 stacks/stack_delete.go

**改造前**:

```go
activityPayload := map[string]interface{}{
    "stackType":  stack.Type,
    "endpointID": stack.EndpointID,
}

activitylog.LogActivity(
    int(securityContext.UserID),
    username,
    "delete",
    "docker",
    "stack",
    strconv.Itoa(int(stack.ID)),
    stack.Name,
    activityPayload,
)
```

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionDelete,
    activitylog.ContextDocker,
    activitylog.ResourceTypeDockerStack,
).
    WithUser(int(securityContext.UserID), username).
    WithResource(strconv.Itoa(int(stack.ID)), stack.Name).
    WithDetails(map[string]interface{}{
        "description":    fmt.Sprintf("删除 Docker 堆栈成功"),
        "stackName":      stack.Name,
        "stackType":      stack.Type.String(),
        "endpoint":       endpoint.Name,
    }).
    Log()
```

#### 2.3.4 endpoints/endpoint_create.go

**改造前**:

```go
payloadMap := map[string]interface{}{
    "endpointType": endpoint.Type,
}

activitylog.LogActivity(
    operatorUserID,
    operatorUsername,
    "create",
    "portainer",
    "endpoint",
    strconv.Itoa(int(endpoint.ID)),
    endpoint.Name,
    payloadMap,
)
```

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionCreate,
    activitylog.ContextPortainer,
    activitylog.ResourceTypeEndpoint,
).
    WithUser(operatorUserID, operatorUsername).
    WithResource(strconv.Itoa(int(endpoint.ID)), endpoint.Name).
    WithDetails(map[string]interface{}{
        "description":     fmt.Sprintf("创建环境成功"),
        "endpointName":   endpoint.Name,
        "endpointType":   endpoint.Type.String(), // Docker, Kubernetes, Azure, Edge
        "endpointURL":    endpoint.URL,
        "publicURL":      endpoint.PublicURL,
    }).
    Log()
```

#### 2.3.5 registries/registry_create.go

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionCreate,
    activitylog.ContextPortainer,
    activitylog.ResourceTypeRegistry,
).
    WithUser(operatorUserID, operatorUsername).
    WithResource(strconv.Itoa(int(registry.ID)), registry.Name).
    WithDetails(map[string]interface{}{
        "description":    fmt.Sprintf("创建注册表成功"),
        "registryName":  registry.Name,
        "registryType":  registry.Type.String(), // Quay, Azure, Custom, Gitlab, ProGet, DockerHub, ECR
        "registryURL":   registry.URL,
    }).
    Log()
```

#### 2.3.6 users/user_create.go

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionCreate,
    activitylog.ContextPortainer,
    activitylog.ResourceTypeUser,
).
    WithUser(operatorUserID, operatorUsername).
    WithResource(strconv.Itoa(int(user.ID)), user.Username).
    WithDetails(map[string]interface{}{
        "description":    fmt.Sprintf("创建用户成功"),
        "username":       user.Username,
        "userRole":       user.Role.String(), // Administrator, StandardUser
    }).
    Log()
```

#### 2.3.7 teams/team_create.go

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionCreate,
    activitylog.ContextPortainer,
    activitylog.ResourceTypeTeam,
).
    WithUser(operatorUserID, operatorUsername).
    WithResource(strconv.Itoa(int(team.ID)), team.Name).
    WithDetails(map[string]interface{}{
        "description":    fmt.Sprintf("创建团队成功"),
        "teamName":       team.Name,
        "teamLeaders":    payload.TeamLeaders,
    }).
    Log()
```

#### 2.3.8 customtemplates/customtemplate_create.go

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionCreate,
    activitylog.ContextPortainer,
    activitylog.ResourceTypeCustomTemplate,
).
    WithUser(int(tokenData.ID), tokenData.Username).
    WithResource(strconv.Itoa(int(customTemplate.ID)), customTemplate.Title).
    WithDetails(map[string]interface{}{
        "description":     fmt.Sprintf("创建自定义模板成功"),
        "templateTitle":  customTemplate.Title,
        "templateType":   customTemplate.Type.String(), // Swarm, Compose, Kubernetes
        "platform":       customTemplate.Platform.String(), // Linux, Windows
        "logo":           customTemplate.Logo,
        "method":         method, // string, repository, file
    }).
    Log()
```

#### 2.3.9 helm/helm_delete.go

**改造后**:

```go
activitylog.NewActivityLogBuilder(
    activitylog.ActionDelete,
    activitylog.ContextPortainer,
    activitylog.ResourceTypeHelmRelease,
).
    WithUser(userID, username).
    WithResource(releaseName, releaseName).
    WithDetails(map[string]interface{}{
        "description":     fmt.Sprintf("删除 Helm Release 成功"),
        "releaseName":    releaseName,
        "namespace":     namespace,
        "endpoint":      endpoint.Name,
    }).
    Log()
```

### 2.4 Phase 3 实施任务清单

| 序号 | 任务                           | 文件路径                                                      | 改造内容                              |
| ---- | ------------------------------ | ------------------------------------------------------------- | ------------------------------------- |
| 1    | 创建常量文件                   | `api/dataservices/activitylog/constants.go`                   | 新增 Action/ResourceType/Context 常量 |
| 2    | 创建构建器                     | `api/internal/activitylog/builder.go`                         | 新增 ActivityLogBuilder               |
| 3    | 改造 stack_create              | `api/http/handler/stacks/stack_create.go`                     | 使用 builder + 丰富 payload           |
| 4    | 改造 stack_update              | `api/http/handler/stacks/stack_update.go`                     | 使用 builder + 丰富 payload           |
| 5    | 改造 stack_delete              | `api/http/handler/stacks/stack_delete.go`                     | 使用 builder + 丰富 payload           |
| 6    | 改造 stack_update_git_redeploy | `api/http/handler/stacks/stack_update_git_redeploy.go`        | 使用 builder + 丰富 payload           |
| 7    | 改造 create_kubernetes_stack   | `api/http/handler/stacks/create_kubernetes_stack.go`          | 使用 builder + 丰富 payload           |
| 8    | 改造 endpoint_create           | `api/http/handler/endpoints/endpoint_create.go`               | 使用 builder + 丰富 payload           |
| 9    | 改造 endpoint_update           | `api/http/handler/endpoints/endpoint_update.go`               | 使用 builder + 丰富 payload           |
| 10   | 改造 endpoint_delete           | `api/http/handler/endpoints/endpoint_delete.go`               | 使用 builder + 丰富 payload           |
| 11   | 改造 registry_create           | `api/http/handler/registries/registry_create.go`              | 使用 builder + 丰富 payload           |
| 12   | 改造 registry_update           | `api/http/handler/registries/registry_update.go`              | 使用 builder + 丰富 payload           |
| 13   | 改造 registry_delete           | `api/http/handler/registries/registry_delete.go`              | 使用 builder + 丰富 payload           |
| 14   | 改造 user_create               | `api/http/handler/users/user_create.go`                       | 使用 builder + 丰富 payload           |
| 15   | 改造 user_update               | `api/http/handler/users/user_update.go`                       | 使用 builder + 丰富 payload           |
| 16   | 改造 user_delete               | `api/http/handler/users/user_delete.go`                       | 使用 builder + 丰富 payload           |
| 17   | 改造 team_create               | `api/http/handler/teams/team_create.go`                       | 使用 builder + 丰富 payload           |
| 18   | 改造 team_update               | `api/http/handler/teams/team_update.go`                       | 使用 builder + 丰富 payload           |
| 19   | 改造 team_delete               | `api/http/handler/teams/team_delete.go`                       | 使用 builder + 丰富 payload           |
| 20   | 改造 customtemplate_create     | `api/http/handler/customtemplates/customtemplate_create.go`   | 使用 builder + 丰富 payload           |
| 21   | 改造 customtemplate_update     | `api/http/handler/customtemplates/customtemplate_update.go`   | 使用 builder + 丰富 payload           |
| 22   | 改造 customtemplate_delete     | `api/http/handler/customtemplates/customtemplate_delete.go`   | 使用 builder + 丰富 payload           |
| 23   | 改造 webhook_create            | `api/http/handler/webhooks/webhook_create.go`                 | 使用 builder + 丰富 payload           |
| 24   | 改造 webhook_delete            | `api/http/handler/webhooks/webhook_delete.go`                 | 使用 builder + 丰富 payload           |
| 25   | 改造 helm_delete               | `api/http/handler/helm/helm_delete.go`                        | 使用 builder + 丰富 payload           |
| 26   | 改造 endpointgroup_create      | `api/http/handler/endpointgroups/endpointgroup_create.go`     | 使用 builder + 丰富 payload           |
| 27   | 改造 endpointgroup_update      | `api/http/handler/endpointgroups/endpointgroup_update.go`     | 使用 builder + 丰富 payload           |
| 28   | 改造 endpointgroup_delete      | `api/http/handler/endpointgroups/endpointgroup_delete.go`     | 使用 builder + 丰富 payload           |
| 29   | 改造 tag_create                | `api/http/handler/tags/tag_create.go`                         | 使用 builder + 丰富 payload           |
| 30   | 改造 tag_delete                | `api/http/handler/tags/tag_delete.go`                         | 使用 builder + 丰富 payload           |
| 31   | 改造 teammembership_create     | `api/http/handler/teammemberships/teammembership_create.go`   | 使用 builder + 丰富 payload           |
| 32   | 改造 teammembership_update     | `api/http/handler/teammemberships/teammembership_update.go`   | 使用 builder + 丰富 payload           |
| 33   | 改造 teammembership_delete     | `api/http/handler/teammemberships/teammembership_delete.go`   | 使用 builder + 丰富 payload           |
| 34   | 改造 ssl_update                | `api/http/handler/ssl/ssl_update.go`                          | 使用 builder + 丰富 payload           |
| 35   | 改造 settings_update           | `api/http/handler/settings/settings_update.go`                | 使用 builder + 丰富 payload           |
| 36   | 改造 resourcecontrol_update    | `api/http/handler/resourcecontrols/resourcecontrol_update.go` | 使用 builder + 丰富 payload           |

---

## 三、Phase 4：前端展示优化

### 3.1 新增组件文件

#### 3.1.1 DetailCard.tsx

**文件路径**: `app/react/portainer/logs/ActivityLogsView/components/DetailCard.tsx`

```tsx
import { ReactNode } from 'react';

interface DetailCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DetailCard({ title, children, className = '' }: DetailCardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
```

#### 3.1.2 DetailItem.tsx

**文件路径**: `app/react/portainer/logs/ActivityLogsView/components/DetailItem.tsx`

```tsx
interface DetailItemProps {
  label: string;
  value: string | number | boolean | undefined | null;
}

export function DetailItem({ label, value }: DetailItemProps) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const displayValue = typeof value === 'boolean' ? (value ? '是' : '否') : String(value);

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="font-medium text-gray-900 text-sm text-right max-w-[60%] truncate">{displayValue}</span>
    </div>
  );
}
```

#### 3.1.3 StatusIcon.tsx

**文件路径**: `app/react/portainer/logs/ActivityLogsView/components/StatusIcon.tsx`

```tsx
import { Plus, Edit, Trash2, Play, Square, RotateCcw, Upload, RefreshCw, Activity } from 'lucide-react';

type ActionType = '创建' | '更新' | '删除' | '启动' | '停止' | '重启' | '部署' | '重新部署' | '登录' | '登出';

interface StatusIconProps {
  action: ActionType | string;
  size?: number;
}

const actionConfig: Record<string, { icon: typeof Activity; color: string; bgColor: string }> = {
  创建: { icon: Plus, color: 'text-green-600', bgColor: 'bg-green-100' },
  更新: { icon: Edit, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  删除: { icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100' },
  启动: { icon: Play, color: 'text-green-600', bgColor: 'bg-green-100' },
  停止: { icon: Square, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  重启: { icon: RotateCcw, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  部署: { icon: Upload, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  重新部署: { icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  登录: { icon: Activity, color: 'text-green-600', bgColor: 'bg-green-100' },
  登出: { icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export function StatusIcon({ action, size = 16 }: StatusIconProps) {
  const config = actionConfig[action] || { icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor}`}>
      <Icon className={`${config.color}`} size={size} />
    </span>
  );
}
```

### 3.2 改造 ActivityLogsTable

**文件路径**: `app/react/portainer/logs/ActivityLogsView/ActivityLogsTable.tsx`

```tsx
import { createColumnHelper } from '@tanstack/react-table';
import { History, Search } from 'lucide-react';

import { isoDateFromTimestamp } from '@/portainer/filters/filters';

import { ExpandableDatatable } from '@@/datatables/ExpandableDatatable';
import { Button } from '@@/buttons';
import { JsonTree } from '@@/JsonTree';

import { ActivityLog } from './types';
import { getSortType } from './useActivityLogs';
import { DetailCard } from './components/DetailCard';
import { DetailItem } from './components/DetailItem';
import { StatusIcon } from './components/StatusIcon';

// 操作类型映射 - 包含图标和颜色
const actionLabels: Record<string, { label: string; color: string }> = {
  创建: { label: '创建', color: 'green' },
  更新: { label: '更新', color: 'blue' },
  删除: { label: '删除', color: 'red' },
  启动: { label: '启动', color: 'green' },
  停止: { label: '停止', color: 'orange' },
  重启: { label: '重启', color: 'blue' },
  部署: { label: '部署', color: 'purple' },
  重新部署: { label: '重新部署', color: 'blue' },
  登录: { label: '登录', color: 'green' },
  登出: { label: '登出', color: 'gray' },
};

// 资源类型映射 - 包含中文名称和分类
const resourceTypeLabels: Record<string, { label: string; category: string }> = {
  // Docker 资源
  'Docker 容器': { label: 'Docker 容器', category: 'Docker' },
  'Docker 镜像': { label: 'Docker 镜像', category: 'Docker' },
  'Docker 网络': { label: 'Docker 网络', category: 'Docker' },
  'Docker 存储卷': { label: 'Docker 存储卷', category: 'Docker' },
  'Docker Service': { label: 'Docker Service', category: 'Docker' },
  'Docker Config': { label: 'Docker Config', category: 'Docker' },
  'Docker Secret': { label: 'Docker Secret', category: 'Docker' },
  'Docker 堆栈': { label: 'Docker 堆栈', category: 'Docker' },
  'Docker Swarm': { label: 'Docker Swarm', category: 'Docker' },

  // Kubernetes 资源
  'Kubernetes Deployment': { label: 'Deployment', category: 'Kubernetes' },
  'Kubernetes Service': { label: 'Service', category: 'Kubernetes' },
  'Kubernetes Ingress': { label: 'Ingress', category: 'Kubernetes' },
  'Kubernetes ConfigMap': { label: 'ConfigMap', category: 'Kubernetes' },
  'Kubernetes Secret': { label: 'Secret', category: 'Kubernetes' },
  'Kubernetes 命名空间': { label: '命名空间', category: 'Kubernetes' },
  'Kubernetes StatefulSet': { label: 'StatefulSet', category: 'Kubernetes' },
  'Kubernetes DaemonSet': { label: 'DaemonSet', category: 'Kubernetes' },
  'Kubernetes Job': { label: 'Job', category: 'Kubernetes' },
  'Kubernetes CronJob': { label: 'CronJob', category: 'Kubernetes' },

  // Portainer 资源
  用户: { label: '用户', category: 'Portainer' },
  团队: { label: '团队', category: 'Portainer' },
  环境: { label: '环境', category: 'Portainer' },
  注册表: { label: '注册表', category: 'Portainer' },
  自定义模板: { label: '自定义模板', category: 'Portainer' },
  Webhook: { label: 'Webhook', category: 'Portainer' },
  角色: { label: '角色', category: 'Portainer' },
  标签: { label: '标签', category: 'Portainer' },
  系统设置: { label: '系统设置', category: 'Portainer' },
  'SSL 证书': { label: 'SSL 证书', category: 'Portainer' },
  'Helm Release': { label: 'Helm Release', category: 'Helm' },
};

// 向后兼容的映射
const legacyResourceTypeLabels: Record<string, string> = {
  endpoint: '环境',
  registry: '注册表',
  user: '用户',
  team: '团队',
  stack: 'Docker 堆栈',
  custom_template: '自定义模板',
  webhook: 'Webhook',
  ssl: 'SSL 证书',
  settings: '系统设置',
  resourcecontrol: '访问控制',
  tag: '标签',
  endpointgroup: '环境分组',
  helm_release: 'Helm Release',
};

function getActionLabel(action: string): string {
  return actionLabels[action]?.label || action;
}

function getResourceTypeLabel(resourceType: string): { label: string; category: string } {
  if (resourceTypeLabels[resourceType]) {
    return resourceTypeLabels[resourceType];
  }
  const legacy = legacyResourceTypeLabels[resourceType];
  return legacy ? { label: legacy, category: 'Portainer' } : { label: resourceType, category: 'Other' };
}

// SubRow 组件 - 结构化详情展示
function SubRow({ item }: { item: ActivityLog }) {
  const actionLabel = getActionLabel(item.action);
  const resourceTypeInfo = getResourceTypeLabel(item.resourceType);
  const payload = item.payload as Record<string, any>;

  return (
    <tr>
      <td colSpan={Number.MAX_SAFE_INTEGER}>
        <div className="p-4">
          {/* 操作摘要头部 */}
          <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg border">
            <StatusIcon action={actionLabel} size={20} />
            <span className="text-lg font-medium text-gray-900">
              {actionLabel}了{resourceTypeInfo.label}
            </span>
            <span className="text-lg font-semibold text-portainer-blue">"{payload?.resourceName || payload?.stackName || payload?.endpointName || item.resourceName}"</span>
          </div>

          {/* 详情卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* 基本信息卡片 */}
            <DetailCard title="基本信息">
              <DetailItem label="资源类型" value={resourceTypeInfo.label} />
              <DetailItem label="资源名称" value={payload?.resourceName || item.resourceName} />
              <DetailItem label="资源ID" value={item.resourceID} />
              <DetailItem label="操作用户" value={item.username} />
              <DetailItem label="操作时间" value={isoDateFromTimestamp(item.timestamp)} />
            </DetailCard>

            {/* 关联信息卡片 */}
            {(payload?.team || payload?.endpoint || payload?.namespace) && (
              <DetailCard title="关联信息">
                {payload?.team && <DetailItem label="所属团队" value={payload.team} />}
                {payload?.endpoint && <DetailItem label="环境" value={payload.endpoint} />}
                {payload?.namespace && <DetailItem label="命名空间" value={payload.namespace} />}
                {payload?.stackType && <DetailItem label="堆栈类型" value={payload.stackType} />}
                {payload?.method && <DetailItem label="创建方式" value={payload.method} />}
              </DetailCard>
            )}

            {/* 操作结果卡片 */}
            {payload?.description && (
              <DetailCard title="操作描述">
                <div className="py-2 text-portainer-blue font-medium">{payload.description}</div>
              </DetailCard>
            )}
          </div>

          {/* 变更详情（如果有） */}
          {payload?.changes && payload.changes.length > 0 && (
            <DetailCard title="变更详情" className="mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-600">字段</th>
                    <th className="text-left py-2 font-medium text-gray-600">旧值</th>
                    <th className="text-left py-2 font-medium text-gray-600">新值</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.changes.map((change: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">{change.field}</td>
                      <td className="py-2 text-red-600 line-through">{change.oldValue || '-'}</td>
                      <td className="py-2 text-green-600">{change.newValue || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DetailCard>
          )}

          {/* 原始 JSON（可折叠） */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <span className="transform group-open:rotate-90 transition-transform">▶</span>
              查看原始 JSON 数据
            </summary>
            <div className="mt-2 p-3 bg-gray-900 rounded text-gray-100 text-xs font-mono overflow-auto max-h-48">
              <JsonTree data={item.payload} />
            </div>
          </details>
        </div>
      </td>
    </tr>
  );
}
```

### 3.3 改造 FilterBar

**文件路径**: `app/react/portainer/logs/ActivityLogsView/FilterBar.tsx`

```tsx
import { useState } from 'react';
import { DownloadIcon, Filter, X } from 'lucide-react';

import { Widget } from '@@/Widget';
import { TextTip } from '@@/Tip/TextTip';
import { Button } from '@@/buttons';

import { DateRangePicker } from '../components/DateRangePicker';

// 操作类型选项
const actionOptions = [
  { value: '创建', label: '创建' },
  { value: '更新', label: '更新' },
  { value: '删除', label: '删除' },
  { value: '启动', label: '启动' },
  { value: '停止', label: '停止' },
  { value: '重启', label: '重启' },
  { value: '部署', label: '部署' },
  { value: '登录', label: '登录' },
  { value: '登出', label: '登出' },
];

// 资源类型选项（按分类分组）
const resourceTypeOptions = [
  {
    label: 'Docker',
    options: [
      { value: 'Docker 容器', label: '容器' },
      { value: 'Docker 镜像', label: '镜像' },
      { value: 'Docker 网络', label: '网络' },
      { value: 'Docker 存储卷', label: '存储卷' },
      { value: 'Docker Service', label: 'Service' },
      { value: 'Docker 堆栈', label: '堆栈' },
    ],
  },
  {
    label: 'Kubernetes',
    options: [
      { value: 'Kubernetes Deployment', label: 'Deployment' },
      { value: 'Kubernetes Service', label: 'Service' },
      { value: 'Kubernetes Ingress', label: 'Ingress' },
      { value: 'Kubernetes ConfigMap', label: 'ConfigMap' },
      { value: 'Kubernetes Secret', label: 'Secret' },
      { value: 'Kubernetes 命名空间', label: '命名空间' },
    ],
  },
  {
    label: 'Portainer',
    options: [
      { value: '用户', label: '用户' },
      { value: '团队', label: '团队' },
      { value: '环境', label: '环境' },
      { value: '注册表', label: '注册表' },
      { value: '自定义模板', label: '自定义模板' },
      { value: 'Webhook', label: 'Webhook' },
      { value: 'Helm Release', label: 'Helm Release' },
    ],
  },
];

// 上下文选项
const contextOptions = [
  { value: 'Docker', label: 'Docker' },
  { value: 'Kubernetes', label: 'Kubernetes' },
  { value: 'Portainer', label: 'Portainer' },
];

interface FilterState {
  actions: string[];
  resourceTypes: string[];
  contexts: string[];
}

export function FilterBar({
  value,
  onChange,
  onExport,
}: {
  value: { start: Date; end: Date | null } | undefined;
  onChange: (value?: { start: Date; end: Date | null }) => void;
  onExport: () => void;
}) {
  const [filters, setFilters] = useState<FilterState>({
    actions: [],
    resourceTypes: [],
    contexts: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.actions.length > 0 || filters.resourceTypes.length > 0 || filters.contexts.length > 0;

  const handleFilterChange = (type: keyof FilterState, values: string[]) => {
    const newFilters = { ...filters, [type]: values };
    setFilters(newFilters);
    // 触发搜索回调
    if (onChange) {
      onChange(value);
    }
  };

  const handleResetFilters = () => {
    setFilters({ actions: [], resourceTypes: [], contexts: [] });
  };

  return (
    <Widget>
      <Widget.Body>
        <form className="form-horizontal">
          {/* 时间范围选择器 */}
          <DateRangePicker value={value} onChange={onChange} />

          {/* 筛选切换按钮 */}
          <div className="mt-4 flex items-center gap-2">
            <Button type="button" color="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-blue-50 border-blue-300' : ''}>
              高级筛选
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {filters.actions.length + filters.resourceTypes.length + filters.contexts.length}
                </span>
              )}
            </Button>

            {hasActiveFilters && (
              <Button type="button" color="link" icon={X} onClick={handleResetFilters}>
                重置筛选
              </Button>
            )}
          </div>

          {/* 高级筛选面板 */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded border">
              {/* 操作类型筛选 */}
              <div className="mb-4">
                <label className="control-label text-left text-sm font-medium text-gray-700 mb-2">操作类型</label>
                <div className="flex flex-wrap gap-2">
                  {actionOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                        filters.actions.includes(option.value) ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={filters.actions.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('actions', [...filters.actions, option.value]);
                          } else {
                            handleFilterChange(
                              'actions',
                              filters.actions.filter((v) => v !== option.value)
                            );
                          }
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* 资源类型筛选 */}
              <div className="mb-4">
                <label className="control-label text-left text-sm font-medium text-gray-700 mb-2">资源类型</label>
                <div className="space-y-2">
                  {resourceTypeOptions.map((group) => (
                    <div key={group.label}>
                      <div className="text-xs font-medium text-gray-500 mb-1">{group.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => (
                          <label
                            key={option.value}
                            className={`inline-flex items-center px-2 py-1 rounded text-sm cursor-pointer transition-colors ${
                              filters.resourceTypes.includes(option.value) ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={filters.resourceTypes.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFilterChange('resourceTypes', [...filters.resourceTypes, option.value]);
                                } else {
                                  handleFilterChange(
                                    'resourceTypes',
                                    filters.resourceTypes.filter((v) => v !== option.value)
                                  );
                                }
                              }}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 环境类别筛选 */}
              <div>
                <label className="control-label text-left text-sm font-medium text-gray-700 mb-2">环境类别</label>
                <div className="flex gap-2">
                  {contextOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`inline-flex items-center px-3 py-1 rounded text-sm cursor-pointer transition-colors ${
                        filters.contexts.includes(option.value) ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={filters.contexts.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('contexts', [...filters.contexts, option.value]);
                          } else {
                            handleFilterChange(
                              'contexts',
                              filters.contexts.filter((v) => v !== option.value)
                            );
                          }
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <TextTip color="blue" className="mt-4">
            活动日志最多保留 7 天。
          </TextTip>

          <div className="mt-4">
            <Button color="primary" icon={DownloadIcon} onClick={onExport} className="!ml-0" data-cy="activity-logs-export-csv-button">
              导出 CSV
            </Button>
          </div>
        </form>
      </Widget.Body>
    </Widget>
  );
}
```

### 3.4 前端类型定义增强

**文件路径**: `app/react/portainer/logs/ActivityLogsView/types.ts`

```typescript
interface BaseActivityLog {
  timestamp: number;
  action: string;
  context: string;
  id: number;
  username: string;
  resourceType: string;
  resourceID: string;
  resourceName: string;
}

export interface ActivityLogResponse extends BaseActivityLog {
  payload: string;
}

export interface ActivityLog extends BaseActivityLog {
  payload: string | ActivityPayload;
}

export interface ActivityLogsResponse {
  logs: Array<ActivityLogResponse>;
  totalCount: number;
}

// 新增：标准化的 Payload 结构
export interface ActivityPayload {
  // 通用字段
  description?: string; // 操作描述
  resourceType?: string; // 资源类型
  resourceName?: string; // 资源名称

  // 关联信息
  team?: string; // 所属团队
  endpoint?: string; // 环境名称
  endpointName?: string; // 环境名称（兼容）
  namespace?: string; // K8s 命名空间

  // 资源特定信息
  stackName?: string; // 堆栈名称
  stackType?: string; // 堆栈类型
  method?: string; // 创建方式
  endpointType?: string; // 环境类型
  registryType?: string; // 注册表类型
  registryURL?: string; // 注册表 URL
  username?: string; // 用户名
  userRole?: string; // 用户角色
  teamName?: string; // 团队名称
  templateTitle?: string; // 模板标题
  platform?: string; // 平台
  releaseName?: string; // Helm Release 名称
  endpointURL?: string; // 环境 URL
  publicURL?: string; // 公共 URL
  logo?: string; // Logo URL

  // 操作标志
  redeploy?: boolean; // 是否重新部署
  prune?: boolean; // 是否清理
  force?: boolean; // 是否强制

  // 变更详情
  changes?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;

  // 原始扩展字段
  [key: string]: any;
}
```

### 3.5 Phase 4 实施任务清单

| 序号 | 任务                         | 文件路径                                                              | 说明                      |
| ---- | ---------------------------- | --------------------------------------------------------------------- | ------------------------- |
| 1    | 创建 DetailCard 组件         | `app/react/portainer/logs/ActivityLogsView/components/DetailCard.tsx` | 详情卡片组件              |
| 2    | 创建 DetailItem 组件         | `app/react/portainer/logs/ActivityLogsView/components/DetailItem.tsx` | 详情项组件                |
| 3    | 创建 StatusIcon 组件         | `app/react/portainer/logs/ActivityLogsView/components/StatusIcon.tsx` | 状态图标组件              |
| 4    | 增强类型定义                 | `app/react/portainer/logs/ActivityLogsView/types.ts`                  | 添加 ActivityPayload 类型 |
| 5    | 改造 SubRow 组件             | `app/react/portainer/logs/ActivityLogsView/ActivityLogsTable.tsx`     | 使用详情卡片展示          |
| 6    | 扩展 actionLabels 映射       | `ActivityLogsTable.tsx`                                               | 添加所有操作类型          |
| 7    | 扩展 resourceTypeLabels 映射 | `ActivityLogsTable.tsx`                                               | 添加所有资源类型          |
| 8    | 改造 FilterBar               | `app/react/portainer/logs/ActivityLogsView/FilterBar.tsx`             | 添加多级筛选              |

---

## 四、Phase 5：Docker 代理层日志

### 4.1 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker API 代理请求流程                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HTTP Request                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────┐     │
│  │  Handler    │───▶│  Transport      │───▶│  Operation   │     │
│  │             │    │  (Router)      │    │  Executor    │     │
│  └─────────────┘    └─────────────────┘    └──────────────┘     │
│                                                  │               │
│                    ┌──────────────────────────────┘               │
│                    ▼                                              │
│             ┌──────────────┐                                     │
│             │  Docker API  │                                     │
│             │  (Actual)    │                                     │
│             └──────────────┘                                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  DockerOperationLogger - 日志钩子                         │     │
│  │  - BeforeOperation: 记录操作开始                          │     │
│  │  - AfterOperation: 记录操作结果                            │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Docker 日志服务实现

**文件路径**: `api/internal/activitylog/docker_logger.go`

```go
package activitylog

import (
    "fmt"
    "strings"
    "sync"
    "time"

    portainer "github.com/portainer/portainer/api"
)

// DockerResourceType Docker 资源类型
type DockerResourceType string

const (
    DockerContainer     DockerResourceType = "Docker 容器"
    DockerImage         DockerResourceType = "Docker 镜像"
    DockerNetwork       DockerResourceType = "Docker 网络"
    DockerVolume        DockerResourceType = "Docker 存储卷"
    DockerService       DockerResourceType = "Docker Service"
    DockerConfig        DockerResourceType = "Docker Config"
    DockerSecret        DockerResourceType = "Docker Secret"
    DockerStack         DockerResourceType = "Docker 堆栈"
    DockerSwarm         DockerResourceType = "Docker Swarm"
    DockerNode          DockerResourceType = "Docker Node"
    DockerPlugin        DockerResourceType = "Docker Plugin"
    DockerSecretType    DockerResourceType = "Docker Secret"
)

// DockerOperation Docker 操作类型
type DockerOperation string

const (
    DockerOpCreate  DockerOperation = "创建"
    DockerOpUpdate  DockerOperation = "更新"
    DockerOpDelete  DockerOperation = "删除"
    DockerOpStart   DockerOperation = "启动"
    DockerOpStop    DockerOperation = "停止"
    DockerOpRestart DockerOperation = "重启"
    DockerOpInspect DockerOperation = "查看"
    DockerOpList    DockerOperation = "列表"
    DockerOpPull    DockerOperation = "拉取"
    DockerOpPush    DockerOperation = "推送"
)

// DockerOperationMapping Docker API 操作到日志操作的映射
type DockerOperationMapping struct {
    ResourceType DockerResourceType
    Operation    DockerOperation
    Loggable     bool // 是否记录日志
}

// operationMappings Docker 操作映射表
var operationMappings = map[string]DockerOperationMapping{
    // Container 操作
    "container_create":   {DockerContainer, DockerOpCreate, true},
    "container_start":     {DockerContainer, DockerOpStart, true},
    "container_stop":      {DockerContainer, DockerOpStop, true},
    "container_restart":   {DockerContainer, DockerOpRestart, true},
    "container_delete":   {DockerContainer, DockerOpDelete, true},
    "container_inspect":  {DockerContainer, DockerOpInspect, false}, // 只读操作，不记录
    "container_list":     {DockerContainer, DockerOpList, false},    // 只读操作，不记录

    // Image 操作
    "image_pull":          {DockerImage, DockerOpPull, true},
    "image_push":          {DockerImage, DockerOpPush, true},
    "image_delete":        {DockerImage, DockerOpDelete, true},
    "image_inspect":       {DockerImage, DockerOpInspect, false},
    "image_list":          {DockerImage, DockerOpList, false},

    // Network 操作
    "network_create":      {DockerNetwork, DockerOpCreate, true},
    "network_delete":      {DockerNetwork, DockerOpDelete, true},
    "network_inspect":     {DockerNetwork, DockerOpInspect, false},
    "network_list":        {DockerNetwork, DockerOpList, false},
    "network_connect":     {DockerNetwork, DockerOpUpdate, true},
    "network_disconnect":  {DockerNetwork, DockerOpUpdate, true},

    // Volume 操作
    "volume_create":       {DockerVolume, DockerOpCreate, true},
    "volume_delete":       {DockerVolume, DockerOpDelete, true},
    "volume_inspect":      {DockerVolume, DockerOpInspect, false},
    "volume_list":         {DockerVolume, DockerOpList, false},

    // Service 操作
    "service_create":      {DockerService, DockerOpCreate, true},
    "service_update":      {DockerService, DockerOpUpdate, true},
    "service_delete":       {DockerService, DockerOpDelete, true},
    "service_inspect":     {DockerService, DockerOpInspect, false},
    "service_list":        {DockerService, DockerOpList, false},
    "service_scale":       {DockerService, DockerOpUpdate, true},

    // Config 操作
    "config_create":       {DockerConfig, DockerOpCreate, true},
    "config_update":       {DockerConfig, DockerOpUpdate, true},
    "config_delete":       {DockerConfig, DockerOpDelete, true},
    "config_inspect":      {DockerConfig, DockerOpInspect, false},
    "config_list":         {DockerConfig, DockerOpList, false},

    // Secret 操作
    "secret_create":       {DockerSecret, DockerOpCreate, true},
    "secret_update":       {DockerSecret, DockerOpUpdate, true},
    "secret_delete":       {DockerSecret, DockerOpDelete, true},
    "secret_inspect":      {DockerSecret, DockerOpInspect, false},
    "secret_list":         {DockerSecret, DockerOpList, false},

    // Node 操作
    "node_update":         {DockerNode, DockerOpUpdate, true},
    "node_inspect":        {DockerNode, DockerOpInspect, false},
    "node_list":           {DockerNode, DockerOpList, false},

    // Swarm 操作
    "swarm_init":          {DockerSwarm, DockerOpCreate, true},
    "swarm_join":          {DockerSwarm, DockerOpUpdate, true},
    "swarm_leave":         {DockerSwarm, DockerOpDelete, true},
}

// DockerLogger Docker 操作日志记录器
type DockerLogger struct {
    endpointID    portainer.EndpointID
    endpointName string
    mu           sync.Mutex
}

// NewDockerLogger 创建 Docker 日志记录器
func NewDockerLogger(endpointID portainer.EndpointID, endpointName string) *DockerLogger {
    return &DockerLogger{
        endpointID:    endpointID,
        endpointName: endpointName,
    }
}

// LogDockerOperation 记录 Docker 操作
func (l *DockerLogger) LogDockerOperation(
    operation string,
    resourceID string,
    resourceName string,
    userID int,
    username string,
    err error,
) {
    mapping, ok := operationMappings[operation]
    if !ok || !mapping.Loggable {
        return // 不记录不支持或不需要记录的操作
    }

    action := string(mapping.Operation)
    description := fmt.Sprintf("%s了%s %s", action, string(mapping.ResourceType), resourceName)

    if err != nil {
        description = fmt.Sprintf("尝试%s %s 失败: %s", action, string(mapping.ResourceType), err.Error())
    }

    payload := map[string]interface{}{
        "description":     description,
        "operation":       operation,
        "resourceType":   string(mapping.ResourceType),
        "resourceID":      resourceID,
        "resourceName":    resourceName,
        "endpoint":        l.endpointName,
        "endpointID":      l.endpointID,
        "success":         err == nil,
    }

    if err != nil {
        payload["error"] = err.Error()
    }

    // 如果没有资源名称，尝试从 ID 提取
    if resourceName == "" && resourceID != "" {
        payload["resourceName"] = l.extractResourceName(operation, resourceID)
    }

    LogActivity(
        userID,
        username,
        action,
        ContextDocker,
        string(mapping.ResourceType),
        resourceID,
        resourceName,
        payload,
    )
}

// extractResourceName 从资源 ID 提取有意义的名称
func (l *DockerLogger) extractResourceName(operation, resourceID string) string {
    // 实际实现中需要调用 Docker API 获取资源名称
    // 这里返回原始 ID 作为后备
    return resourceID
}

// AsyncDockerLogQueue 异步日志队列
type AsyncDockerLogQueue struct {
    logger     *DockerLogger
    queue      chan *DockerLogEntry
    done       chan struct{}
    bufferSize int
}

// DockerLogEntry 日志条目
type DockerLogEntry struct {
    Operation    string
    ResourceID  string
    ResourceName string
    UserID      int
    Username    string
    Err         error
}

// NewAsyncDockerLogQueue 创建异步日志队列
func NewAsyncDockerLogQueue(logger *DockerLogger, bufferSize int) *AsyncDockerLogQueue {
    q := &AsyncDockerLogQueue{
        logger:     logger,
        queue:      make(chan *DockerLogEntry, bufferSize),
        done:       make(chan struct{}),
        bufferSize: bufferSize,
    }
    go q.process()
    return q
}

// process 处理日志队列
func (q *AsyncDockerLogQueue) process() {
    for {
        select {
        case entry := <-q.queue:
            q.logger.LogDockerOperation(
                entry.Operation,
                entry.ResourceID,
                entry.ResourceName,
                entry.UserID,
                entry.Username,
                entry.Err,
            )
        case <-q.done:
            // 处理完队列中的剩余条目
            for {
                select {
                case entry := <-q.queue:
                    q.logger.LogDockerOperation(
                        entry.Operation,
                        entry.ResourceID,
                        entry.ResourceName,
                        entry.UserID,
                        entry.Username,
                        entry.Err,
                    )
                default:
                    return
                }
            }
        }
    }
}

// Enqueue 添加日志条目到队列
func (q *AsyncDockerLogQueue) Enqueue(entry *DockerLogEntry) {
    select {
    case q.queue <- entry:
    default:
        // 队列满，丢弃最旧的日志
        select {
        case <-q.queue:
            q.queue <- entry
        default:
            // 队列仍然满，丢弃新条目
        }
    }
}

// Close 关闭队列
func (q *AsyncDockerLogQueue) Close() {
    close(q.done)
}

// LogDockerOperationAsync 异步记录 Docker 操作
func LogDockerOperationAsync(
    endpointID portainer.EndpointID,
    endpointName string,
    operation string,
    resourceID string,
    resourceName string,
    userID int,
    username string,
    err error,
) {
    globalAsyncDockerLogQueue.Enqueue(&DockerLogEntry{
        Operation:    operation,
        ResourceID:  resourceID,
        ResourceName: resourceName,
        UserID:      userID,
        Username:    username,
        Err:         err,
    })
}

// 全局异步日志队列
var (
    globalAsyncDockerLogQueue     *AsyncDockerLogQueue
    globalAsyncDockerLogQueueOnce sync.Once
)

// InitAsyncDockerLogQueue 初始化全局异步日志队列
func InitAsyncDockerLogQueue(endpointID portainer.EndpointID, endpointName string) {
    globalAsyncDockerLogQueueOnce.Do(func() {
        logger := NewDockerLogger(endpointID, endpointName)
        globalAsyncDockerLogQueue = NewAsyncDockerLogQueue(logger, 1000)
    })
}

// CleanupAsyncDockerLogQueue 清理全局异步日志队列
func CleanupAsyncDockerLogQueue() {
    if globalAsyncDockerLogQueue != nil {
        globalAsyncDockerLogQueue.Close()
        globalAsyncDockerLogQueue = nil
    }
}
```

### 4.3 在 Transport 层集成

**文件路径**: `api/http/proxy/factory/docker/transport.go`

```go
package docker

import (
    "net/http"

    portainer "github.com/portainer/portainer/api"
    "github.com/portainer/portainer/api/http/proxy/factory/utils"
    "github.com/portainer/portainer/api/internal/activitylog"
    "github.com/portainer/portainer/api/internal/authorization"
)

// operationExecutorParams 操作执行器参数
type operationExecutorParams struct {
    // ... 现有字段
}

// Transport HTTP 运输层
type Transport struct {
    // ... 现有字段

    // 新增：Docker 操作日志器
    dockerLogger *activitylog.DockerLogger
}

// NewTransport 创建运输层
func NewTransport(
    // ... 现有参数
) (*Transport, error) {
    transport := &Transport{
        // ... 初始化现有字段
    }

    // 初始化 Docker 日志器
    if err := transport.initDockerLogger(); err != nil {
        return nil, err
    }

    return transport, nil
}

// initDockerLogger 初始化 Docker 日志器
func (t *Transport) initDockerLogger() error {
    endpointID := t.resourceControlEndpointID
    endpointName := t.getEndpointName()

    t.dockerLogger = activitylog.NewDockerLogger(endpointID, endpointName)
    return nil
}

// executeAndLogOperation 执行操作并记录日志
func (t *Transport) executeAndLogOperation(
    operation string,
    executor *operationExecutor,
    operationContext *DockerOperationContext,
) error {
    // 获取操作开始时间
    startTime := activitylog.GetNow()

    // 获取资源 ID 和名称
    resourceID := t.getResourceID(operation, executor)
    resourceName := t.getResourceName(operation, executor)

    // 获取用户信息
    userID := operationContext.UserID
    username := operationContext.Username

    // 执行操作
    err := executor.execute()

    // 记录日志
    if t.dockerLogger != nil {
        t.dockerLogger.LogDockerOperation(
            operation,
            resourceID,
            resourceName,
            userID,
            username,
            err,
        )
    }

    return err
}

// getResourceID 获取资源 ID
func (t *Transport) getResourceID(operation string, executor *operationExecutor) string {
    // 根据操作类型从请求或响应中提取资源 ID
    switch {
    case isContainerOperation(operation):
        return executor.getContainerID()
    case isServiceOperation(operation):
        return executor.getServiceID()
    case isImageOperation(operation):
        return executor.getImageID()
    case isNetworkOperation(operation):
        return executor.getNetworkID()
    case isVolumeOperation(operation):
        return executor.getVolumeID()
    case isConfigOperation(operation):
        return executor.getConfigID()
    case isSecretOperation(operation):
        return executor.getSecretID()
    default:
        return ""
    }
}

// getResourceName 获取资源名称
func (t *Transport) getResourceName(operation string, executor *operationExecutor) string {
    // 根据操作类型从请求或响应中提取资源名称
    switch {
    case isContainerOperation(operation):
        return executor.getContainerName()
    case isServiceOperation(operation):
        return executor.getServiceName()
    case isImageOperation(operation):
        return executor.getImageName()
    case isNetworkOperation(operation):
        return executor.getNetworkName()
    case isVolumeOperation(operation):
        return executor.getVolumeName()
    case isConfigOperation(operation):
        return executor.getConfigName()
    case isSecretOperation(operation):
        return executor.getSecretName()
    default:
        return ""
    }
}

// 辅助函数：判断操作类型
func isContainerOperation(operation string) bool {
    return strings.HasPrefix(operation, "container_")
}

func isServiceOperation(operation string) bool {
    return strings.HasPrefix(operation, "service_")
}

func isImageOperation(operation string) bool {
    return strings.HasPrefix(operation, "image_")
}

func isNetworkOperation(operation string) bool {
    return strings.HasPrefix(operation, "network_")
}

func isVolumeOperation(operation string) bool {
    return strings.HasPrefix(operation, "volume_")
}

func isConfigOperation(operation string) bool {
    return strings.HasPrefix(operation, "config_")
}

func isSecretOperation(operation string) bool {
    return strings.HasPrefix(operation, "secret_")
}

// DockerOperationContext Docker 操作上下文
type DockerOperationContext struct {
    UserID       int
    Username     string
    EndpointID   portainer.EndpointID
    EndpointName string
}
```

### 4.4 Phase 5 实施任务清单

| 序号 | 任务                             | 文件路径                                     | 说明                       |
| ---- | -------------------------------- | -------------------------------------------- | -------------------------- |
| 1    | 创建 Docker 操作映射表           | `api/internal/activitylog/docker_logger.go`  | 定义所有 Docker 操作的映射 |
| 2    | 实现 DockerLogger 结构           | 同上                                         | 日志记录逻辑               |
| 3    | 实现异步日志队列                 | 同上                                         | 高性能异步记录             |
| 4    | 修改 Transport 结构              | `api/http/proxy/factory/docker/transport.go` | 添加 dockerLogger 字段     |
| 5    | 添加 executeAndLogOperation 方法 | 同上                                         | 统一日志记录入口           |
| 6    | 实现各资源 ID/名称提取方法       | 同上                                         | Container/Service/Image 等 |
| 7    | 在各资源代理中调用日志           | `containers.go`, `services.go` 等            | 集成日志钩子               |
| 8    | 添加单元测试                     | `docker_logger_test.go`                      | 测试日志功能               |

---

## 五、翻译文件更新

### 5.1 英文翻译

**文件路径**: `translations/en/translation.json`

```json
{
  "activityLogs": {
    "title": "User Activity Logs",
    "columns": {
      "timestamp": "Time",
      "username": "User",
      "context": "Context",
      "action": "Operation",
      "resourceType": "Resource Type",
      "resourceName": "Resource Name"
    },
    "actions": {
      "create": "Created",
      "update": "Updated",
      "delete": "Deleted",
      "start": "Started",
      "stop": "Stopped",
      "restart": "Restarted",
      "deploy": "Deployed",
      "redeploy": "Redeployed",
      "scale": "Scaled",
      "login": "Login",
      "logout": "Logout"
    },
    "resourceTypes": {
      "dockerContainer": "Docker Container",
      "dockerImage": "Docker Image",
      "dockerNetwork": "Docker Network",
      "dockerVolume": "Docker Volume",
      "dockerService": "Docker Service",
      "dockerConfig": "Docker Config",
      "dockerSecret": "Docker Secret",
      "dockerStack": "Docker Stack",
      "dockerSwarm": "Docker Swarm",
      "k8sDeployment": "Kubernetes Deployment",
      "k8sService": "Kubernetes Service",
      "k8sIngress": "Kubernetes Ingress",
      "k8sConfigMap": "Kubernetes ConfigMap",
      "k8sSecret": "Kubernetes Secret",
      "k8sNamespace": "Namespace",
      "user": "User",
      "team": "Team",
      "endpoint": "Environment",
      "registry": "Registry",
      "customTemplate": "Custom Template",
      "webhook": "Webhook",
      "helmRelease": "Helm Release"
    },
    "details": {
      "title": "Details",
      "basicInfo": "Basic Information",
      "relatedInfo": "Related Information",
      "changes": "Changes",
      "rawData": "Raw JSON Data",
      "resourceId": "Resource ID",
      "resourceName": "Resource Name",
      "resourceType": "Resource Type",
      "team": "Team",
      "endpoint": "Environment",
      "namespace": "Namespace",
      "description": "Description"
    },
    "filter": {
      "title": "Filters",
      "operationType": "Operation Type",
      "resourceType": "Resource Type",
      "environment": "Environment Category",
      "reset": "Reset Filters"
    },
    "export": "Export as CSV",
    "retention": "Activity logs have a maximum retention of 7 days.",
    "advancedFilter": "Advanced Filters",
    "noData": "No activity logs found."
  }
}
```

### 5.2 中文翻译

**文件路径**: `translations/zh-CN/translation.json`

```json
{
  "activityLogs": {
    "title": "用户活动日志",
    "columns": {
      "timestamp": "时间",
      "username": "用户",
      "context": "环境",
      "action": "操作",
      "resourceType": "资源类型",
      "resourceName": "资源名称"
    },
    "actions": {
      "create": "创建",
      "update": "更新",
      "delete": "删除",
      "start": "启动",
      "stop": "停止",
      "restart": "重启",
      "deploy": "部署",
      "redeploy": "重新部署",
      "scale": "扩缩容",
      "login": "登录",
      "logout": "登出"
    },
    "resourceTypes": {
      "dockerContainer": "Docker 容器",
      "dockerImage": "Docker 镜像",
      "dockerNetwork": "Docker 网络",
      "dockerVolume": "Docker 存储卷",
      "dockerService": "Docker Service",
      "dockerConfig": "Docker Config",
      "dockerSecret": "Docker Secret",
      "dockerStack": "Docker 堆栈",
      "dockerSwarm": "Docker Swarm",
      "k8sDeployment": "Kubernetes Deployment",
      "k8sService": "Kubernetes Service",
      "k8sIngress": "Kubernetes Ingress",
      "k8sConfigMap": "Kubernetes ConfigMap",
      "k8sSecret": "Kubernetes Secret",
      "k8sNamespace": "命名空间",
      "user": "用户",
      "team": "团队",
      "endpoint": "环境",
      "registry": "注册表",
      "customTemplate": "自定义模板",
      "webhook": "Webhook",
      "helmRelease": "Helm Release"
    },
    "details": {
      "title": "详情",
      "basicInfo": "基本信息",
      "relatedInfo": "关联信息",
      "changes": "变更详情",
      "rawData": "原始 JSON 数据",
      "resourceId": "资源 ID",
      "resourceName": "资源名称",
      "resourceType": "资源类型",
      "team": "所属团队",
      "endpoint": "环境",
      "namespace": "命名空间",
      "description": "操作描述"
    },
    "filter": {
      "title": "筛选",
      "operationType": "操作类型",
      "resourceType": "资源类型",
      "environment": "环境类别",
      "reset": "重置筛选"
    },
    "export": "导出 CSV",
    "retention": "活动日志最多保留 7 天。",
    "advancedFilter": "高级筛选",
    "noData": "暂无活动日志。"
  }
}
```

---

## 六、实施进度追踪表

### 6.1 Phase 3 任务进度

| 序号 | 任务               | 状态   | 负责人 | 完成日期 |
| ---- | ------------------ | ------ | ------ | -------- |
| 1    | 创建 constants.go  | 待开始 | -      | -        |
| 2    | 创建 builder.go    | 待开始 | -      | -        |
| 3-36 | 改造 34 个 handler | 待开始 | -      | -        |

### 6.2 Phase 4 任务进度

| 序号 | 任务                 | 状态   | 负责人 | 完成日期 |
| ---- | -------------------- | ------ | ------ | -------- |
| 1    | 创建 DetailCard 组件 | 待开始 | -      | -        |
| 2    | 创建 DetailItem 组件 | 待开始 | -      | -        |
| 3    | 创建 StatusIcon 组件 | 待开始 | -      | -        |
| 4    | 增强类型定义         | 待开始 | -      | -        |
| 5    | 改造 SubRow 组件     | 待开始 | -      | -        |
| 6-7  | 扩展映射表           | 待开始 | -      | -        |
| 8    | 改造 FilterBar       | 待开始 | -      | -        |
| 9-10 | 更新翻译文件         | 待开始 | -      | -        |

### 6.3 Phase 5 任务进度

| 序号 | 任务                  | 状态   | 负责人 | 完成日期 |
| ---- | --------------------- | ------ | ------ | -------- |
| 1    | 创建 docker_logger.go | 待开始 | -      | -        |
| 2    | 修改 Transport 结构   | 待开始 | -      | -        |
| 3    | 各资源代理集成        | 待开始 | -      | -        |
| 4    | 单元测试              | 待开始 | -      | -        |

---

## 七、风险与缓解

| 风险              | 影响         | 缓解措施                                    |
| ----------------- | ------------ | ------------------------------------------- |
| 日志量激增        | 存储压力     | 使用异步队列，设置缓冲大小；日志保留期 7 天 |
| 性能影响          | API 响应延迟 | 异步日志记录，不阻塞主流程                  |
| 现有功能破坏      | 系统不稳定   | 完整单元测试，灰度发布                      |
| Docker 代理复杂度 | 实现难度大   | 分步骤实施，先支持关键资源                  |

---

## 八、验收标准

### Phase 3 验收

- [ ] 所有 handler 使用统一的 `ActivityLogBuilder`
- [ ] Payload 包含完整的资源信息和关联信息
- [ ] Action/ResourceType/Context 使用常量定义
- [ ] 代码无硬编码字符串

### Phase 4 验收

- [ ] 详情页面显示结构化卡片
- [ ] 操作类型显示图标和颜色
- [ ] 资源类型显示中文名称和分类
- [ ] 筛选器支持多选和分组
- [ ] 支持时间范围、操作类型、资源类型、上下文筛选

### Phase 5 验收

- [ ] Docker Container/Service/Image 操作被记录
- [ ] 日志包含有意义的资源名称
- [ ] 异步记录不影响 API 性能
- [ ] 日志格式与其他日志一致
