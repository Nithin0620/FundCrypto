import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {BrowserRouter} from "react-router-dom"

import {chainId, ThirdWebProvider} from "@thirdweb-dev/react"
import { StateContextProvider } from "./context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThirdWebProvider desiredChainId={chainId.sepolia}>
    <BrowserRouter>
      <React.StrictMode>
        <StateContextProvider>
          <App />
        </StateContextProvider>
      </React.StrictMode>
    </BrowserRouter>
  </ThirdWebProvider>
);
