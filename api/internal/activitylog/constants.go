package activitylog

import "github.com/portainer/portainer/api/dataservices/activitylog"

// 重新导出 dataservices/activitylog 中的常量，供外部使用

const (
	// Action 常量
	ActionCreate   = activitylog.ActionCreate
	ActionUpdate   = activitylog.ActionUpdate
	ActionDelete   = activitylog.ActionDelete
	ActionStart    = activitylog.ActionStart
	ActionStop     = activitylog.ActionStop
	ActionRestart  = activitylog.ActionRestart
	ActionDeploy   = activitylog.ActionDeploy
	ActionRedeploy = activitylog.ActionRedeploy
	ActionScale    = activitylog.ActionScale
	ActionToggle   = activitylog.ActionToggle
	ActionImport   = activitylog.ActionImport
	ActionExport   = activitylog.ActionExport
	ActionLogin    = activitylog.ActionLogin
	ActionLogout   = activitylog.ActionLogout
	ActionRegister = activitylog.ActionRegister

	// ResourceType 常量
	ResourceTypeDockerContainer = activitylog.ResourceTypeDockerContainer
	ResourceTypeDockerImage     = activitylog.ResourceTypeDockerImage
	ResourceTypeDockerNetwork   = activitylog.ResourceTypeDockerNetwork
	ResourceTypeDockerVolume    = activitylog.ResourceTypeDockerVolume
	ResourceTypeDockerService   = activitylog.ResourceTypeDockerService
	ResourceTypeDockerConfig    = activitylog.ResourceTypeDockerConfig
	ResourceTypeDockerSecret    = activitylog.ResourceTypeDockerSecret
	ResourceTypeDockerStack     = activitylog.ResourceTypeDockerStack
	ResourceTypeDockerSwarm     = activitylog.ResourceTypeDockerSwarm
	ResourceTypeDockerNode      = activitylog.ResourceTypeDockerNode
	ResourceTypeDockerPlugin    = activitylog.ResourceTypeDockerPlugin
	ResourceTypeK8sDeployment   = activitylog.ResourceTypeK8sDeployment
	ResourceTypeK8sService      = activitylog.ResourceTypeK8sService
	ResourceTypeK8sIngress      = activitylog.ResourceTypeK8sIngress
	ResourceTypeK8sConfigMap    = activitylog.ResourceTypeK8sConfigMap
	ResourceTypeK8sSecret       = activitylog.ResourceTypeK8sSecret
	ResourceTypeK8sNamespace    = activitylog.ResourceTypeK8sNamespace
	ResourceTypeK8sPod          = activitylog.ResourceTypeK8sPod
	ResourceTypeK8sStatefulSet  = activitylog.ResourceTypeK8sStatefulSet
	ResourceTypeK8sDaemonSet    = activitylog.ResourceTypeK8sDaemonSet
	ResourceTypeK8sJob          = activitylog.ResourceTypeK8sJob
	ResourceTypeK8sCronJob      = activitylog.ResourceTypeK8sCronJob
	ResourceTypeK8sPV           = activitylog.ResourceTypeK8sPV
	ResourceTypeK8sPVC          = activitylog.ResourceTypeK8sPVC
	ResourceTypeUser            = activitylog.ResourceTypeUser
	ResourceTypeTeam            = activitylog.ResourceTypeTeam
	ResourceTypeTeamMembership  = activitylog.ResourceTypeTeamMembership
	ResourceTypeEndpoint        = activitylog.ResourceTypeEndpoint
	ResourceTypeEndpointGroup   = activitylog.ResourceTypeEndpointGroup
	ResourceTypeRegistry        = activitylog.ResourceTypeRegistry
	ResourceTypeCustomTemplate  = activitylog.ResourceTypeCustomTemplate
	ResourceTypeWebhook         = activitylog.ResourceTypeWebhook
	ResourceTypeRole            = activitylog.ResourceTypeRole
	ResourceTypeTag             = activitylog.ResourceTypeTag
	ResourceTypeSettings        = activitylog.ResourceTypeSettings
	ResourceTypeSSL             = activitylog.ResourceTypeSSL
	ResourceTypeResourceControl = activitylog.ResourceTypeResourceControl
	ResourceTypeHelmRelease     = activitylog.ResourceTypeHelmRelease
	ResourceTypeEdgeGroup       = activitylog.ResourceTypeEdgeGroup
	ResourceTypeEdgeJob         = activitylog.ResourceTypeEdgeJob
	ResourceTypeEdgeStack       = activitylog.ResourceTypeEdgeStack

	// Context 常量
	ContextDocker     = activitylog.ContextDocker
	ContextKubernetes = activitylog.ContextKubernetes
	ContextPortainer  = activitylog.ContextPortainer
	ContextEdge       = activitylog.ContextEdge
)
