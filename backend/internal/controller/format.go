package controller

import (
	"log"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Hash password error", err)
	}
	return string(bytes)
}
func ComparePasswords(hashedPassword string, clearPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(clearPassword))
	return err == nil
}
