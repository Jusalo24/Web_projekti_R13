import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import './App.css'
import axios from 'axios'
import navbar from './components/navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Groups from './pages/Groups'





function App() {
  const [count, setCount] = useState(0)
  return (
    <Router>
      <nav className= "Navbar">



      </nav>

      <main>


      </main>

      
    </Router>
  )
}

export default App
