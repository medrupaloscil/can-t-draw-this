package main

import (
    "github.com/gorilla/websocket"
    "net/http"
    "fmt"
    "sync"
)

type msg struct {
    Type string
    Content string
    Author string
}

type Message struct {
    Author string `json:"author"`
    Body   string `json:"body"`
}

var clients []websocket.Conn
var mutex = &sync.Mutex{}

var upgrader = websocket.Upgrader{
    ReadBufferSize: 1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

func main() {
    http.HandleFunc("/websocket", func(w http.ResponseWriter, r *http.Request) {
        
        conn, err := upgrader.Upgrade(w, r, nil)

        if err != nil {
          fmt.Println(err)
          return
        }

        addClient(*conn)

        for {
            m := msg{}

            err := conn.ReadJSON(&m)
            if err != nil {
                fmt.Println("Error reading json.", err)
            } else {
                switch m.Type {
                case "connect":
                    if err = conn.WriteJSON(m); err != nil {
                        fmt.Println(err)
                    }
                default:
                    for i, v := range clients {
                        if err = v.WriteJSON(m); err != nil {
                            removeClient(i)
                        }
                    }
                }
            }
        }
    })

    print("Server running on 127.0.0.1:3001\n")
    http.ListenAndServe(":3001", nil)
}

func addClient(conn websocket.Conn) {
    mutex.Lock()
    clients = append(clients, conn)
    mutex.Unlock()
}

func removeClient(pos int) {
    mutex.Lock()
    clients = append(clients[:pos], clients[pos+1:]...)
    print(clients)
    mutex.Unlock()
}