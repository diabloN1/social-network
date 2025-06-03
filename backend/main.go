package main

import (
	"log"
	"real-time-forum/pkg/server"
)

func main() {
	if err := server.Start(); err != nil {
		log.Fatal(err)
	}
}
