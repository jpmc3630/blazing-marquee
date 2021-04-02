import React, { Component } from "react";

import io from "socket.io-client";
import "./App.css"

let socket;
if (process.env.NODE_ENV === 'development') {
  socket = io(`http://localhost:3001/`);
} else {
  socket = io();
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      response: false,
      socket: false,
      currentRoom: null,
      roomToJoin: null,
      username: null,
      color: '#7c1313',
      colorOutline: '#7c1313',
      bgColor: '#000000',
      speed: "0.3",
      spacing: "-1",
      statusArr: [],
      conToHost: false,
      conToServer: false,
      status: 'lobby',
      statusMessage: 'Searching for server...',
      answers: [],
      message: ''
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleAnswer = this.handleAnswer.bind(this)
  }

  componentDidMount() {
    
    socket.on('connect', (socket) => {
      this.setState({
        conToServer: true,
        status: 'lobby',
        statusMessage: 'Connected to server.'
      })
    })

    // can't get this to recieve for some reason
    socket.on('status', (data) => {
      this.setState({
        status: data.status,
        statusMessage: data.statusMessage
      })

      if (data.status == 'question') {
        this.setState({
          answers: data.answers
        })
      }
    })

    socket.on('disconnectedHost', (data) => {
      this.setState({ statusArr: [], conToHost: false, status: 'The host has stopped hosting!' });
    })
   
    // gemerate random hex colours
    this.randomiseColors()

  }

  randomiseColors() {
    var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    var randomColor2 = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    
    this.setState({
      color: randomColor,
      colorOutline: randomColor2
    })
  }

  componentWillUnmount() {
    this.props.socket.emit('removeUser', {room: this.state.currentRoom, msg: `removeUser`});
    this.setState({ statusArr: [], conToHost: false });
  }

  handleChange(event) {
    this.setState({
        [event.target.name]: event.target.value
    })
  }

  
  handleSubmit(event) {
      event.preventDefault()
      if(this.state.conToServer) {
        if(this.state.message.trim() != '') {
        socket.emit('submitMessage', {
          // roomName: this.state.roomToJoin, 
          message: this.state.message,
          color: this.hexTorgb(this.state.color),
          colorOutline: this.hexTorgb(this.state.colorOutline),
          bgColor: this.hexTorgb(this.state.bgColor),
          speed: this.state.speed,
          spacing: this.state.spacing
        });
      } else {
        alert('Spit it out')
      }
      } else {
        alert('Reception is a bit shit, mate')
      }
  }

  handleAnswer(event) {
    event.preventDefault()
      socket.emit('playerAnswer', {
        roomName: this.state.roomToJoin, 
        username: this.state.username,
        answer: event.target.dataset.answer
      });

      this.setState({
        status: 'wait',
        statusMessage: 'Your answer has been recorded!'
      })
  }
  
   hexTorgb(hex) {
    return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
  }
  
  render() {
    
    return (
      
      <div className="App">
        <div className="container">


        {(() => {
        switch (this.state.status) {

          case 'lobby':
            return (
      
              <div>
              <h4>~ The BS Pager ~</h4>
      
                  <form className="form-horizontal">
                    <div className="form-group">
                        <div className="col-1 col-ml-auto">
                            <label className="status-label" htmlFor="username">{this.state.statusMessage}</label>
                        </div>
                        <div className="col-3 col-mr-auto">
                          <div className="col-1 col-ml-auto">
                            <label className="form-label" htmlFor="message">Message</label>
                        </div>
                            <textarea className="form-input"
                                rows="3"
                                id="message"
                                name="message"
                                placeholder="Message"
                                value={this.state.message}
                                onChange={this.handleChange}
                            />
                          <br></br>
                          <br></br>
                          <label htmlFor="favcolor">Color</label>
                          <br></br>
                        <input type="color" id="favcolor" className="colorPicker" name="color" onChange={this.handleChange} value={this.state.color}></input>
                        <br></br>
                        <label htmlFor="colorOutline">Outline Color</label>
                        <br></br>
                        <input type="color" id="colorOutline" className="colorPicker" name="colorOutline" onChange={this.handleChange} value={this.state.colorOutline}></input>
                        <br></br>
                        <label htmlFor="bgColor">Background</label>
                        <br></br>
                        <input type="color" id="bgColor" className="colorPicker" name="bgColor" onChange={this.handleChange} value={this.state.bgColor}></input>
                        <br></br>
                        <label htmlFor="speed">Speed</label>
                        <br></br>
                        <input type="range" min="0" max="6" step="0.1" id="speed" className="slider" name="speed" onChange={this.handleChange} value={this.state.speed}></input>
                        <br></br>
                        <label htmlFor="spacing">Letter spacing</label>
                        <br></br>
                        <input type="range" min="-10" max="10" step="1"id="spacing" className="slider" name="spacing" onChange={this.handleChange} value={this.state.spacing}></input>
                        


                        </div>
                    </div>
                    
                    <div className="form-group ">
                        <div className="col-7"></div>
                        <br></br>
                        <button
                            className="btn synthToolButton col-1 col-mr-auto"
                            onClick={this.handleSubmit}
                            type="submit">Send message</button>
                    </div>
                  </form>
                </div>
          )

    




          case 'wait':
            return (
              <p>{this.state.statusMessage}</p>
          )




          default:
            return (
              <p>Hitting default over here...
                <br></br>
                Status: {this.state.status}
                <br></br>
                StatusMessage: {this.state.statusMessage}
            </p>
            )
        }
      })()}

          
        </div>

      </div>
    )
  }
}



export default App;
