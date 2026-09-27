// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.jsx"; // explicit extension, or just "./App" if your bundler resolves .jsx

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);