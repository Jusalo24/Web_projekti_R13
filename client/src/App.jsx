import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import './styles/App.css'
import axios from 'axios'
import Navbar from "./components/navbar"
import Home from "./pages/Home"
import Movies from "./pages/Movies"
import Groups from "./pages/Groups"
import Account from "./pages/Account"
import SearchResult from "./pages/SearchResult"

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/account" element={<Account />} />
        <Route path="/SearchResult" element={<SearchResult />} />
      </Routes>
    </>
  )
}

export default App
