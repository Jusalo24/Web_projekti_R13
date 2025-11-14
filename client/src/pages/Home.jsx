import "../styles/home.css";
import GetMovies from "../components/GetMovies";

export default function Home() {
  return (
    <main className="content">
      <h2>Now Playing in Finland</h2>
      <div className="movie-box">
        <GetMovies type="now_playing" region="FI" page={1} imageSize="w500"/>
      </div>

      <h2>Top 10 Movies</h2>
      <div className="top-movies">
        <GetMovies type="top_rated" page={1} imageSize="w500" limit={10}/>
      </div>
    </main>
  )
}
