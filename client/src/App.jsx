import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import './styles/App.css'
import axios from 'axios'
import Navbar from "./components/navbar"
import Home from "./pages/Home"
import Movies from "./pages/Movies"
import Groups from "./pages/Groups"
import Account from "./pages/Account"

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </>
  )
}

export default App
