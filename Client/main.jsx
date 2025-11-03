import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// Enable future flags for React Router
import {
  UNSAFE_DataRouterStateContext,
  UNSAFE_NavigationContext,
} from "react-router-dom";
// @ts-ignore
UNSAFE_DataRouterStateContext._currentValue = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
import App from "./src/App";
import { AuthProvider } from "./src/context/AuthContext";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
