import React, { Component } from "react";
import LoadingOverlay from 'react-loading-overlay';
import io from "socket.io-client";
import "./App.css"
// import bgImage from "./bg.png"
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
      speed: "1.3",
      spacing: "1",
      statusArr: [],
      conToHost: false,
      conToServer: false,
      status: 'lobby',
      statusMessage: 'Searching for screen...',
      answers: [],
      message: '',
      loading: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleAnswer = this.handleAnswer.bind(this)
  }

  componentDidMount() {
    document.addEventListener('visibilitychange', this.checkForUpdates)
    document.addEventListener('blur', this.checkForUpdates)
    window.addEventListener('blur', this.checkForUpdates)
    window.addEventListener('focus', this.checkForUpdates)
    document.addEventListener('focus', this.checkForUpdates)

    socket.on('connect', (socket) => {
      this.setState({
        conToServer: true,
        status: 'lobby',
        statusMessage: 'Connected to screen'
      })
    })

    // can't get this to recieve for some reason
    socket.on('status', (data) => {
      this.setState({
        status: data.status,
        statusMessage: data.statusMessage
      })

      if (data.status === 'question') {
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

  checkForUpdates = () => {
    console.log('The user is back to the page!')
    navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((reg) => reg.update()));
  }

  randomiseColors() {
    var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    var randomColor2 = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    var randomColor3 = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    
    this.setState({
      color: randomColor,
      colorOutline: randomColor2,
      bgColor: randomColor3
    })
  }

  componentWillUnmount() {
    this.props.socket.emit('removeUser', {room: this.state.currentRoom, msg: `removeUser`});
    this.setState({ statusArr: [], conToHost: false });

    window.removeEventListener('blur', this.checkForUpdates)
    document.removeEventListener('blur', this.checkForUpdates)
    window.removeEventListener('focus', this.checkForUpdates)
    document.removeEventListener('focus', this.checkForUpdates)
    document.removeEventListener('visibilitychange', this.checkForUpdates)
  }

  handleChange(event) {
    this.setState({
        [event.target.name]: event.target.value
    })
  }

  
  handleSubmit(event) {
      event.preventDefault()
      if(this.state.conToServer) {
        if (this.state.message === 'rugoingtothemall') {
          socket.emit('hardreboot')
        } else {
          if(this.state.message.trim() !== '') {
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
      
      <div
        className="App"
        // style={{ backgroundImage: 'url(' + bgImage + ')', backgroundSize: 'auto', backgroundPosition: '0 0' }}
      >

        {(() => {
        switch (this.state.status) {

          case 'lobby':
            return (
      
              <div className="container">
                { this.state.loading ? 
                          <LoadingOverlay
                            active={this.state.loading}
                            spinner
                            text='Posting message now... :D'
                            styles={{
                              overlay: (base) => ({
                                ...base,
                                background: 'rgba(19, 19, 19, 0.9)',
                                position:'fixed',
                                top:0,
                                left:0,
                                zIndex:5,
                                width:'100%',
                                height:'100%',
                              })
                            }}
                            >
                            {/* <p>Some content or children or something.</p> */}
                          </LoadingOverlay>    
                   : null }

                <div className="heading-div">
                  <img src="./flask.png" className="flask" alt=""></img><h3 className="heading-label"> ~ get fucked ya bozo ~ </h3> <img className="flask" src="./flask.png" alt=""></img>
                </div>
                            <label className="status-label" htmlFor="username">{this.state.statusMessage}</label>
                            <br></br>
                          
                            <div className="text-div">
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
                          {/* <br></br> */}
                          <label className="color-label" htmlFor="favcolor">Colour</label>
                          <br></br>
                        <input type="color" id="favcolor" className="colorPicker" name="color" onChange={this.handleChange} value={this.state.color}></input>
                        <br></br>
                        <label className="color-label" htmlFor="colorOutline">Outline</label>
                        <br></br>
                        <input type="color" id="colorOutline" className="colorPicker" name="colorOutline" onChange={this.handleChange} value={this.state.colorOutline}></input>
                        <br></br>
                        <label className="color-label" htmlFor="bgColor">Background</label>
                        <br></br>
                        <input type="color" id="bgColor" className="colorPicker" name="bgColor" onChange={this.handleChange} value={this.state.bgColor}></input>
                        <br></br>
                        <label className="slider-label" htmlFor="speed">Speed</label>
                        <br></br>
                        <input type="range" min="0.1" max="5" step="0.1" id="speed" className="slider" name="speed" onChange={this.handleChange} value={this.state.speed}></input>
                        <br></br>
                        <label className="slider-label" htmlFor="spacing">Letter spacing</label>
                        <br></br>
                        <input type="range" min="-5" max="8" step="1"id="spacing" className="slider" name="spacing" onChange={this.handleChange} value={this.state.spacing}></input>
                        
                        
                    
                        <div className="col-7"></div>
                        <br></br>
                        <div className="text-div">
                        <button
                            className="btn synthToolButton"
                            onClick={this.handleSubmit}
                            type="submit"
                            disabled={this.state.loading}>
                              Post message
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
