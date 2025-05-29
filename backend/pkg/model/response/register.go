package response

type RegisterError struct {
	Error   `json:"error"`
	Field   string `json:"field"`
	Message string `json:"message"`
}
