package controller

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func initDB(databasePath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", databasePath)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}

	migrate(db)

	return db, nil
}

func migrate(db *sql.DB) {
	query, err := os.ReadFile("db/modules.sql")
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.Exec(string(query))
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Database migrated successfully!")
}