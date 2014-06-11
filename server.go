package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
    "os"
    "path/filepath"    
    "strings"
    "bufio"
    "encoding/json"
    "io"
)

// A single Broker will be created in this program. It is responsible
// for keeping a list of which clients (browsers) are currently attached
// and broadcasting events (messages) to those clients.
//
type Broker struct {

    // Create a map of clients, the keys of the map are the channels
    // over which we can push messages to attached clients.  (The values
    // are just booleans and are meaningless.)
    //
    clients map[chan string]bool

    // Channel into which new clients can be pushed
    //
    newClients chan chan string

    // Channel into which disconnected clients should be pushed
    //
    defunctClients chan chan string

    // Channel into which messages are pushed to be broadcast out
    // to attahed clients.
    //
    messages chan string
}

// This Broker method starts a new goroutine.  It handles
// the addition & removal of clients, as well as the broadcasting
// of messages out to clients that are currently attached.
//
func (b *Broker) Start() {

    // Start a goroutine
    //
    go func() {

        // Loop endlessly
        //
        for {

            // Block until we receive from one of the
            // three following channels.
            select {

            case s := <-b.newClients:

                // There is a new client attached and we
                // want to start sending them messages.
                b.clients[s] = true
                log.Println("Added new client")

            case s := <-b.defunctClients:

                // A client has dettached and we want to
                // stop sending them messages.
                delete(b.clients, s)
                log.Println("Removed client")

            case msg := <-b.messages:

                // There is a new message to send.  For each
                // attached client, push the new message
                // into the client's message channel.
                for s, _ := range b.clients {
                    s <- msg
                }
                log.Printf("Broadcast message to %d clients", len(b.clients))
            }
        }
    }()
}

// This Broker method handles and HTTP request at the "/events/" URL.
//
func (b *Broker) ServeHTTP(w http.ResponseWriter, r *http.Request) {

    // Make sure that the writer supports flushing.
    //
    f, ok := w.(http.Flusher)
    if !ok {
        http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
        return
    }

    // Create a new channel, over which the broker can
    // send this client messages.
    messageChan := make(chan string)

    // Add this client to the map of those that should
    // receive updates
    b.newClients <- messageChan

    // Remove this client from the map of attached clients
    // when `EventHandler` exits.
    defer func() {
        b.defunctClients <- messageChan
    }()

    // Set the headers related to event streaming.
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")
    // Disable buffering for nginx
    w.Header().Set("X-Accel-Buffering", "no")

    // Don't close the connection, instead loop 10 times,
    // sending messages and flushing the response each time
    // there is a new message to send along.
    //
    // NOTE: we could loop endlessly; however, then you 
    // could not easily detect clients that dettach and the
    // server would continue to send them messages long after
    // they're gone due to the "keep-alive" header.  One of
    // the nifty aspects of SSE is that clients automatically
    // reconnect when they lose their connection.
    //
    // A better way to do this is to use the CloseNotifier
    // interface that will appear in future releases of 
    // Go (this is written as of 1.0.3):
    // https://code.google.com/p/go/source/detail?name=3292433291b2
    //
    for i := 0; i < 10; i++ {

        // Read from our messageChan.
        msg := <-messageChan

        // Write to the ResponseWriter, `w`.
        fmt.Fprintf(w, "data: %s\n\n", msg)

        // Flush the response.  This is only possible if
        // the repsonse supports streaming.
        f.Flush()
    }

    // Done.
    log.Println("Finished HTTP request at ", r.URL.Path)
}

func main() {

    // Make a new Broker instance
    b := &Broker{
        make(map[chan string]bool),
        make(chan (chan string)),
        make(chan (chan string)),
        make(chan string),
    }

    // Start processing events
    b.Start()

    // Make b the HTTP handler for "/events/".  It can do 
    // this because it has a ServeHTTP method.  That method
    // is called in a separate goroutine for each 
    // request to "/events/".
    http.Handle("/subscribe", b)
/*
    http.HandleFunc("/publish", func(w http.ResponseWriter, r *http.Request) {
        b.messages <- fmt.Sprintf("The time is %v", time.Now())
        //w.WriteHeader(204)
        //w.Write("ok")
        fmt.Fprintf(w, "Hi there, I love !")
    })
*/
    go func() {
        for i := 0; ; i++ {

        // Create a little message to send to clients,
        // including the current time.
        //body = JSON.parse(request.body.read)
        //body['dashboard'] ||= params['id']
        //auth_token = body.delete("auth_token")
        //body[:id] = id
        //body[:updatedAt] ||= Time.now.to_i

        b.messages <- fmt.Sprintf(`{"id":"mywidget", "dashboard":"mydashboard", "updatedAt":"%v"}`, time.Now())

        // Print a nice log message and sleep for 5s.
        log.Printf("Sent message %d ", i)
        time.Sleep(5 * 1e9)

        }
    }()


    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, "templates/index.html")
    })

    http.HandleFunc("/assets/", func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path[1:] == "assets/application.js" {
            fmt.Fprintf(w, "/** @jsx React.DOM */\n")
            filepath.Walk("widgets/", func(fp string, fi os.FileInfo, err error) error {
                if err != nil {
                    return nil       // but continue walking elsewhere
                }

                if !fi.IsDir() && strings.HasSuffix(fp, ".jsx"){
                    fmt.Fprintf(w, "//jsx file: %s\n", fp)
                    // open input file
                    fjsx, err := os.Open(fp)
                    if err != nil { panic(err) }
                    // close fi on exit and check for its returned error
                    defer func() {
                        if err := fjsx.Close(); err != nil {
                            panic(err)
                        }
                    }()
                    // make a read buffer
                    r := bufio.NewReader(fjsx)

                    // make a buffer to keep chunks that are read
                    buf := make([]byte, 1024)
                    for {
                        // read a chunk
                        n, err := r.Read(buf)
                        if err != nil && err != io.EOF { panic(err) }
                        if n == 0 { break }
                        // write a chunk
                        if _, err := w.Write(buf[:n]); err != nil {
                            panic(err)
                        }
                    }
                }
                return nil
            })
        } else {
            http.ServeFile(w, r, r.URL.Path[1:])    
        }
    })

    // Start the server and listen forever on port 8000.
    http.ListenAndServe(":8000", nil)
}

func main2(){
    b := []byte(`{"Name":"Wednesday dsdsds","Age":6,"Parents":["Gomez","Morticia"]}`)
    var f interface{}
    err := json.Unmarshal(b, &f)
    if err != nil { panic(err) }
    m := f.(map[string]interface{})
    
    log.Printf(m["Name"].(string))
    //log.Printf(m["Name"].(string))
}
