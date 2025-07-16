import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

// Get the root element
const container = document.getElementById("root");

// Create a root
const root = createRoot(container);

// Render the App component
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);