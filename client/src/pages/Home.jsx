import GetNowPlayingMovies from "../components/GetMovies"

export default function Home() {
  return (
    <main className="content">
      <h2>Now Playing in Finland</h2>
      <div className="movie-box">
        <GetNowPlayingMovies region="FI" page={1} imageSize="w500"/>
      </div>

      <h2>Top 10 Movies</h2>
      <div className="top-movies">
        <p>Coming soon...</p>
      </div>
    </main>
  )
}
