package app

import (
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

func IsUsernameValid(username string) bool {
	re := regexp.MustCompile(`^[A-Za-z]{3,20}$`)
	return re.MatchString(username)
}

func IsPasswordValid(password string) bool {
	return len(password) >= 6 && len(password) <= 50 && regexp.MustCompile(`[A-Za-z]`).MatchString(password) && regexp.MustCompile(`\d`).MatchString(password)

}

func IsEmailValid(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,50}$`)
	return re.MatchString(email)
}

func ComparePasswords(hashedPassword string, clearPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(clearPassword))
	return err == nil
}
