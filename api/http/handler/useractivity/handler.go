package useractivity

import (
	"net/http"

	"github.com/portainer/portainer/api/dataservices/activitylog"
	"github.com/portainer/portainer/api/http/security"
	httperror "github.com/portainer/portainer/pkg/libhttp/error"

	"github.com/gorilla/mux"
)

type Handler struct {
	*mux.Router
	requestBouncer     security.BouncerService
	activitylogService *activitylog.Service
}

func NewHandler(bouncer security.BouncerService, activitylogService *activitylog.Service) *Handler {
	h := &Handler{
		Router:             mux.NewRouter(),
		requestBouncer:     bouncer,
		activitylogService: activitylogService,
	}

	h.Handle("/useractivity/logs",
		bouncer.AuthenticatedAccess(httperror.LoggerHandler(h.activityLogsList))).Methods(http.MethodGet)
	h.Handle("/useractivity/logs.csv",
		bouncer.AuthenticatedAccess(httperror.LoggerHandler(h.activityLogsExport))).Methods(http.MethodGet)
	h.Handle("/useractivity/authlogs",
		bouncer.AuthenticatedAccess(httperror.LoggerHandler(h.authLogsList))).Methods(http.MethodGet)
	h.Handle("/useractivity/authlogs.csv",
		bouncer.AuthenticatedAccess(httperror.LoggerHandler(h.authLogsExport))).Methods(http.MethodGet)

	return h
}
