package activitylog

import (
	"testing"

	portainer "github.com/portainer/portainer/api"
	"github.com/stretchr/testify/assert"
)

func TestNewDockerLogger(t *testing.T) {
	endpointID := portainer.EndpointID(123)
	endpointName := "test-docker-01"

	logger := NewDockerLogger(endpointID, endpointName)

	assert.NotNil(t, logger)
	assert.Equal(t, endpointID, logger.endpointID)
	assert.Equal(t, endpointName, logger.endpointName)
}

func TestOperationMappings(t *testing.T) {
	testCases := []struct {
		operation    string
		resourceType DockerResourceType
		operation_   DockerOperation
		loggable     bool
	}{
		{"container_create", DockerContainer, DockerOpCreate, true},
		{"container_start", DockerContainer, DockerOpStart, true},
		{"container_stop", DockerContainer, DockerOpStop, true},
		{"container_restart", DockerContainer, DockerOpRestart, true},
		{"container_delete", DockerContainer, DockerOpDelete, true},
		{"container_inspect", DockerContainer, DockerOpInspect, false},
		{"container_list", DockerContainer, DockerOpList, false},
		{"image_pull", DockerImage, DockerOpPull, true},
		{"image_push", DockerImage, DockerOpPush, true},
		{"image_delete", DockerImage, DockerOpDelete, true},
		{"image_inspect", DockerImage, DockerOpInspect, false},
		{"image_list", DockerImage, DockerOpList, false},
		{"network_create", DockerNetwork, DockerOpCreate, true},
		{"network_delete", DockerNetwork, DockerOpDelete, true},
		{"network_inspect", DockerNetwork, DockerOpInspect, false},
		{"network_list", DockerNetwork, DockerOpList, false},
		{"network_connect", DockerNetwork, DockerOpUpdate, true},
		{"network_disconnect", DockerNetwork, DockerOpUpdate, true},
		{"volume_create", DockerVolume, DockerOpCreate, true},
		{"volume_delete", DockerVolume, DockerOpDelete, true},
		{"volume_inspect", DockerVolume, DockerOpInspect, false},
		{"volume_list", DockerVolume, DockerOpList, false},
		{"service_create", DockerService, DockerOpCreate, true},
		{"service_update", DockerService, DockerOpUpdate, true},
		{"service_delete", DockerService, DockerOpDelete, true},
		{"service_inspect", DockerService, DockerOpInspect, false},
		{"service_list", DockerService, DockerOpList, false},
		{"service_scale", DockerService, DockerOpUpdate, true},
		{"config_create", DockerConfig, DockerOpCreate, true},
		{"config_update", DockerConfig, DockerOpUpdate, true},
		{"config_delete", DockerConfig, DockerOpDelete, true},
		{"config_inspect", DockerConfig, DockerOpInspect, false},
		{"config_list", DockerConfig, DockerOpList, false},
		{"secret_create", DockerSecret, DockerOpCreate, true},
		{"secret_update", DockerSecret, DockerOpUpdate, true},
		{"secret_delete", DockerSecret, DockerOpDelete, true},
		{"secret_inspect", DockerSecret, DockerOpInspect, false},
		{"secret_list", DockerSecret, DockerOpList, false},
		{"node_update", DockerNode, DockerOpUpdate, true},
		{"node_inspect", DockerNode, DockerOpInspect, false},
		{"node_list", DockerNode, DockerOpList, false},
		{"swarm_init", DockerSwarm, DockerOpCreate, true},
		{"swarm_join", DockerSwarm, DockerOpUpdate, true},
		{"swarm_leave", DockerSwarm, DockerOpDelete, true},
	}

	for _, tc := range testCases {
		t.Run(tc.operation, func(t *testing.T) {
			mapping, ok := operationMappings[tc.operation]
			assert.True(t, ok, "operation %s should exist in mappings", tc.operation)
			assert.Equal(t, tc.resourceType, mapping.ResourceType)
			assert.Equal(t, tc.operation_, mapping.Operation)
			assert.Equal(t, tc.loggable, mapping.Loggable)
		})
	}
}

func TestOperationMappings_UnknownOperation(t *testing.T) {
	mapping, ok := operationMappings["unknown_operation"]
	assert.False(t, ok)
	assert.Empty(t, mapping.ResourceType)
	assert.Empty(t, mapping.Operation)
	assert.False(t, mapping.Loggable)
}

func TestDockerResourceTypeConstants(t *testing.T) {
	assert.Equal(t, DockerResourceType("Docker 容器"), DockerContainer)
	assert.Equal(t, DockerResourceType("Docker 镜像"), DockerImage)
	assert.Equal(t, DockerResourceType("Docker 网络"), DockerNetwork)
	assert.Equal(t, DockerResourceType("Docker 存储卷"), DockerVolume)
	assert.Equal(t, DockerResourceType("Docker Service"), DockerService)
	assert.Equal(t, DockerResourceType("Docker Config"), DockerConfig)
	assert.Equal(t, DockerResourceType("Docker Secret"), DockerSecret)
	assert.Equal(t, DockerResourceType("Docker 堆栈"), DockerStack)
	assert.Equal(t, DockerResourceType("Docker Swarm"), DockerSwarm)
	assert.Equal(t, DockerResourceType("Docker Node"), DockerNode)
}

func TestDockerOperationConstants(t *testing.T) {
	assert.Equal(t, DockerOperation("创建"), DockerOpCreate)
	assert.Equal(t, DockerOperation("更新"), DockerOpUpdate)
	assert.Equal(t, DockerOperation("删除"), DockerOpDelete)
	assert.Equal(t, DockerOperation("启动"), DockerOpStart)
	assert.Equal(t, DockerOperation("停止"), DockerOpStop)
	assert.Equal(t, DockerOperation("重启"), DockerOpRestart)
	assert.Equal(t, DockerOperation("查看"), DockerOpInspect)
	assert.Equal(t, DockerOperation("列表"), DockerOpList)
	assert.Equal(t, DockerOperation("拉取"), DockerOpPull)
	assert.Equal(t, DockerOperation("推送"), DockerOpPush)
}

func TestNewAsyncDockerLogQueue(t *testing.T) {
	logger := NewDockerLogger(portainer.EndpointID(1), "test")
	bufferSize := 100

	queue := NewAsyncDockerLogQueue(logger, bufferSize)

	assert.NotNil(t, queue)
	assert.Equal(t, logger, queue.logger)
	assert.Equal(t, bufferSize, queue.bufferSize)
	assert.NotNil(t, queue.queue)
	assert.NotNil(t, queue.done)
}

func TestAsyncDockerLogQueue_Enqueue(t *testing.T) {
	logger := NewDockerLogger(portainer.EndpointID(1), "test")
	queue := NewAsyncDockerLogQueue(logger, 10)

	entry := &DockerLogEntry{
		Operation:    "container_create",
		ResourceID:   "123",
		ResourceName: "test-container",
		UserID:       1,
		Username:     "admin",
		Err:          nil,
	}

	queue.Enqueue(entry)

	assert.NotEmpty(t, queue.queue)
}

func TestAsyncDockerLogQueue_Close(t *testing.T) {
	logger := NewDockerLogger(portainer.EndpointID(1), "test")
	queue := NewAsyncDockerLogQueue(logger, 10)

	queue.Close()

	select {
	case <-queue.done:
	default:
		t.Error("queue.done should be closed after Close()")
	}
}

func TestDockerLogEntry(t *testing.T) {
	entry := &DockerLogEntry{
		Operation:    "container_create",
		ResourceID:   "abc123",
		ResourceName: "web-server",
		UserID:       42,
		Username:     "testuser",
		Err:          nil,
	}

	assert.Equal(t, "container_create", entry.Operation)
	assert.Equal(t, "abc123", entry.ResourceID)
	assert.Equal(t, "web-server", entry.ResourceName)
	assert.Equal(t, 42, entry.UserID)
	assert.Equal(t, "testuser", entry.Username)
	assert.Nil(t, entry.Err)
}

func TestGlobalAsyncQueueFunctions(t *testing.T) {
	assert.Nil(t, globalAsyncDockerLogQueue)
}
