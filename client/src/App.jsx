import React from "react";
import { Routes, Route } from "react-router-dom"
import './styles/App.css'
import './styles/Navbar.css'
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Discover from "./pages/Discover"
import Groups from "./pages/Groups"
import Account from "./pages/Account"
import SearchResult from "./pages/SearchResult"
import MovieDetail from "./pages/MovieDetail"
import Login from "./pages/Login"
import Register from "./pages/Register"
import GroupDetails from "./pages/GroupDetails"
import SharedList from "./pages/SharedList"

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/account" element={<Account />} />
        <Route path="/SearchResult" element={<SearchResult />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/groupDetails/:id" element={<GroupDetails />} />
        <Route path="/shared/:shareToken" element={<SharedList />} />
      </Routes>
    </>
  )
}

export default App
