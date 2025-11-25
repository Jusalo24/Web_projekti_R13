import React from "react";
import "../styles/home.css";
import GetMoviesSeries from "../components/GetMoviesSeries";

export default function Home() {
  const imageSize = "w342"; // Size of poster images: w780, w500, w342, w185, w154, w92, original
  return (
    <main className="home">
      <section className="home__section">
        <h2 className="home__section-title">Now Playing in Finland</h2>
        <div className="home__movies-container">
          <GetMoviesSeries type="now_playing" region="FI" page={1} pages={3} imageSize={imageSize} />
        </div>
      </section>

      <section className="home__section">
        <h2 className="home__section-title">Top 10 Movies</h2>
        <div className="home__movies-container">
          <GetMoviesSeries type="top_rated" page={1} imageSize={imageSize} limit={10} />
        </div>
      </section>

      <section className="home__section">
        <h2 className="home__section-title">Top 10 TV Shows</h2>
        <div className="home__movies-container">
          <GetMoviesSeries type="top_rated" media_type="tv" page={1} imageSize={imageSize} limit={10} />
        </div>
      </section>

      <section className="home__section">
        <h2 className="home__section-title">Upcoming Movies</h2>
        <div className="home__movies-container">
          <GetMoviesSeries type="upcoming" page={1} pages={2} imageSize={imageSize} />
        </div>
      </section>

      <section className="home__section">
        <h2 className="home__section-title">Popular Movies</h2>
        <div className="home__movies-container">
          <GetMoviesSeries type="popular" page={1} pages={2} imageSize={imageSize} />
        </div>
      </section>
    </main>
  );
}