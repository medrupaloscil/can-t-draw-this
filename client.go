package main

import (
    "net/http"
    "os"
    "fmt"
    "io/ioutil"
)

func main() {
    indexFile, err := os.Open("public/index.html")
    if err != nil {
        fmt.Println(err)
    }
    index, err := ioutil.ReadAll(indexFile)
    if err != nil {
        fmt.Println(err)
    }

    http.Handle("/resources/", http.StripPrefix("/resources/", http.FileServer(http.Dir("public"))))

    http.HandleFunc("/", func(w http.ResponseWriter, r * http.Request) {
        fmt.Fprintf(w, string(index))
    })
    print("Client running on 127.0.0.1:3000\n")
    http.ListenAndServe(":3000", nil)
}