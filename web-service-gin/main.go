package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

import (
    "database/sql"
    "fmt"
    "log"

    _ "github.com/lib/pq" // PostgreSQL driver
)

var db *sql.DB


type studentRating struct {
	Class  string  `json:"class"`
    Rating float64  `json:"rating"`
	Difficulty float64  `json:"difficulty"`
	CRN float64  `json:"crn"`
    Comment  string `json:"comment"`
}


//var studentRatings = []studentRating{
	//{class: "CS-2104", rating: 6, difficulty: 7, crn: 13319, comment: "It was okay."},
//}

func main() {
    user := "postgres"
    password := "MwcxArb4P4qS6yUyk05ME"
    host := "127.0.0.1"
    port := 9109
    dbname := "odysseus-go-api"

    // Format the PostgreSQL connection string
    dsn := fmt.Sprintf(
        "host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname,
    )

    // Open the connection
    var err error
    db, err = sql.Open("postgres", dsn)
    if err != nil {
        log.Fatal("sql.Open error:", err)
    }

    // Ping to confirm connection
    if err := db.Ping(); err != nil {
        log.Fatal("db.Ping error:", err)
    }

    fmt.Println("Connected to PostgreSQL!")

    router := gin.Default()
    router.POST("/studentRatings", postStudentRating)

    router.Run("localhost:8080")
}



// postStudentRating adds data from JSON received in the request body.
func postStudentRating(c *gin.Context) {
    var newRating studentRating
    // Call BindJSON to bind the received JSON to
    // teacher data.
    if err := c.BindJSON(&newRating); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    sqlStatement := `
    INSERT INTO studentRatings (class, rating, difficulty, crn, comment)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id`
    id := 0
    err := db.QueryRow(sqlStatement, newRating.Class, newRating.Rating, newRating.Difficulty, newRating.CRN, newRating.Comment).Scan(&id)
    if err != nil {
    panic(err)
    }
    fmt.Println("New record ID is:", id)

    c.IndentedJSON(http.StatusCreated, newRating)
}


