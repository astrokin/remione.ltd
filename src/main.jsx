import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
const root = document.getElementById("root");
const prerendered = root.hasChildNodes();
const app = (
  <React.StrictMode>
    <App
      pathname={window.location.pathname}
      initialSearch={prerendered ? "" : window.location.search}
    />
  </React.StrictMode>
);
if (prerendered) hydrateRoot(root, app);
else createRoot(root).render(app);
void import("./firebase.js");
