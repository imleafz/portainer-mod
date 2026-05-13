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
	ActionLogin    = "登录"
	ActionLogout   = "登出"
	ActionRegister = "注册"
)

// ResourceType 常量 - 使用准确的资源类型描述
const (
	// Docker 资源
	ResourceTypeDockerContainer = "Docker 容器"
	ResourceTypeDockerImage     = "Docker 镜像"
	ResourceTypeDockerNetwork   = "Docker 网络"
	ResourceTypeDockerVolume    = "Docker 存储卷"
	ResourceTypeDockerService   = "Docker Service"
	ResourceTypeDockerConfig    = "Docker Config"
	ResourceTypeDockerSecret    = "Docker Secret"
	ResourceTypeDockerStack     = "Docker 堆栈"
	ResourceTypeDockerSwarm     = "Docker Swarm"
	ResourceTypeDockerNode      = "Docker Node"
	ResourceTypeDockerPlugin    = "Docker Plugin"

	// Kubernetes 资源
	ResourceTypeK8sDeployment  = "Kubernetes Deployment"
	ResourceTypeK8sService     = "Kubernetes Service"
	ResourceTypeK8sIngress     = "Kubernetes Ingress"
	ResourceTypeK8sConfigMap   = "Kubernetes ConfigMap"
	ResourceTypeK8sSecret      = "Kubernetes Secret"
	ResourceTypeK8sNamespace   = "Kubernetes 命名空间"
	ResourceTypeK8sPod         = "Kubernetes Pod"
	ResourceTypeK8sStatefulSet = "Kubernetes StatefulSet"
	ResourceTypeK8sDaemonSet   = "Kubernetes DaemonSet"
	ResourceTypeK8sJob         = "Kubernetes Job"
	ResourceTypeK8sCronJob     = "Kubernetes CronJob"
	ResourceTypeK8sPV          = "Kubernetes PersistentVolume"
	ResourceTypeK8sPVC         = "Kubernetes PersistentVolumeClaim"

	// Portainer 资源
	ResourceTypeUser            = "用户"
	ResourceTypeTeam            = "团队"
	ResourceTypeTeamMembership  = "团队成员"
	ResourceTypeEndpoint        = "环境"
	ResourceTypeEndpointGroup   = "环境分组"
	ResourceTypeRegistry        = "注册表"
	ResourceTypeCustomTemplate  = "自定义模板"
	ResourceTypeWebhook         = "Webhook"
	ResourceTypeRole            = "角色"
	ResourceTypeTag             = "标签"
	ResourceTypeSettings        = "系统设置"
	ResourceTypeSSL             = "SSL 证书"
	ResourceTypeResourceControl = "访问控制"
	ResourceTypeHelmRelease     = "Helm Release"

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
