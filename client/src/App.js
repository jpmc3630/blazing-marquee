import React, { Component } from "react";
import LoadingOverlay from 'react-loading-overlay';
import io from "socket.io-client";
import "./App.css"
import bgImage from "./bg.png"
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
      speed: "3",
      spacing: "0",
      statusArr: [],
      conToHost: false,
      conToServer: false,
      status: 'lobby',
      statusMessage: 'Searching for server...',
      answers: [],
      message: '',
      loading: false
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
        statusMessage: 'Connected to server'
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
        if (this.state.message === 'areyougoingtothemall') {
          socket.emit('hardreboot')
        } else {
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
          this.setState({loading: true })
          setTimeout(() => {
            this.setState({loading:false})
          }, 1600);
          // alert('Msg has been posted <3')
        } else {
          alert('Plz enter a msg to post ;D')
        }
      }
      } else {
        alert('Ph. reception is not so good o.O')
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
      
      <div className="App" style={{ backgroundImage: 'url(' + bgImage + ')', backgroundSize: 'auto', backgroundPosition: '0 0' }}>

        {(() => {
        switch (this.state.status) {

          case 'lobby':
            return (
      
              <div className="container">
                { this.state.loading ? 
                          <LoadingOverlay
                            active={this.state.loading}
                            spinner
                            text='Msg posted <3'
                            className='cover'
                            >
                            {/* <p>Some content or children or something.</p> */}
                          </LoadingOverlay>    
                   : null }

                <div class="heading-div">
                  <img src="./flask.png" class="flask"></img><h3 class="heading-label"> ~ the bs pager ~ </h3> <img class="flask" src="./flask.png"></img>
                </div>
                            <label className="status-label" htmlFor="username">{this.state.statusMessage}</label>
                            <br></br>
                          
                            <div class="text-div">
                            <textarea className="text-input"
                                rows="2"
                                id="message"
                                name="message"
                                placeholder="Write your message here o.O"
                                value={this.state.message}
                                onChange={this.handleChange}
                            />
                            </div>
                          <br></br>
                          <br></br>
                          <label class="color-label" htmlFor="favcolor">Text</label>
                          <br></br>
                        <input type="color" id="favcolor" className="colorPicker" name="color" onChange={this.handleChange} value={this.state.color}></input>
                        <br></br>
                        <label class="color-label" htmlFor="colorOutline">Outline</label>
                        <br></br>
                        <input type="color" id="colorOutline" className="colorPicker" name="colorOutline" onChange={this.handleChange} value={this.state.colorOutline}></input>
                        <br></br>
                        <label class="color-label" htmlFor="bgColor">Background</label>
                        <br></br>
                        <input type="color" id="bgColor" className="colorPicker" name="bgColor" onChange={this.handleChange} value={this.state.bgColor}></input>
                        <br></br>
                        <label class="slider-label" htmlFor="speed">Speed</label>
                        <br></br>
                        <input type="range" min="1" max="8" step="0.1" id="speed" className="slider" name="speed" onChange={this.handleChange} value={this.state.speed}></input>
                        <br></br>
                        <label class="slider-label" htmlFor="spacing">Letter spacing</label>
                        <br></br>
                        <input type="range" min="-10" max="10" step="1"id="spacing" className="slider" name="spacing" onChange={this.handleChange} value={this.state.spacing}></input>
                        
                        
                    
                        <div className="col-7"></div>
                        <br></br>
                        <div className="text-div">
                        <button
                            className="btn synthToolButton"
                            onClick={this.handleSubmit}
                            type="submit"
                            disabled={this.state.loading}>
                              Post message!
                        </button>
                        </div>
                  
               
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

      
    )
  }
}



export default App;
