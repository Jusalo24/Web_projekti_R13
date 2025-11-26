import React from 'react'
import { BrowserRouter } from "react-router-dom"
import ReactDOM from "react-dom/client"
import { StrictMode } from 'react'
import './styles/index.css'
import './styles/Navbar.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext"

ReactDOM.createRoot(document.getElementById('root')).render(
 <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);