import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

window.onfocus = () => {
  console.log('The user is back to the page!')
  // When the user comes back to the page, we want to make sure that the
  // service worker is activated. This is because the service worker will
  // stop running when the user closes the tab.
  // We can use the `clients.claim()` method to activate the service worker
  // immediately.
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLAIM_CLIENTS' });
  }
};

serviceWorker.register({
  onUpdate: async registration => {
    // We want to run this code only if we detect a new service worker is
    // waiting to be activated.
    // Details about it: https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
    if (registration && registration.waiting) {
      await registration.unregister();
      // Makes Workbox call skipWaiting()
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      // Once the service worker is unregistered, we can reload the page to let
      // the browser download a fresh copy of our app (invalidating the cache)
      window.location.reload();
    }
  },
});
