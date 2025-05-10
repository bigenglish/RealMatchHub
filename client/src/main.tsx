// React should be globally available from the index.html script include
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Use a simpler root creation approach
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
