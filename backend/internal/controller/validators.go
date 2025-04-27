package controller

import (
	"regexp"
)

func IsUsernameValid(username string) bool {
	re := regexp.MustCompile(`^[A-Za-z]{4,50}$`)
	return re.MatchString(username)
}

func IsPasswordValid(password string) bool {
	return len(password) >= 6 && len(password) <= 50 && regexp.MustCompile(`[A-Za-z]`).MatchString(password) && regexp.MustCompile(`\d`).MatchString(password)

}

func IsEmailValid(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,50}$`)
	return re.MatchString(email)
}
