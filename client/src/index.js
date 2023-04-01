import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.register({
  onUpdate: registration => {
    // const ok = confirm('New version available. Press ok to reload!')
    // if (ok) {
      console.log('Reloading SW')
      window.location.reload()
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      Promise.resolve().then(() => { window.location.reload(true); });
    // }
  }
});