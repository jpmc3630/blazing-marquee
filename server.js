const express = require("express");
const axios = require('axios');

const path = require("path");
const PORT = process.env.PORT || 3001;
const app = express();

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Define API routes here

// Send every other request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`🌎 ==> API server now on port ${PORT}!`);
});

app.get('/booty', function (req, res) {
  socket.to(screenObject.socket).emit('hardboot')
})

// set up socket.io from our express connection
var io = require('socket.io')(server, {
  cors: {
    origin: '*',
    // transports: ['websocket'],
    pingInterval: 25000,
    pingTimeout: 5000,
    transports:["polling", "websocket"]
  }
});

let screenObject = {};

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
  
  console.log(socket.id)

  socket.on('screenConnect', function(data) {

          screenObject = {
            socket: socket.id,
          }

          console.log('Screen has connected')
          console.log('Screen object is:')
          console.log(JSON.stringify(screenObject, null, 4))
      
  });

  // join room, for joiners
  socket.on('submitMessage', function({ message, color, colorOutline, bgColor, speed, spacing }) {
    
    // console.log('client join room message recieved:' + roomName)
    console.log('message: ' + message)
    console.log('color: ' + color)

    let data = [
      message,
      color,
      colorOutline,
      bgColor,
      speed,
      spacing
    ]

    socket.to(screenObject.socket).emit('startMessage', data)
    
  });



  // socket.on('disconnect', function(reason) {
    
  //   screenObject = {}

  //     console.log('Screen object after disconnect:')
  //     console.log(JSON.stringify(screenObject, null, 4))

  // });


 // heartbeat thing to try?
  // socket.on('pong', function(data){
  //   console.log("Pong received from client");
  // });
  // setTimeout(sendHeartbeat, 20000);

  // function sendHeartbeat(){
  //     setTimeout(sendHeartbeat, 20000);
  //     io.sockets.emit('ping', { beat : 1 });
  // }

});

