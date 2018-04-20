package main

import (
	elastic "gopkg.in/olivere/elastic.v3"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"time"
	"github.com/dgrijalva/jwt-go"
)

const (
	TYPE_USER = "user"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// If signup is successful, a new session is created.
func signupHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received one signup request")

	decoder := json.NewDecoder(r.Body)
	var u User
	if err := decoder.Decode(&u); err != nil {
		panic(err)
		return
	}

	if addUser(u.Username, u.Password) {
		fmt.Println("User added successfully.")
		w.Write([]byte("User added successfully."))
	} else {
		fmt.Println("Failed to add a new user.")
		http.Error(w, "Failed to add a new user", http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Header().Set("Access-Control-Allow-Origin", "*")
}

// Add a new user. Return true if successfully; false if username is duplicate.
func addUser(username, password string) bool {
	es_client, err := elastic.NewClient(elastic.SetURL(ES_URL), elastic.SetSniff(false))
	if err != nil {
		fmt.Printf("ES is not setup %v\n", err)
		return false
	}
	user := &User{
		Username: username,
		Password: password,
	}

	// Search with a term query
	termQuery := elastic.NewTermQuery("username", username)
	queryResult, err := es_client.Search().
		Index(INDEX).
		Query(termQuery).
		Pretty(true).
		Do()
	if err != nil {
		fmt.Printf("ES query failed %v\n", err)
		return false
	}
	if queryResult.TotalHits() > 0 {
		fmt.Printf("user %s already exsists, cannot duplicate user\n", username)
		return false
	}

	// Save it to index
	_, err = es_client.Index().
		Index(INDEX).
		Type(TYPE_USER).
		Id(username).
		BodyJson(user).
		Refresh(true).
		Do()
	if err != nil {
		fmt.Printf("ES save failed. %v\n", err)
		return false
	}
	return true
}

// If login is successful, a new token is created.
func loginHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received one login request")

	decoder := json.NewDecoder(r.Body)
	var u User
	if err := decoder.Decode(&u); err != nil {
		panic(err)
		return
	}

	if checkUser(u.Username, u.Password) {
		token := jwt.New(jwt.SigningMethodHS256)
		claims := token.Claims.(jwt.MapClaims)
		// wrapped the username in JWT object
		claims["username"] = u.Username
		// set expired time
		claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
		// encryption
		tokenString, err := token.SignedString(mySigningKey)
		if err != nil {
			panic(err)
			return
		}

		// write the token to the browser window
		w.Write([]byte(tokenString))
	} else {
		fmt.Println("Invalid password or username.")
		http.Error(w, "Invalid password or username", http.StatusForbidden)
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Header().Set("Access-Control-Allow-Origin", "*")
}

// checkUser checks whether user is valid(username and password is valid)
func checkUser(username, password string) bool {
	es_client, err := elastic.NewClient(elastic.SetURL(ES_URL), elastic.SetSniff(false))
	if err != nil {
		fmt.Printf("ES is not setup %v\n", err)
		return false
	}

	// Search with a term query
	termQuery := elastic.NewTermQuery("username", username)
	queryResult, err := es_client.Search().
		Index(INDEX).
		Query(termQuery).
		Pretty(true).
		Do()
	if err != nil {
		fmt.Printf("ES query failed %v\n", err)
		return false
	}

	var tyu User
	for _, item := range queryResult.Each(reflect.TypeOf(tyu)) {
		u := item.(User)
		return u.Password == password && u.Username == username
	}

	// If no user exist, return false.
	return false
}

