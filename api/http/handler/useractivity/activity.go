package useractivity

import (
	"encoding/base64"
	"encoding/csv"
	"net/http"
	"strconv"

	"github.com/portainer/portainer/api/dataservices/activitylog"
	httperror "github.com/portainer/portainer/pkg/libhttp/error"
	"github.com/portainer/portainer/pkg/libhttp/response"

	"github.com/rs/zerolog/log"
)

type activityLogsResponse struct {
	Logs       []activityLogResponse `json:"logs"`
	TotalCount int                   `json:"totalCount"`
}

type activityLogResponse struct {
	Timestamp    int64  `json:"timestamp"`
	Action       string `json:"action"`
	Context      string `json:"context"`
	ID           int64  `json:"id"`
	Username     string `json:"username"`
	Payload      string `json:"payload"`
	ResourceType string `json:"resourceType"`
	ResourceID   string `json:"resourceID"`
	ResourceName string `json:"resourceName"`
}

func (h *Handler) activityLogsList(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	query := r.URL.Query()

	offset, _ := strconv.Atoi(query.Get("offset"))
	limit, _ := strconv.Atoi(query.Get("limit"))
	if limit <= 0 {
		limit = 50
	}

	var logs []*activitylog.ActivityLog
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
			logs, err = h.activitylogService.ActivityLogService.ReadByTimerange(afterMs, beforeMs, offset, limit)
			if err != nil {
				return httperror.InternalServerError("Failed to retrieve activity logs", err)
			}
			totalCount, err = h.activitylogService.ActivityLogService.CountByTimerange(afterMs, beforeMs)
			if err != nil {
				return httperror.InternalServerError("Failed to count activity logs", err)
			}
		} else {
			logs, err = h.activitylogService.ActivityLogService.ReadAll(offset, limit)
			if err != nil {
				return httperror.InternalServerError("Failed to retrieve activity logs", err)
			}
			totalCount, err = h.activitylogService.ActivityLogService.Count()
			if err != nil {
				return httperror.InternalServerError("Failed to count activity logs", err)
			}
		}
	} else {
		logs, err = h.activitylogService.ActivityLogService.ReadAll(offset, limit)
		if err != nil {
			return httperror.InternalServerError("Failed to retrieve activity logs", err)
		}
		totalCount, err = h.activitylogService.ActivityLogService.Count()
		if err != nil {
			return httperror.InternalServerError("Failed to count activity logs", err)
		}
	}

	resp := activityLogsResponse{
		Logs:       make([]activityLogResponse, 0, len(logs)),
		TotalCount: totalCount,
	}

	for _, l := range logs {
		payloadStr := base64.StdEncoding.EncodeToString(l.Payload)
		resp.Logs = append(resp.Logs, activityLogResponse{
			Timestamp:    l.Timestamp / 1000, // convert milliseconds to seconds for frontend
			Action:       l.Action,
			Context:      l.Context,
			ID:           l.ID,
			Username:     l.Username,
			Payload:      payloadStr,
			ResourceType: l.ResourceType,
			ResourceID:   l.ResourceID,
			ResourceName: l.ResourceName,
		})
	}

	return response.JSON(w, resp)
}

func (h *Handler) activityLogsExport(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	query := r.URL.Query()

	var logs []*activitylog.ActivityLog
	var err error

	afterStr := query.Get("after")
	beforeStr := query.Get("before")

	if afterStr != "" && beforeStr != "" {
		after, _ := strconv.ParseInt(afterStr, 10, 64)
		before, _ := strconv.ParseInt(beforeStr, 10, 64)
		if after > 0 && before > 0 {
			logs, err = h.activitylogService.ActivityLogService.ReadByTimerange(after, before, 0, 0)
			if err != nil {
				return httperror.InternalServerError("Failed to retrieve activity logs for export", err)
			}
		} else {
			logs, err = h.activitylogService.ActivityLogService.ReadAll(0, 0)
			if err != nil {
				return httperror.InternalServerError("Failed to retrieve activity logs for export", err)
			}
		}
	} else {
		logs, err = h.activitylogService.ActivityLogService.ReadAll(0, 0)
		if err != nil {
			return httperror.InternalServerError("Failed to retrieve activity logs for export", err)
		}
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment;filename=activity_logs.csv")

	writer := csv.NewWriter(w)
	defer writer.Flush()

	writer.Write([]string{"ID", "Timestamp", "Username", "Action", "Context", "Resource Type", "Resource ID", "Resource Name", "Payload"})

	for _, l := range logs {
		payloadStr := base64.StdEncoding.EncodeToString(l.Payload)
		writer.Write([]string{
			strconv.FormatInt(l.ID, 10),
			strconv.FormatInt(l.Timestamp, 10),
			l.Username,
			l.Action,
			l.Context,
			l.ResourceType,
			l.ResourceID,
			l.ResourceName,
			payloadStr,
		})
	}

	log.Debug().Msg("Activity logs exported successfully")
	return nil
}
