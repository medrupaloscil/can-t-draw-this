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
    To string
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
        name := ""
        conn, err := upgrader.Upgrade(w, r, nil)
        if err != nil {
          fmt.Println(err)
          return
        }
        for {
            m := msg{}
            err := conn.ReadJSON(&m)
            if err != nil {
                removeClient(name)
                sendPseudos()
                return
            } else {
                switch m.Type {
                case "connect":
                    if stringInSlice(m.Author, pseudos) {
                        m.Type = "bad_connect";
                        sendMessage(*conn, m)
                    } else {
                        addClient(*conn, m.Author)
                        name = m.Author
                        sendMessage(*conn, m)
                        sendPseudos()
                    }
                case "private":
                    sendMessage(*conn, m)
                    for i, v := range pseudos {
                        if v == m.To {
                            sendMessage(clients[i], m)
                        }
                    }
                default:
                    sendMessageToAll(m)
                }
            }
        }
    })

    print("Server running on 127.0.0.1:3001\n")
    http.ListenAndServe(":3001", nil)
}

func sendMessageToAll(m msg) {
    for _, v := range clients {
        if err := v.WriteJSON(m); err != nil {
            sendPseudos()
        }
    }
}

func sendMessage(conn websocket.Conn, m msg) {
    if err := conn.WriteJSON(m); err != nil {
        fmt.Println(err)
    }
}

func sendPseudos() {
    jsonPseudo, _ := json.Marshal(pseudos)
    users := msg{ "users", string(jsonPseudo), "Server", "all" }
    sendMessageToAll(users)
}

func addClient(conn websocket.Conn, pseudo string) int {
    mutex.Lock()
    length := len(clients)
    clients = append(clients, conn)
    pseudos = append(pseudos, pseudo)
    mutex.Unlock()
    return length
}

func removeClient(name string) {
    mutex.Lock()
    for i, v := range pseudos {
        if v == name {
            clients = append(clients[:i], clients[i+1:]...)
            pseudos = append(pseudos[:i], pseudos[i+1:]...)
        }
    }
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