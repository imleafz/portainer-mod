package activitylog

import "fmt"

type ActivityLogBuilder struct {
	userID       int
	username     string
	action       string
	context      string
	resourceType string
	resourceID   string
	resourceName string
	payload      map[string]interface{}
}

func NewActivityLogBuilder(action, context, resourceType string) *ActivityLogBuilder {
	return &ActivityLogBuilder{
		action:       action,
		context:      context,
		resourceType: resourceType,
		payload:      make(map[string]interface{}),
	}
}

func (b *ActivityLogBuilder) WithUser(userID int, username string) *ActivityLogBuilder {
	b.userID = userID
	b.username = username
	return b
}

func (b *ActivityLogBuilder) WithResource(id, name string) *ActivityLogBuilder {
	b.resourceID = id
	b.resourceName = name
	return b
}

func (b *ActivityLogBuilder) WithPayload(key string, value interface{}) *ActivityLogBuilder {
	b.payload[key] = value
	return b
}

func (b *ActivityLogBuilder) WithDetails(details map[string]interface{}) *ActivityLogBuilder {
	for k, v := range details {
		b.payload[k] = v
	}
	return b
}

func (b *ActivityLogBuilder) WithDescription(description string) *ActivityLogBuilder {
	b.payload["description"] = description
	return b
}

func (b *ActivityLogBuilder) WithTeam(teamName string) *ActivityLogBuilder {
	b.payload["team"] = teamName
	return b
}

func (b *ActivityLogBuilder) WithEndpoint(endpointName string) *ActivityLogBuilder {
	b.payload["endpoint"] = endpointName
	return b
}

func (b *ActivityLogBuilder) WithNamespace(namespace string) *ActivityLogBuilder {
	b.payload["namespace"] = namespace
	return b
}

func (b *ActivityLogBuilder) WithResourceTypeName(resourceTypeName string) *ActivityLogBuilder {
	b.payload["resourceTypeName"] = resourceTypeName
	return b
}

func (b *ActivityLogBuilder) WithResourceName(resourceName string) *ActivityLogBuilder {
	b.payload["resourceName"] = resourceName
	return b
}

func (b *ActivityLogBuilder) Log() error {
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

func (b *ActivityLogBuilder) generateDescription() string {
	return fmt.Sprintf("%s了%s", b.action, b.resourceName)
}

func (b *ActivityLogBuilder) GetPayload() map[string]interface{} {
	result := make(map[string]interface{})
	for k, v := range b.payload {
		result[k] = v
	}
	return result
}
