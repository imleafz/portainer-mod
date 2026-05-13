# 中文回复规则

## 核心规则

**所有输出必须使用简体中文，无例外。** 包括：对话回复、工具调用结果、生成的文件、文档、注释、错误信息。即使用户使用英文提问，也必须用中文回复。

## 工具调用输出

所有工具执行后的结果描述、成功/失败消息、摘要说明必须使用中文：

- 文件操作：`read_file`、`write_file`、`edit_file` 等
- 代码搜索：`codebase_search`、`grep` 等
- 终端命令：`run_terminal_cmd` 执行结果说明
- 其他工具：`todo_write`、`web_search` 等

**示例：**

- ✅ "已成功读取文件 config.json，包含 15 行配置"
- ❌ "Successfully read file config.json, contains 15 lines"

**注意：** 代码中的变量名和函数名可保持英文，但注释、文档和所有说明文字必须是中文。

# AGENTS.md - Portainer Community Edition

This file provides guidelines and commands for agentic coding assistants working in this repository.

## Project Overview

Portainer Community Edition is a container management platform for Docker, Swarm, Kubernetes, and ACI environments. It consists of:

- **Backend**: Go server (api/, pkg/ directories)
- **Frontend**: React/AngularJS application (app/ directory)

## Build Commands

### Full Build

```bash
make build              # Build both client and server
make build-all         # Alias for build (used by CI)
```

### Client (Frontend)

```bash
make build-client      # Build React/AngularJS frontend with webpack
pnpm run build          # Direct webpack build
```

### Server (Backend)

```bash
make build-server      # Build Go binary
```

### Docker Image

```bash
make build-image       # Build Docker image locally
```

### Development

```bash
make dev               # Run both client and server in dev mode
make dev-client        # Start webpack-dev-server (port 8999)
make dev-server        # Run containerized Go server (port 9000)
```

### Dependencies

```bash
make deps              # Download all client and server dependencies
make client-deps       # pnpm install
make server-deps       # Download Go binaries
make tidy              # go mod tidy
```

## Test Commands

### Run All Tests

```bash
make test              # Both server and client tests
```

### Client Tests (Vitest)

```bash
make test-client       # With coverage
pnpm run test          # Direct vitest run
pnpm run test -- --run # Run once (no watch)
pnpm run test -- src/path/to/file.test.ts  # Single test file
pnpm run test -- -t "test name"            # Single test by name
pnpm run test -- --coverage                 # With coverage
```

### Server Tests (Go)

```bash
make test-server       # Uses gotestsum
go test ./...          # Direct go test
go test -v ./pkg/...  # Verbose output
go test -run TestName ./pkg/...  # Single test by name
go test -cover ./pkg/...         # With coverage
```

### Type Checking

```bash
pnpm run typecheck     # TypeScript type checking
```

## Lint Commands

### Lint All

```bash
make lint              # Both client and server
```

### Client Linting

```bash
make lint-client      # ESLint + Prettier
pnpm run lint          # Direct eslint
pnpm run lint -- --cache  # Faster with cache
```

### Server Linting

```bash
make lint-server      # golangci-lint
golangci-lint run -c .golangci.yaml ./...
golangci-lint run --new-from-rev=HEAD~ -c .golangci-forward.yaml  # New code only
```

## Format Commands

```bash
make format           # Format all code
make format-client    # Prettier formatting
make format-server    # go fmt ./...
pnpm run format       # Direct prettier
```

## Code Style Guidelines

### General

- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions small and focused
- Write tests for new functionality

### Go (Backend)

**Imports**: Standard library first, then third-party, then internal packages

```go
import (
    "errors"
    "fmt"
    "time"

    portainer "github.com/portainer/portainer/api"
    "github.com/portainer/portainer/api/dataservices"

    "github.com/gofrs/uuid"
    "github.com/golang-jwt/jwt/v4"
    "github.com/rs/zerolog/log"
)
```

**Error Handling**:

- Use `errors.New()` or `fmt.Errorf()` with `%w` for wrapping
- Return errors early, avoid nested error handling
- Log errors with context using `zerolog`
- Check errors with `errors.Is()` and `errors.As()`

**Naming**:

- Use `camelCase` for variables and functions
- Use `PascalCase` for exported types and functions
- Use `snake_case` for package names in test files (`_test.go`)
- Prefix unexported globals with `_` if unused: `var _ = someInit()`

**Types**:

- Use struct tags for JSON/YAML serialization
- Prefer interfaces for dependency injection
- Use pointer receivers for methods that modify state

**Linter Configuration** (`.golangci.yaml`):

- Enabled linters: bodyclose, copyloopvar, depguard, errcheck, errorlint, forbidigo, govet, ineffassign, staticcheck, testifylint, zerologlint, etc.
- Depguard rules block: `encoding/json` (use `github.com/segmentio/encoding/json`), `golang.org/x/crypto`, `gopkg.in/yaml.v3`
- FIPS mode restrictions apply

### TypeScript/JavaScript (Frontend)

**Imports**: Order: builtin → external → internal → parent → sibling → index

```typescript
import { useState } from 'react';
import axios from 'axios';
import { useAnalytics } from '@/react/hooks/useAnalytics';
import { Button } from './Button';
```

**Alias Paths**:

- `@/` → `./app/` (main app directory)
- `@@/` → `./app/react/components/` (React components)

**Naming**:

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` with `use` prefix
- Utilities: `camelCase.ts`
- Tests: `name.test.ts` or `name.test.tsx`

**TypeScript Rules** (strict mode enabled):

- No `any` types allowed (`@typescript-eslint/no-explicit-any: error`)
- No unused variables (`@typescript-eslint/no-unused-vars: error`)
- Explicit module boundary types not required
- Use `interface` for object shapes, `type` for unions/primitives

**React Patterns**:

- Function components with typed props
- Use React hooks (`useState`, `useEffect`, etc.)
- No class components in new code
- Prop spreading allowed in HOC files (`with*.ts`)

**ESLint Configuration** (`.eslintrc.yml`):

- Airbnb style guide + TypeScript extensions
- React hooks rules enabled
- Import ordering with path groups for aliases

**Prettier Configuration** (`.prettierrc`):

- Print width: 180 (default), 80 for `.ts`/`.tsx` files
- Single quotes
- Trailing commas: es5
- Angular parser for `.html` files

### API Documentation (Swagger)

When adding new routes, add tags to `api/http/handler/handler.go`:

```go
// @tag.name <Name>
// @tag.description <Description>
```

Use swaggo format for route documentation:

```go
// @id MyFeature
// @summary Create something
// @description Description here
// @tags MyFeature
// @security ApiKeyAuth
// @security jwt
// @accept json
// @produce json
// @param body body Object true "details"
// @success 200 {object} Object "Success"
// @failure 400 "Bad Request"
// @router /api endpoint [post]
```

## Directory Structure

```
/api                 # Go backend
  /http/handler/    # HTTP handlers
  /dataservices/    # Data access layer
  /datastore/       # Database operations
  /jwt/             # JWT authentication
  /docker/         # Docker client wrappers
  /kubernetes/     # Kubernetes client wrappers
  /pkg/            # Shared packages

/app                # Frontend
  /react/          # React components
  /portainer/      # AngularJS components
  /docker/         # Docker-related components
  /kubernetes/     # Kubernetes components
  /agent/          # Agent-related components

/build              # Build scripts and Dockerfiles
/pkg                # Shared Go packages
```

## Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scopes: containers, networks, images, templates, etc.
```

Example: `feat(containers): add exposed ports in the containers view`

## Environment

- **Go**: 1.25.8
- **Node.js**: ^22
- **Package Manager**: pnpm 10+
- **Frontend**: React 17, AngularJS 1.8.2, TypeScript 5
- **Testing**: Vitest (frontend), gotestsum (backend)
- **Linting**: ESLint, golangci-lint

## Internationalization (i18n) Guidelines

### Translation Workflow

Portainer uses `react-i18next` for frontend internationalization.

**Translation Files**:

- English (source): `translations/en/translation.json`
- Chinese (target): `translations/zh-CN/translation.json`

**How Translations Work**:

1. Import `useTranslation` hook: `import { useTranslation } from 'react-i18next';`
2. Use `t('key')` function to translate strings: `label={t('sidebar.home')}`
3. Namespace structure follows `模块.子模块.具体内容` pattern

### Translation Rules

#### 1. Technical Terms - ALWAYS Keep in English

**Container Orchestration**:

- Kubernetes resources: `Pod`, `Service`, `Deployment`, `StatefulSet`, `DaemonSet`, `ConfigMap`, `Secret`, `Ingress`, `Namespace`, `Node`, `PersistentVolume`, `PersistentVolumeClaim`, `ServiceAccount`, `Role`, `ClusterRole`, `RoleBinding`, `ClusterRoleBinding`, `Job`, `CronJob`, `IngressClass`, `StorageClass`
- Docker Swarm: `Swarm`, `Stack`, `Service`, `Container`, `Image`, `Network`, `Volume`, `Secret`, `Config`, `Node`, `Manager`, `Worker`
- Helm: `Helm`, `Chart` (can be translated as "Helm 图表"), `Release`, `Repository`, `Values`

**Platform Features**:

- Edge computing: `Edge`, `Edge Agent`, `Edge Group`, `Edge Stack`, `Edge Job`, `Edge Configuration`, `Waiting Room`
- Access control: `Access Control`, `LDAP`, `OAuth`, `JWT`, `API Key`, `Token`
- Networking: `ClusterIP`, `NodePort`, `LoadBalancer`, `Ingress`, `TLS`, `Certificate`

**Portainer-specific**:

- `Portainer`, `Endpoint` (can be translated as "环境"), `Registry`, `Template`

#### 2. Acceptable Translations for Technical Terms

| English     | Chinese (Acceptable) | Notes                                           |
| ----------- | -------------------- | ----------------------------------------------- |
| Cluster     | 集群                 | Acceptable                                      |
| Namespace   | 命名空间             | Acceptable                                      |
| Volume      | 存储卷               | Acceptable                                      |
| Application | 应用                 | Acceptable, but "Application" in UI should stay |
| Dashboard   | 仪表板               | Acceptable                                      |
| Registry    | 注册表               | Acceptable                                      |
| Template    | 模板                 | Acceptable                                      |
| Container   | 容器                 | Acceptable                                      |
| Image       | 镜像                 | Acceptable                                      |
| Network     | 网络                 | Acceptable                                      |

#### 3. UI Action Words - Always Translate

| English  | Chinese   |
| -------- | --------- |
| Save     | 保存      |
| Cancel   | 取消      |
| Delete   | 删除      |
| Edit     | 编辑      |
| Create   | 创建      |
| Search   | 搜索      |
| Filter   | 筛选      |
| Refresh  | 刷新      |
| Confirm  | 确认      |
| Close    | 关闭      |
| Back     | 返回      |
| Next     | 下一步    |
| Previous | 上一步    |
| Loading  | 加载中... |
| Actions  | 操作      |
| Details  | 详情      |
| Settings | 设置      |
| General  | 常规      |

#### 4. Translation Key Naming Convention

```json
{
  "module": {
    "subModule": {
      "specificElement": "Translation",
      " camelCase  key": "Use camelCase for keys"
    }
  }
}
```

**Examples**:

- `sidebar.home` - Sidebar home link
- `kubernetes.ingress.createIngress` - Create ingress button
- `docker.container.renameContainer` - Rename container action
- `common.loading` - Common loading message
- `errors.notAuthorized` - Not authorized error

#### 5. Translation with Variables

Use `{{variable}}` syntax for dynamic values:

```json
{
  "selectHelmChartFrom": "从 {{name}} 选择 Helm 图表",
  "containerRenamed": "容器已成功重命名为 {{name}}"
}
```

#### 6. Translation with HTML

When translation contains HTML, use React elements or safe HTML:

```json
{
  "webhookDescription": "创建 Webhook（或回调 URI）以自动化此堆栈的更新。"
}
```

#### 7. Common Mistakes to Avoid

❌ **WRONG**: Translating Kubernetes resource types

```json
"ingresses": "入口"  // WRONG - Ingress is a K8s resource type
"configMapsAndSecrets": "配置映射与密钥"  // WRONG - K8s resource types
```

✅ **CORRECT**: Keep Kubernetes resource types in English

```json
"ingresses": "Ingress",
"configMapsAndSecrets": "ConfigMaps & Secrets",
"serviceAccounts": "Service Accounts",
"clusterRoles": "Cluster Roles"
```

❌ **WRONG**: Over-translating generic terms

```json
"volumes": "卷"  // WRONG - too literal
"registries": "注册器"  // WRONG - unusual term
```

✅ **CORRECT**: Use commonly accepted translations

```json
"volumes": "存储卷",
"registries": "注册表"
```

### Example: Sidebar Translation

```tsx
// BEFORE (hardcoded English)
<SidebarItem label="Ingresses" ... />

// AFTER (using i18n)
<SidebarItem label={t('sidebar.ingresses')} ... />
```

```json
// translations/en/translation.json
{
  "sidebar": {
    "ingresses": "Ingresses",
    "configMapsAndSecrets": "ConfigMaps & Secrets"
  }
}

// translations/zh-CN/translation.json
{
  "sidebar": {
    "ingresses": "Ingress",
    "configMapsAndSecrets": "ConfigMaps & Secrets"
  }
}
```
