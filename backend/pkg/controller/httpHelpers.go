package app

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func (app *App) SendJson(w http.ResponseWriter, response any, err error) {
	if err != nil {
		w.WriteHeader(500)
		fmt.Println(err)
		_, err = w.Write([]byte(err.Error()))
		if err != nil {
			fmt.Println(err)
		}
		return
	}

	var data []byte
	data, err = json.Marshal(response)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		_, err = w.Write([]byte("Error Marshling Response"))
		if err != nil {
			fmt.Println(err)

		}
		return
	}

	w.WriteHeader(200)
	_, err = w.Write(data)

	if err != nil {
		w.WriteHeader(500)
		fmt.Println("Error Writing data")
		w.Write([]byte("Error Writing data"))
	}
}
