package model

type GroupMember struct {
	ID           int    `json:"id"`
	UserId       int    `json:"user_id"`
	InviterId    int    `json:"inviter_id"`
	GroupId      int    `json:"group_id"`
	IsAccepted   bool   `json:"is_accepted"`
	CreatingDate string `json:"creation_date"`
}
