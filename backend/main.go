package main

import (
	"log"
	"real-time-forum/internal/controller"
)

func main() {
	if err := controller.Start(); err != nil {
		log.Fatal(err)
	}
}
