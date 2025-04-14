package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

type studentRating struct {
	ID  string  `json:"id"`
    Rating float64  `json:"rating"`
	Difficulty float64  `json:"difficulty"`
	CRN float64  `json:"crn"`
    Comment  string `json:"comment"`
}


var studentRatings = []studentRating{
	{id: "CS-2104", rating: 6, difficulty: 7, crn: 13319, comment: "It was okay."},
}

func main() {
    router := gin.Default()
    router.POST("/studentRatings", postStudentRating)

    router.Run("localhost:8080")
}



// postAlbums adds data from JSON received in the request body.
func postStudentRating(c *gin.Context) {
    var newRating studentRating

    // Call BindJSON to bind the received JSON to
    // teacher data.
    if err := c.BindJSON(&newRating); err != nil {
        return
    }

	print(newRating.ID)
	print(newRating.Rating)
	print(newRating.Difficulty)
	print(newRating.CRN)
	print(newRating.Comment)

    studentRatings = append(studentRatings, newRating)
    c.IndentedJSON(http.StatusCreated, newRating)
	
}
