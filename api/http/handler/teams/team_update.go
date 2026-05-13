package teams

import (
	"net/http"
	"strconv"

	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/http/security"
	"github.com/portainer/portainer/api/internal/activitylog"
	httperror "github.com/portainer/portainer/pkg/libhttp/error"
	"github.com/portainer/portainer/pkg/libhttp/request"
	"github.com/portainer/portainer/pkg/libhttp/response"
)

type teamUpdatePayload struct {
	// Name
	Name string `example:"developers"`
}

func (payload *teamUpdatePayload) Validate(r *http.Request) error {
	return nil
}

// @id TeamUpdate
// @summary Update a team
// @description Update a team.
// @description **Access policy**: administrator
// @tags teams
// @security ApiKeyAuth
// @security jwt
// @accept json
// @produce json
// @param id path int true "Team identifier"
// @param body body teamUpdatePayload true "Team details"
// @success 200 {object} portainer.Team "Success"
// @failure 400 "Invalid request"
// @failure 403 "Permission denied"
// @failure 404 "Team not found"
// @failure 500 "Server error"
// @router /teams/{id} [put]
func (handler *Handler) teamUpdate(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	teamID, err := request.RetrieveNumericRouteVariableValue(r, "id")
	if err != nil {
		return httperror.BadRequest("Invalid team identifier route variable", err)
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

	var payload teamUpdatePayload
	if err := request.DecodeAndValidateJSONPayload(r, &payload); err != nil {
		return httperror.BadRequest("Invalid request payload", err)
	}

	team, err := handler.DataStore.Team().Read(portainer.TeamID(teamID))
	if handler.DataStore.IsErrObjectNotFound(err) {
		return httperror.NotFound("Unable to find a team with the specified identifier inside the database", err)
	} else if err != nil {
		return httperror.InternalServerError("Unable to find a team with the specified identifier inside the database", err)
	}

	oldName := team.Name
	if payload.Name != "" {
		team.Name = payload.Name
	}

	if err := handler.DataStore.Team().Update(team.ID, team); err != nil {
		return httperror.NotFound("Unable to persist team changes inside the database", err)
	}

	activitylog.NewActivityLogBuilder(
		activitylog.ActionUpdate,
		activitylog.ContextPortainer,
		activitylog.ResourceTypeTeam,
	).
		WithUser(operatorUserID, operatorUsername).
		WithResource(strconv.Itoa(teamID), team.Name).
		WithDetails(map[string]interface{}{
			"description": "更新团队成功",
			"teamName":    team.Name,
			"oldName":     oldName,
			"newName":     payload.Name,
		}).
		Log()

	return response.JSON(w, team)
}
