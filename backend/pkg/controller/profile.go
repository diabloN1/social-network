package app

import (
	"social-network/pkg/model"
	"social-network/pkg/model/request"
	"social-network/pkg/model/response"
)

func (app *App) GetProfile(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetProfile)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)

	user, err := app.repository.User().FindProfile(data.ProfileId, userId)
	if err != nil {
		return &response.Error{Code: 404, Cause: err.Error()}
	}

	return &response.GetProfile{
		User: user,
	}
}

func (app *App) GetProfiles(payload *request.RequestT) any {
	userId := payload.Ctx.Value("user_id").(int)

	followRequests, err := app.repository.Follow().GetFollowRequests(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	allUsers, err := app.repository.User().GetAllUsers()
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	var otherUsers []*model.User
	var currentUser *model.User
	for _, user := range allUsers {
		if user.ID != userId {
			otherUsers = append(otherUsers, user)
		} else {
			currentUser = user
		}
	}

	return &response.GetProfiles{
		FollowRequests: followRequests,
		AllUsers:       otherUsers,
		CurrentUser:    currentUser,
	}
}

func (app *App) SetProfilePrivacy(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.SetProfilePrivacy)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)

	err := app.repository.User().SetUserPrivacy(userId, data.State)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	return &response.SetProfilePrivacy{
		Success: true,
	}
}
