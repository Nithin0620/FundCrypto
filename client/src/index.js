import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {BrowserRouter} from "react-router-dom"

import { ThirdwebProvider } from "thirdweb/react";
import { StateContextProvider } from "./context/index";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThirdwebProvider activeChain="sepolia">
      <React.StrictMode>
        <StateContextProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StateContextProvider>
      </React.StrictMode>
  </ThirdwebProvider>
);
