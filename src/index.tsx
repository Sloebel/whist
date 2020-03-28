import React from "react";
import ReactDOM from "react-dom";
import "pure-swipe";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.scss";

ReactDOM.render(
  <Router basename={process.env.PUBLIC_URL}>
    <App />
  </Router>,
  document.getElementById("root")
);
registerServiceWorker();
