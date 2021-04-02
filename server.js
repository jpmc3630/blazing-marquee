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




// set up socket.io from our express connection
var io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

let screenObject = {};

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
  
  console.log(socket.id)
  // sorting out room creation for hosts ... 
  // once a client has connected, we expect to get a ping from them saying what room they want to join
  socket.on('screenConnect', function(data) {
      // if (data === 'create') {
      //     let roomName = 'the-room'
        
      //     socket.join(roomName)
      //     console.log('room message recieved:' + roomName)
          
          screenObject = {
            socket: socket.id,
          }

          // io.sockets.emit('getHosts', hostsArr)
          // io.sockets.in(roomName).emit('room', { roomName })
          console.log('Screen has connected')
          console.log('Screen object is:')
          console.log(JSON.stringify(screenObject, null, 4))
      
  });

  // join room, for joiners
  socket.on('submitMessage', function({ message, color }) {
    
    // console.log('client join room message recieved:' + roomName)
    console.log('message: ' + message)
    console.log('color: ' + color)

    let data = [
      message,
      color
    ]

    socket.to(screenObject.socket).emit('startMessage', data)
    
  });



// socket.on('removeHost', function() {
//   console.log('Screen removeHost');
// });


  // on DISCONNECT or CLOSE TAB remove host from hosts list
  socket.on('disconnect', function(reason) {
    
    screenObject = {}

      console.log('Screen object after disconnect:')
      console.log(JSON.stringify(screenObject, null, 4))

  });


});

