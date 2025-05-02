package model

type Follow struct {
	ID          int  `json:"id"`
	FollowerId  int  `json:"followerId"`
	FollowingId int  `json:"followingId"`
	IsAccepted  bool `json:"isAccepted"`
}
