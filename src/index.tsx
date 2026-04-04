import React from "react";
import { createRoot } from "react-dom/client";
import "pure-swipe";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.scss";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Router basename={process.env.PUBLIC_URL}>
    <App />
  </Router>
);
registerServiceWorker();
