package activitylog

import (
	"bytes"
	"encoding/json"
	"sync"
	"time"

	"github.com/portainer/portainer/api/dataservices/activitylog"

	"github.com/rs/zerolog/log"
)

type Logger struct {
	activityLogService activitylog.ActivityLogService
	authLogService     activitylog.AuthLogService
	isEnabled          bool
	mu                 sync.RWMutex
}

var (
	globalLogger *Logger
	loggerMu     sync.RWMutex
)

func NewLogger(activityLogService activitylog.ActivityLogService, authLogService activitylog.AuthLogService) *Logger {
	logger := &Logger{
		activityLogService: activityLogService,
		authLogService:     authLogService,
		isEnabled:          false,
	}
	loggerMu.Lock()
	globalLogger = logger
	loggerMu.Unlock()
	return logger
}

func SetEnabled(enabled bool) {
	loggerMu.RLock()
	defer loggerMu.RUnlock()
	if globalLogger != nil {
		globalLogger.SetEnabled(enabled)
	}
}

func SetEnabledGlobal(enabled bool) {
	loggerMu.RLock()
	defer loggerMu.RUnlock()
	if globalLogger != nil {
		globalLogger.SetEnabled(enabled)
	}
}

func (l *Logger) SetEnabled(enabled bool) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.isEnabled = enabled
}

func (l *Logger) IsEnabled() bool {
	l.mu.RLock()
	defer l.mu.RUnlock()
	return l.isEnabled
}

func LogActivity(userID int, username, action, context, resourceType, resourceID, resourceName string, payload interface{}) error {
	loggerMu.RLock()
	defer loggerMu.RUnlock()
	if globalLogger != nil {
		return globalLogger.LogActivity(userID, username, action, context, resourceType, resourceID, resourceName, payload)
	}
	return nil
}

func LogAuthSuccess(username string, authMethod int, origin string) error {
	loggerMu.RLock()
	defer loggerMu.RUnlock()
	if globalLogger != nil {
		return globalLogger.LogAuthSuccess(username, authMethod, origin)
	}
	return nil
}

func LogAuthFailure(username string, authMethod int, origin string) error {
	loggerMu.RLock()
	defer loggerMu.RUnlock()
	if globalLogger != nil {
		return globalLogger.LogAuthFailure(username, authMethod, origin)
	}
	return nil
}

func LogLogout(username string, authMethod int, origin string) error {
	loggerMu.RLock()
	defer loggerMu.RUnlock()
	if globalLogger != nil {
		return globalLogger.LogLogout(username, authMethod, origin)
	}
	return nil
}

func (l *Logger) LogActivity(userID int, username, action, context, resourceType, resourceID, resourceName string, payload interface{}) error {
	if !l.IsEnabled() {
		return nil
	}
	if l.activityLogService == nil {
		return nil
	}

	var payloadBytes []byte
	buf := &bytes.Buffer{}
	encoder := json.NewEncoder(buf)
	encoder.SetEscapeHTML(false)
	err := encoder.Encode(payload)
	if err == nil {
		payloadBytes = bytes.TrimSuffix(buf.Bytes(), []byte("\n"))
	} else {
		payloadBytes = []byte{}
	}
	if err != nil {
		payloadBytes = []byte{}
	}

	activityLog := &activitylog.ActivityLog{
		Timestamp:    time.Now().UnixMilli(),
		UserID:       userID,
		Username:     username,
		Action:       action,
		Context:      context,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		ResourceName: resourceName,
		Payload:      payloadBytes,
		CreatedAt:    time.Now().UnixMilli(),
	}

	err = l.activityLogService.Create(activityLog)
	if err != nil {
		log.Error().Err(err).Msg("failed to create activity log")
		return err
	}

	log.Debug().
		Int("userID", userID).
		Str("username", username).
		Str("action", action).
		Str("context", context).
		Str("resourceType", resourceType).
		Str("resourceID", resourceID).
		Str("resourceName", resourceName).
		Msg("activity log created")

	return nil
}

func (l *Logger) LogAuth(username string, authMethod int, activityType int, origin string, success bool) error {
	if !l.IsEnabled() {
		return nil
	}
	if l.authLogService == nil {
		return nil
	}

	authLog := &activitylog.AuthLog{
		Timestamp:    time.Now().UnixMilli(),
		Username:     username,
		AuthMethod:   authMethod,
		ActivityType: activityType,
		Origin:       origin,
		Success:      success,
		CreatedAt:    time.Now().UnixMilli(),
	}

	err := l.authLogService.Create(authLog)
	if err != nil {
		log.Error().Err(err).Msg("failed to create auth log")
		return err
	}

	log.Debug().
		Str("username", username).
		Int("authMethod", authMethod).
		Int("activityType", activityType).
		Str("origin", origin).
		Bool("success", success).
		Msg("auth log created")

	return nil
}

func (l *Logger) LogAuthSuccess(username string, authMethod int, origin string) error {
	return l.LogAuth(username, authMethod, activitylog.ActivityTypeAuthSuccess, origin, true)
}

func (l *Logger) LogAuthFailure(username string, authMethod int, origin string) error {
	return l.LogAuth(username, authMethod, activitylog.ActivityTypeAuthFailure, origin, false)
}

func (l *Logger) LogLogout(username string, authMethod int, origin string) error {
	return l.LogAuth(username, authMethod, activitylog.ActivityTypeLogout, origin, true)
}
