package request

type Login struct {
	Email    string `json:"email"` // Email or Username
	Password string `json:"password"`
}
