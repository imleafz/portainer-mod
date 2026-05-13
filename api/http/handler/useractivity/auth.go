package useractivity

import (
	"encoding/csv"
	"net/http"
	"strconv"
	"strings"

	"github.com/portainer/portainer/api/dataservices/activitylog"
	httperror "github.com/portainer/portainer/pkg/libhttp/error"
	"github.com/portainer/portainer/pkg/libhttp/response"

	"github.com/rs/zerolog/log"
)

type authLogsResponse struct {
	Logs       []authLogResponse `json:"logs"`
	TotalCount int               `json:"totalCount"`
}

type authLogResponse struct {
	Timestamp int64  `json:"timestamp"`
	Context   int    `json:"context"`
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	Type      int    `json:"type"`
	Origin    string `json:"origin"`
}

func (h *Handler) authLogsList(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	query := r.URL.Query()

	offset, _ := strconv.Atoi(query.Get("offset"))
	limit, _ := strconv.Atoi(query.Get("limit"))
	if limit <= 0 {
		limit = 50
	}

	var logs []*activitylog.AuthLog
	var totalCount int
	var err error

	afterStr := query.Get("after")
	beforeStr := query.Get("before")

	if afterStr != "" && beforeStr != "" {
		after, _ := strconv.ParseInt(afterStr, 10, 64)
		before, _ := strconv.ParseInt(beforeStr, 10, 64)
		if after > 0 && before > 0 {
			// Convert seconds to milliseconds (frontend sends seconds, backend stores milliseconds)
			afterMs := after * 1000
			beforeMs := before * 1000
			logs, err = h.activitylogService.AuthLogService.ReadByTimerange(afterMs, beforeMs, offset, limit)
			if err != nil {
				return httperror.InternalServerError("Failed to retrieve authentication logs", err)
			}
			totalCount, err = h.activitylogService.AuthLogService.CountByTimerange(afterMs, beforeMs)
			if err != nil {
				return httperror.InternalServerError("Failed to count authentication logs", err)
			}
		} else {
			logs, err = h.activitylogService.AuthLogService.ReadAll(offset, limit)
			if err != nil {
				return httperror.InternalServerError("Failed to retrieve authentication logs", err)
			}
			totalCount, err = h.activitylogService.AuthLogService.Count()
			if err != nil {
				return httperror.InternalServerError("Failed to count authentication logs", err)
			}
		}
	} else {
		logs, err = h.activitylogService.AuthLogService.ReadAll(offset, limit)
		if err != nil {
			return httperror.InternalServerError("Failed to retrieve authentication logs", err)
		}
		totalCount, err = h.activitylogService.AuthLogService.Count()
		if err != nil {
			return httperror.InternalServerError("Failed to count authentication logs", err)
		}
	}

	resp := authLogsResponse{
		Logs:       make([]authLogResponse, 0, len(logs)),
		TotalCount: totalCount,
	}

	for _, l := range logs {
		resp.Logs = append(resp.Logs, authLogResponse{
			Timestamp: l.Timestamp / 1000, // convert milliseconds to seconds for frontend
			Context:   l.AuthMethod,
			ID:        l.ID,
			Username:  l.Username,
			Type:      l.ActivityType,
			Origin:    l.Origin,
		})
	}

	return response.JSON(w, resp)
}

func (h *Handler) authLogsExport(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	query := r.URL.Query()

	var logs []*activitylog.AuthLog
	var err error

	afterStr := query.Get("after")
	beforeStr := query.Get("before")

	if afterStr != "" && beforeStr != "" {
		after, _ := strconv.ParseInt(afterStr, 10, 64)
		before, _ := strconv.ParseInt(beforeStr, 10, 64)
		if after > 0 && before > 0 {
			// Convert seconds to milliseconds (frontend sends seconds, backend stores milliseconds)
			afterMs := after * 1000
			beforeMs := before * 1000
			logs, err = h.activitylogService.AuthLogService.ReadByTimerange(afterMs, beforeMs, 0, 0)
			if err != nil {
				return httperror.InternalServerError("Failed to retrieve authentication logs for export", err)
			}
		} else {
			logs, err = h.activitylogService.AuthLogService.ReadAll(0, 0)
			if err != nil {
				return httperror.InternalServerError("Failed to retrieve authentication logs for export", err)
			}
		}
	} else {
		logs, err = h.activitylogService.AuthLogService.ReadAll(0, 0)
		if err != nil {
			return httperror.InternalServerError("Failed to retrieve authentication logs for export", err)
		}
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment;filename=auth_logs.csv")

	writer := csv.NewWriter(w)
	defer writer.Flush()

	writer.Write([]string{"ID", "Timestamp", "Username", "Auth Method", "Activity Type", "Origin", "Success"})

	for _, l := range logs {
		successStr := "false"
		if l.Success {
			successStr = "true"
		}
		writer.Write([]string{
			strconv.FormatInt(l.ID, 10),
			strconv.FormatInt(l.Timestamp, 10),
			l.Username,
			authMethodString(l.AuthMethod),
			activityTypeString(l.ActivityType),
			l.Origin,
			successStr,
		})
	}

	log.Debug().Msg("Authentication logs exported successfully")
	return nil
}

func authMethodString(method int) string {
	switch method {
	case activitylog.AuthMethodInternal:
		return "Internal"
	case activitylog.AuthMethodLDAP:
		return "LDAP"
	case activitylog.AuthMethodOAuth:
		return "OAuth"
	default:
		return strings.ToLower(strconv.Itoa(method))
	}
}

func activityTypeString(activityType int) string {
	switch activityType {
	case activitylog.ActivityTypeAuthSuccess:
		return "Authentication Success"
	case activitylog.ActivityTypeAuthFailure:
		return "Authentication Failure"
	case activitylog.ActivityTypeLogout:
		return "Logout"
	default:
		return strings.ToLower(strconv.Itoa(activityType))
	}
}
