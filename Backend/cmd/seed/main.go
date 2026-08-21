package main

import (
	"database/sql"
	"log"
	"os"
	"strings"

	"guardian-vision/backend/internal/config"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	cfg := config.Load()
	dsn := enableMultiStatements(cfg.DatabaseDSN)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	content, err := os.ReadFile("migrations/002_seed_demo_data.sql")
	if err != nil {
		log.Fatalf("read seed file: %v", err)
	}

	if _, err := db.Exec(string(content)); err != nil {
		log.Fatalf("execute seed file: %v", err)
	}

	log.Println("demo data seeded successfully")
}

func enableMultiStatements(dsn string) string {
	if strings.Contains(dsn, "multiStatements=true") {
		return dsn
	}
	if strings.Contains(dsn, "?") {
		return dsn + "&multiStatements=true"
	}
	return dsn + "?multiStatements=true"
}
