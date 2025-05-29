package response

type RegisterError struct {
	Error
	Field string `json:"field"`
}
