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
      textureSpeed: -1,            // Default speed value for texture animations
      rawTextureSpeed: 0,          // Raw value of the texture speed slider (range -1 to 1)
      transformedTextureSpeed: -1, // Transformed texture speed value based on rawTextureSpeed
      brightness: 100,             // Default brightness level for texture
      statusArr: [],
      conToHost: false,
      conToServer: false,
      status: 'lobby',
      statusMessage: 'Searching for screen...',
      answers: [],
      message: '',
      loading: false,
      isTextureMode: true,
      textureFile: null
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleAnswer = this.handleAnswer.bind(this)
    this.handleSpeedChange = this.handleSpeedChange.bind(this); 
  }

  handleSpeedChange(event) {
    const rawTextureSpeed = parseFloat(event.target.value);
    // Apply exponential scaling for texture speed
    const transformedTextureSpeed = this.transformSpeedValue(rawTextureSpeed);
    this.setState({ rawTextureSpeed, transformedTextureSpeed });
  }
  
  // Transformation function for texture speed
  transformSpeedValue(rawTextureSpeed) {
    if (rawTextureSpeed < 0) {
      // Map -1 to 0 to 3000 to -1 (exponential decrease)
      return -1 * Math.exp(-3 * rawTextureSpeed); // Returns a value between 3000 and -1
    } else if (rawTextureSpeed > 0) {
      // Map 0 to 1 to -1 to 1 (exponential increase)
      return Math.exp(3 * rawTextureSpeed) - 1; // Returns a value between -1 and 1
    }
    return -1; // Default for the middle value (rawSpeed = 0)
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
    event.preventDefault();
    if (this.state.conToServer) {
      if (this.state.message === 'rugoingtothemall') {
        socket.emit('hardreboot');
      } else {
        // Determine if we are sending text or a texture
        if (this.state.isTextureMode) {
          // Texture mode: send textureFile only if it's selected
          if (this.state.textureFile) {
            socket.emit('submitMessage', {
              message: '', // Empty message when sending texture
              textureFile: this.state.textureFile,
              color: this.hexTorgb(this.state.color),
              colorOutline: this.hexTorgb(this.state.colorOutline),
              bgColor: this.hexTorgb(this.state.bgColor),
              textureSpeed: this.state.transformedTextureSpeed,
              spacing: this.state.spacing,
              brightness: this.state.brightness
            });
            this.setState({ loading: true });
          } else {
            alert('Please select a texture to play.');
          }
        } else {
          // Text mode: send message
          if (this.state.message.trim() !== '') {
            socket.emit('submitMessage', {
              message: this.state.message,
              textureFile: null, // No texture when sending text
              color: this.hexTorgb(this.state.color),
              colorOutline: this.hexTorgb(this.state.colorOutline),
              bgColor: this.hexTorgb(this.state.bgColor),
              speed: this.state.speed,
              spacing: this.state.spacing
            });
            this.setState({ loading: true });
          } else {
            alert('Please enter a message to post.');
          }
        }
        setTimeout(() => {
          this.setState({ loading: false });
        }, 1600);
      }
    } else {
      alert('Ph. reception is not so good o.O');
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
                            text={!this.state.isTextureMode ? 'Posting message now :D' : 'Posting texture!'}
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

                {/* <div className="heading-div">
                  <img src="./flask.png" className="flask" alt=""></img><h3 className="heading-label"> ~ trap butt ~ </h3> <img className="flask" src="./flask.png" alt=""></img>
                </div> */}
                            <label className="status-label" htmlFor="username">{this.state.statusMessage}</label>
                            <br></br>


                          {/*  message input field */}
                            <div className="text-div">
                            <div className="tab-container">
                              
                          {/* Tab for Message Mode */}
                          <div
                            className={`tab ${!this.state.isTextureMode ? 'active-tab' : ''}`}
                            onClick={() => this.setState({ isTextureMode: false })}
                          >
                            Messages
                          </div>

                          {/* Tab for Texture Mode */}
                          <div
                            className={`tab ${this.state.isTextureMode ? 'active-tab' : ''}`}
                            onClick={() => this.setState({ isTextureMode: true })}
                          >
                            Textures
                          </div>
                        </div>


                          {/* Add texture selection UI here */}
                          {this.state.isTextureMode && (
  <div className="texture-selection">
    {/* Scrollable div that takes up 60% of the viewport height */}
    <div className="scrollable-texture-grid">
      {/* Grid that contains all texture items */}
      <div className="texture-grid">
        {/* Generate an array of numbers from 1 to 126 */}
        {Array.from({ length: 258 }, (_, i) => (i + 1).toString()).reverse()
        .filter((texture) => !['231', '208', '205', '200', '178', '150', '149'].includes(texture)) // Filter out the dud textures!
        .map((texture) => (
          <div
            key={texture}
            className={`texture-item ${this.state.textureFile === 'trippy' + texture ? 'selected' : ''}`}
            onClick={() => this.setState({ textureFile: 'trippy' + texture })}
          >
            <img
              src={`./texture-thumbs/trippy${texture}.gif`}
              className="texture-thumbnail"
              alt={`trippy${texture}`}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)}




                            </div>

                            {this.state.isTextureMode == false && (
                              <>

                              <textarea className="text-input"
                                rows="2"
                                id="message"
                                name="message"
                                placeholder="Write your message here o.O"
                                value={this.state.message}
                                onChange={this.handleChange}
                            />
                          <br></br>
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
                        </>
                      )}
                        
                    
                        <div className="col-7"></div>
                        <br></br>
                        <div className="text-div">
                        <button
                            className="btn synthToolButton"
                            onClick={this.handleSubmit}
                            type="submit"
                            disabled={this.state.loading}>
                              {this.state.isTextureMode ? 'Post Texture' : 'Post Message'}
                        </button>

                        <br></br><br></br>
                        {/* New Sliders Section: Brightness and Speed */}
                        {this.state.isTextureMode && (
  <div className="slider-container">
    {/* Slider for Brightness in Texture Mode */}
    <div className="slider-column">
      <label className="slider-label" htmlFor="brightness">Brightness</label>
      <input
        type="range"
        id="brightness"
        name="brightness"
        min="0"
        max="100"
        step="1"
        value={this.state.brightness}
        onChange={this.handleChange}
        className="slider"
      />
    </div>
    {/* Slider for Texture Speed */}
    <div className="slider-column">
  <label className="slider-label" htmlFor="textureSpeed">Texture Speed</label>

  {/* Toggle button to enable/disable custom speed */}
  <div>
    <button
      onClick={() => this.setState(prevState => ({
        customSpeedEnabled: !prevState.customSpeedEnabled, // Toggle the custom speed state
        rawTextureSpeed: prevState.customSpeedEnabled ? 0 : 1, // Reset speed to default when toggling
        transformedTextureSpeed: prevState.customSpeedEnabled ? -1 : 1 // Default to -1 if disabled, 1 if enabled
      }))}
    >
      {this.state.customSpeedEnabled ? 'Disable Custom Speed' : 'Enable Custom Speed'}
    </button>
  </div>

  {/* Show slider only when custom speed is enabled */}
  {this.state.customSpeedEnabled && (
    <>
      <input
        type="range"
        id="textureSpeed"
        name="textureSpeed"
        min="1" // Minimum value (top of the slider)
        max="3000" // Maximum value (bottom of the slider)
        step="1"
        value={3001 - this.state.rawTextureSpeed} // Invert value for display
        onChange={this.handleInvertedSpeedChange} // Custom handler for inverted speed
        className="slider inverted-slider" // Apply custom CSS for visual inversion
      />
      <div className="slider-value">Speed: {this.state.transformedTextureSpeed.toFixed(0)}</div>
    </>
  )}
</div>

  </div>
)}


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
