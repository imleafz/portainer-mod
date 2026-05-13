package activitylog

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewActivityLogBuilder(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	assert.NotNil(t, builder)
	assert.Equal(t, ActionCreate, builder.action)
	assert.Equal(t, ContextDocker, builder.context)
	assert.Equal(t, ResourceTypeDockerContainer, builder.resourceType)
	assert.NotNil(t, builder.payload)
	assert.Empty(t, builder.payload)
}

func TestActivityLogBuilder_WithUser(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	result := builder.WithUser(123, "testuser")

	assert.Same(t, builder, result)
	assert.Equal(t, 123, builder.userID)
	assert.Equal(t, "testuser", builder.username)
}

func TestActivityLogBuilder_WithResource(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	result := builder.WithResource("resource-123", "my-container")

	assert.Same(t, builder, result)
	assert.Equal(t, "resource-123", builder.resourceID)
	assert.Equal(t, "my-container", builder.resourceName)
}

func TestActivityLogBuilder_WithPayload(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	result := builder.WithPayload("key1", "value1").WithPayload("key2", 123)

	assert.Same(t, builder, result)
	assert.Equal(t, "value1", builder.payload["key1"])
	assert.Equal(t, 123, builder.payload["key2"])
}

func TestActivityLogBuilder_WithDetails(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	details := map[string]interface{}{
		"description": "创建容器成功",
		"endpoint":    "local-docker",
		"image":       "nginx:latest",
	}

	result := builder.WithDetails(details)

	assert.Same(t, builder, result)
	assert.Equal(t, "创建容器成功", builder.payload["description"])
	assert.Equal(t, "local-docker", builder.payload["endpoint"])
	assert.Equal(t, "nginx:latest", builder.payload["image"])
}

func TestActivityLogBuilder_WithDescription(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	result := builder.WithDescription("自定义描述")

	assert.Same(t, builder, result)
	assert.Equal(t, "自定义描述", builder.payload["description"])
}

func TestActivityLogBuilder_WithTeam(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	result := builder.WithTeam("backend-team")

	assert.Same(t, builder, result)
	assert.Equal(t, "backend-team", builder.payload["team"])
}

func TestActivityLogBuilder_WithEndpoint(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	result := builder.WithEndpoint("prod-docker-01")

	assert.Same(t, builder, result)
	assert.Equal(t, "prod-docker-01", builder.payload["endpoint"])
}

func TestActivityLogBuilder_WithNamespace(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextKubernetes, ResourceTypeK8sDeployment)

	result := builder.WithNamespace("default")

	assert.Same(t, builder, result)
	assert.Equal(t, "default", builder.payload["namespace"])
}

func TestActivityLogBuilder_WithResourceTypeName(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	result := builder.WithResourceTypeName("nginx-deployment")

	assert.Same(t, builder, result)
	assert.Equal(t, "nginx-deployment", builder.payload["resourceTypeName"])
}

func TestActivityLogBuilder_WithResourceName(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)

	result := builder.WithResourceName("my-web-app")

	assert.Same(t, builder, result)
	assert.Equal(t, "my-web-app", builder.payload["resourceName"])
}

func TestActivityLogBuilder_GenerateDescription(t *testing.T) {
	testCases := []struct {
		name         string
		action       string
		resourceName string
		expected     string
	}{
		{
			name:         "create container",
			action:       ActionCreate,
			resourceName: "web-server",
			expected:     "创建了web-server",
		},
		{
			name:         "update service",
			action:       ActionUpdate,
			resourceName: "api-service",
			expected:     "更新了api-service",
		},
		{
			name:         "delete volume",
			action:       ActionDelete,
			resourceName: "data-volume",
			expected:     "删除了data-volume",
		},
		{
			name:         "start container",
			action:       ActionStart,
			resourceName: "redis",
			expected:     "启动了redis",
		},
		{
			name:         "stop container",
			action:       ActionStop,
			resourceName: "worker-1",
			expected:     "停止了worker-1",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			builder := NewActivityLogBuilder(tc.action, ContextDocker, ResourceTypeDockerContainer)
			builder.WithResource("id", tc.resourceName)

			description := builder.generateDescription()

			assert.Equal(t, tc.expected, description)
		})
	}
}

func TestActivityLogBuilder_GetPayload(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)
	builder.WithUser(1, "admin")
	builder.WithResource("123", "test-container")
	builder.WithDetails(map[string]interface{}{
		"description": "创建容器",
		"image":       "nginx:latest",
	})

	payload := builder.GetPayload()

	assert.Equal(t, 1, builder.userID)
	assert.Equal(t, "admin", builder.username)
	assert.Equal(t, "123", builder.resourceID)
	assert.Equal(t, "test-container", builder.resourceName)
	assert.Equal(t, "创建容器", payload["description"])
	assert.Equal(t, "nginx:latest", payload["image"])

	payload["extra"] = "test-modification"
	_, exists := builder.payload["extra"]
	assert.False(t, exists, "GetPayload returns a copy, modifications should not affect internal state")
}

func TestActivityLogBuilder_Log_ReturnsNilWhenGlobalLoggerIsNil(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)
	builder.WithUser(1, "testuser")
	builder.WithResource("123", "test-container")

	err := builder.Log()

	assert.Nil(t, err)
}

func TestActivityLogBuilder_Log_SetsDescriptionIfNotProvided(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)
	builder.WithUser(1, "testuser")
	builder.WithResource("123", "test-container")

	_ = builder.Log()

	payload := builder.GetPayload()
	assert.Equal(t, "创建了test-container", payload["description"])
}

func TestActivityLogBuilder_Log_PreservesProvidedDescription(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextDocker, ResourceTypeDockerContainer)
	builder.WithUser(1, "testuser")
	builder.WithResource("123", "test-container")
	builder.WithDescription("自定义操作描述")

	_ = builder.Log()

	payload := builder.GetPayload()
	assert.Equal(t, "自定义操作描述", payload["description"])
}

func TestActivityLogBuilder_ChainedCalls(t *testing.T) {
	builder := NewActivityLogBuilder(ActionCreate, ContextKubernetes, ResourceTypeK8sDeployment).
		WithUser(42, "k8s-admin").
		WithResource("deploy-123", "frontend-app").
		WithNamespace("production").
		WithEndpoint("k8s-prod-01").
		WithDescription("部署前端应用")

	assert.Equal(t, 42, builder.userID)
	assert.Equal(t, "k8s-admin", builder.username)
	assert.Equal(t, "deploy-123", builder.resourceID)
	assert.Equal(t, "frontend-app", builder.resourceName)
	assert.Equal(t, "production", builder.payload["namespace"])
	assert.Equal(t, "k8s-prod-01", builder.payload["endpoint"])
	assert.Equal(t, "部署前端应用", builder.payload["description"])
}
