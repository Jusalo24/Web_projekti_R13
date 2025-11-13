import { useState, useEffect } from 'react'
import { Routes, Route, Router } from "react-router-dom"
import './App.css'
import axios from 'axios'
import Navbar from "./components/navbar"
import Home from "./pages/Home"
// Voit lisätä nämä myöhemmin:
import Movies from "./pages/Movies"
import Groups from "./pages/Groups"
import Account from "./pages/Account"

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  )
}

export default App

