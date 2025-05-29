package response

type Login struct {
	Session  string `json:"session"`
	UserId   int    `json:"user_id"`
	Username string `json:"username"`
}
