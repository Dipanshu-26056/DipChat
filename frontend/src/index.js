
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from 'react-router-dom';
import ChatProvider from './Context/ChatProvider';
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:3000";

ReactDOM.render(
  <BrowserRouter>
    <ChatProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ChatProvider>
  </BrowserRouter>,
  document.getElementById('root')
);