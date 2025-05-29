package controller

import (
	"golang.org/x/crypto/bcrypt"
)

func ComparePasswords(hashedPassword string, clearPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(clearPassword))
	return err == nil
}
