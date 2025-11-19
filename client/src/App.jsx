import { Routes, Route } from "react-router-dom"
import './styles/app.css'
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Discover from "./pages/Discover"
import Groups from "./pages/Groups"
import Account from "./pages/Account"
import SearchResult from "./pages/SearchResult"
import MovieDetail from "./pages/MovieDetail"

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
      </Routes>
    </>
  )
}

export default App
