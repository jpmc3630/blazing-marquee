const sslRedirect = require('heroku-ssl-redirect').default
const express = require("express");
const axios = require('axios');

const path = require("path");
const PORT = process.env.PORT || 3001;
const app = express();

// enable ssl redirect
app.use(sslRedirect());

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
  socket.on('submitMessage', function ({ message, color, colorOutline, bgColor, speed, spacing, textureFile, textureSpeed, brightness }) {
    
    // console.log('client join room message recieved:' + roomName)
    console.log('Incoming submission:');
    console.log(`Message: ${message}`);
    console.log(`Color: ${color}`);
    console.log(`Texture File: ${textureFile}`);
    if (textureFile) {
      console.log(`Texture Speed: ${textureSpeed}`);
      console.log(`Brightness: ${brightness}`);
    }
  
    let data;
    if (textureFile) {
      console.log(`Displaying texture: ${textureFile}`);
      data = [message, color, colorOutline, bgColor, textureSpeed, spacing, brightness, textureFile];
    } else {
      console.log(`Displaying text message: ${message}`);
      data = [message, color, colorOutline, bgColor, speed, spacing];
    }

    socket.to(screenObject.socket).emit('startMessage', data)
    
  });


  // hard reboot
  socket.on('hardreboot', function() {
    
    socket.to(screenObject.socket).emit('hardboot')
    
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

