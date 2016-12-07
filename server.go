package main

import (
    "github.com/gorilla/websocket"
    "net/http"
    "fmt"
    "sync"
    "encoding/json"
)

type msg struct {
    Type string
    Content string
    Author string
}

var clients []websocket.Conn
var pseudos []string
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

        for {
            m := msg{}

            err := conn.ReadJSON(&m)
            if err != nil {
                fmt.Println("Error reading json.", err)
            } else {
                switch m.Type {
                case "connect":
                    if stringInSlice(m.Author, pseudos) {
                        m.Type = "bad_connect";
                        if err = conn.WriteJSON(m); err != nil {
                            fmt.Println(err)
                        }
                    } else {
                        addClient(*conn, m.Author)
                        if err = conn.WriteJSON(m); err != nil {
                            fmt.Println(err)
                        }
                        sendPseudos()
                    }
                default:
                    for i, v := range clients {
                        if err = v.WriteJSON(m); err != nil {
                            removeClient(i)
                            sendPseudos()
                        }
                    }
                }
            }
        }
    })

    print("Server running on 127.0.0.1:3001\n")
    http.ListenAndServe(":3001", nil)
}

func sendPseudos() {
    jsonPseudo, _ := json.Marshal(pseudos)
    users := msg{ "users", string(jsonPseudo), "Server" }
    for _, v := range clients {
        if err := v.WriteJSON(users); err != nil {
            fmt.Println(err)
        }
    }
}

func addClient(conn websocket.Conn, pseudo string) {
    mutex.Lock()
    clients = append(clients, conn)
    pseudos = append(pseudos, pseudo)
    mutex.Unlock()
}

func removeClient(pos int) {
    mutex.Lock()
    clients = append(clients[:pos], clients[pos+1:]...)
    pseudos = append(pseudos[:pos], pseudos[pos+1:]...)
    mutex.Unlock()
}

func stringInSlice(a string, list []string) bool {
    for _, b := range list {
        if b == a {
            return true
        }
    }
    return false
}