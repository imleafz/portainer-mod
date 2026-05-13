package activitylog

import (
	"fmt"
	"sync"

	portainer "github.com/portainer/portainer/api"
)

type DockerResourceType string

const (
	DockerContainer DockerResourceType = "Docker 容器"
	DockerImage     DockerResourceType = "Docker 镜像"
	DockerNetwork   DockerResourceType = "Docker 网络"
	DockerVolume    DockerResourceType = "Docker 存储卷"
	DockerService   DockerResourceType = "Docker Service"
	DockerConfig    DockerResourceType = "Docker Config"
	DockerSecret    DockerResourceType = "Docker Secret"
	DockerStack     DockerResourceType = "Docker 堆栈"
	DockerSwarm     DockerResourceType = "Docker Swarm"
	DockerNode      DockerResourceType = "Docker Node"
)

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

type DockerOperationMapping struct {
	ResourceType DockerResourceType
	Operation    DockerOperation
	Loggable     bool
}

var operationMappings = map[string]DockerOperationMapping{
	"container_create":   {DockerContainer, DockerOpCreate, true},
	"container_start":    {DockerContainer, DockerOpStart, true},
	"container_stop":     {DockerContainer, DockerOpStop, true},
	"container_restart":  {DockerContainer, DockerOpRestart, true},
	"container_delete":   {DockerContainer, DockerOpDelete, true},
	"container_inspect":  {DockerContainer, DockerOpInspect, false},
	"container_list":     {DockerContainer, DockerOpList, false},
	"image_pull":         {DockerImage, DockerOpPull, true},
	"image_push":         {DockerImage, DockerOpPush, true},
	"image_delete":       {DockerImage, DockerOpDelete, true},
	"image_inspect":      {DockerImage, DockerOpInspect, false},
	"image_list":         {DockerImage, DockerOpList, false},
	"network_create":     {DockerNetwork, DockerOpCreate, true},
	"network_delete":     {DockerNetwork, DockerOpDelete, true},
	"network_inspect":    {DockerNetwork, DockerOpInspect, false},
	"network_list":       {DockerNetwork, DockerOpList, false},
	"network_connect":    {DockerNetwork, DockerOpUpdate, true},
	"network_disconnect": {DockerNetwork, DockerOpUpdate, true},
	"volume_create":      {DockerVolume, DockerOpCreate, true},
	"volume_delete":      {DockerVolume, DockerOpDelete, true},
	"volume_inspect":     {DockerVolume, DockerOpInspect, false},
	"volume_list":        {DockerVolume, DockerOpList, false},
	"service_create":     {DockerService, DockerOpCreate, true},
	"service_update":     {DockerService, DockerOpUpdate, true},
	"service_delete":     {DockerService, DockerOpDelete, true},
	"service_inspect":    {DockerService, DockerOpInspect, false},
	"service_list":       {DockerService, DockerOpList, false},
	"service_scale":      {DockerService, DockerOpUpdate, true},
	"config_create":      {DockerConfig, DockerOpCreate, true},
	"config_update":      {DockerConfig, DockerOpUpdate, true},
	"config_delete":      {DockerConfig, DockerOpDelete, true},
	"config_inspect":     {DockerConfig, DockerOpInspect, false},
	"config_list":        {DockerConfig, DockerOpList, false},
	"secret_create":      {DockerSecret, DockerOpCreate, true},
	"secret_update":      {DockerSecret, DockerOpUpdate, true},
	"secret_delete":      {DockerSecret, DockerOpDelete, true},
	"secret_inspect":     {DockerSecret, DockerOpInspect, false},
	"secret_list":        {DockerSecret, DockerOpList, false},
	"node_update":        {DockerNode, DockerOpUpdate, true},
	"node_inspect":       {DockerNode, DockerOpInspect, false},
	"node_list":          {DockerNode, DockerOpList, false},
	"swarm_init":         {DockerSwarm, DockerOpCreate, true},
	"swarm_join":         {DockerSwarm, DockerOpUpdate, true},
	"swarm_leave":        {DockerSwarm, DockerOpDelete, true},
}

type DockerLogger struct {
	endpointID   portainer.EndpointID
	endpointName string
	mu           sync.Mutex
}

func NewDockerLogger(endpointID portainer.EndpointID, endpointName string) *DockerLogger {
	return &DockerLogger{
		endpointID:   endpointID,
		endpointName: endpointName,
	}
}

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
		return
	}

	action := string(mapping.Operation)
	name := resourceName
	if name == "" && resourceID != "" {
		name = "#" + resourceID
	}
	description := fmt.Sprintf("%s了%s %s", action, string(mapping.ResourceType), name)

	if err != nil {
		description = fmt.Sprintf("尝试%s %s 失败: %s", action, string(mapping.ResourceType), err.Error())
	}

	payload := map[string]interface{}{
		"description":  description,
		"operation":    operation,
		"resourceType": string(mapping.ResourceType),
		"resourceID":   resourceID,
		"resourceName": name,
		"endpoint":     l.endpointName,
		"endpointID":   l.endpointID,
		"success":      err == nil,
	}

	if err != nil {
		payload["error"] = err.Error()
	}

	LogActivity(
		userID,
		username,
		action,
		ContextDocker,
		string(mapping.ResourceType),
		resourceID,
		name,
		payload,
	)
}

type AsyncDockerLogQueue struct {
	logger     *DockerLogger
	queue      chan *DockerLogEntry
	done       chan struct{}
	bufferSize int
}

type DockerLogEntry struct {
	Operation    string
	ResourceID   string
	ResourceName string
	UserID       int
	Username     string
	Err          error
}

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

func (q *AsyncDockerLogQueue) Enqueue(entry *DockerLogEntry) {
	select {
	case q.queue <- entry:
	default:
		select {
		case <-q.queue:
			q.queue <- entry
		default:
		}
	}
}

func (q *AsyncDockerLogQueue) Close() {
	close(q.done)
}

var (
	globalAsyncDockerLogQueue     *AsyncDockerLogQueue
	globalAsyncDockerLogQueueOnce sync.Once
)

func InitAsyncDockerLogQueue(endpointID portainer.EndpointID, endpointName string) {
	globalAsyncDockerLogQueueOnce.Do(func() {
		logger := NewDockerLogger(endpointID, endpointName)
		globalAsyncDockerLogQueue = NewAsyncDockerLogQueue(logger, 1000)
	})
}

func CleanupAsyncDockerLogQueue() {
	if globalAsyncDockerLogQueue != nil {
		globalAsyncDockerLogQueue.Close()
		globalAsyncDockerLogQueue = nil
	}
}

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
	if globalAsyncDockerLogQueue != nil {
		globalAsyncDockerLogQueue.Enqueue(&DockerLogEntry{
			Operation:    operation,
			ResourceID:   resourceID,
			ResourceName: resourceName,
			UserID:       userID,
			Username:     username,
			Err:          err,
		})
	}
}
