package webhooks

import (
	"errors"
	"net/http"
	"strconv"

	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/http/security"
	"github.com/portainer/portainer/api/internal/activitylog"
	httperror "github.com/portainer/portainer/pkg/libhttp/error"
	"github.com/portainer/portainer/pkg/libhttp/request"
	"github.com/portainer/portainer/pkg/libhttp/response"
)

// @summary Delete a webhook
// @description **Access policy**: authenticated
// @security ApiKeyAuth
// @security jwt
// @tags webhooks
// @param id path int true "Webhook id"
// @success 202 "Webhook deleted"
// @failure 400
// @failure 500
// @router /webhooks/{id} [delete]
func (handler *Handler) webhookDelete(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	id, err := request.RetrieveNumericRouteVariableValue(r, "id")
	if err != nil {
		return httperror.BadRequest("Invalid webhook id", err)
	}

	securityContext, err := security.RetrieveRestrictedRequestContext(r)
	if err != nil {
		return httperror.InternalServerError("Unable to retrieve user info from request context", err)
	}

	if !securityContext.IsAdmin {
		return httperror.Forbidden("Not authorized to delete a webhook", errors.New("not authorized to delete a webhook"))
	}

	webhook, err := handler.DataStore.Webhook().Read(portainer.WebhookID(id))
	if err != nil {
		return httperror.InternalServerError("Unable to find webhook", err)
	}
	resourceID := webhook.ResourceID

	err = handler.DataStore.Webhook().Delete(portainer.WebhookID(id))
	if err != nil {
		return httperror.InternalServerError("Unable to remove the webhook from the database", err)
	}

	tokenData, _ := security.RetrieveTokenData(r)
	operatorUsername := ""
	operatorUserID := 0
	if tokenData != nil {
		operatorUserID = int(tokenData.ID)
		operator, _ := handler.DataStore.User().Read(tokenData.ID)
		if operator != nil {
			operatorUsername = operator.Username
		}
	}

	activitylog.NewActivityLogBuilder(
		activitylog.ActionDelete,
		activitylog.ContextPortainer,
		activitylog.ResourceTypeWebhook,
	).
		WithUser(operatorUserID, operatorUsername).
		WithResource(strconv.Itoa(id), resourceID).
		Log()

	return response.Empty(w)
}
