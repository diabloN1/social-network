package main

import (
	"log"
	"social-network/pkg/server"
)

func main() {
	if err := server.Start(); err != nil {
		log.Fatal(err)
	}
}
