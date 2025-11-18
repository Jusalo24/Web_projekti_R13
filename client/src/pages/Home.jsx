import "../styles/home.css";
import GetMovies from "../components/GetMovies";

export default function Home() {
  return (
    <main className="home">
      <section className="home__section">
        <h2 className="home__section-title">Now Playing in Finland</h2>
        <div className="home__movies-container">
          <GetMovies type="now_playing" region="FI" page={1} pages={3} imageSize="w500" />
        </div>
      </section>

      <section className="home__section">
        <h2 className="home__section-title">Top 10 Movies</h2>
        <div className="home__movies-container">
          <GetMovies type="top_rated" page={1} imageSize="w500" limit={10} />
        </div>
      </section>
    </main>
  );
}