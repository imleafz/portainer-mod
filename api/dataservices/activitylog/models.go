package activitylog

type (
	ActivityLog struct {
		ID           int64  `json:"id"`
		Timestamp    int64  `json:"timestamp"`
		UserID       int    `json:"user_id"`
		Username     string `json:"username"`
		Action       string `json:"action"`
		Context      string `json:"context"`
		ResourceType string `json:"resource_type,omitempty"`
		ResourceID   string `json:"resource_id,omitempty"`
		ResourceName string `json:"resource_name,omitempty"`
		Payload      []byte `json:"payload,omitempty"`
		CreatedAt    int64  `json:"created_at"`
	}

	AuthLog struct {
		ID           int64  `json:"id"`
		Timestamp    int64  `json:"timestamp"`
		Username     string `json:"username"`
		AuthMethod   int    `json:"auth_method"`
		ActivityType int    `json:"activity_type"`
		Origin       string `json:"origin,omitempty"`
		Success      bool   `json:"success"`
		CreatedAt    int64  `json:"created_at"`
	}
)

const (
	AuthMethodInternal = 1
	AuthMethodLDAP     = 2
	AuthMethodOAuth    = 3

	ActivityTypeAuthSuccess = 1
	ActivityTypeAuthFailure = 2
	ActivityTypeLogout      = 3
)
