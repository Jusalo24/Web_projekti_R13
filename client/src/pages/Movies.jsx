import { useEffect, useState } from "react";
import GetMovies from "../components/GetMovies";
import GetGenre from "../components/GetGenre";
import GetCast from "../components/GetCast";
import "../styles/movies.css";

export default function Movies() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedReleaseYear, setSelectedReleaseYear] = useState("");
  const [withCast, setWithCast] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("popularity.desc");
  const [queryParams, setQueryParams] = useState({});

  const handleFilterChange = () => {
    const params = {};
    if (selectedGenre) params.with_genres = selectedGenre;
    if (selectedReleaseYear) params.primary_release_year = selectedReleaseYear;
    if (withCast) params.with_cast = withCast;
    if (selectedSortBy) params.sort_by = selectedSortBy;
    setQueryParams(params);
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedGenre, selectedReleaseYear, withCast, selectedSortBy]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const sortOptions = [
    { value: "popularity.desc", label: "Popularity Desc" },
    { value: "popularity.asc", label: "Popularity Asc" },
    { value: "vote_average.desc", label: "Rating Desc" },
    { value: "vote_average.asc", label: "Rating Asc" },
    { value: "primary_release_date.desc", label: "Release Date Desc" },
    { value: "primary_release_date.asc", label: "Release Date Asc" },
    { value: "original_title.asc", label: "Title (A-Z)" },
    { value: "original_title.desc", label: "Title (Z-A)" },
    { value: "revenue.desc", label: "Revenue Desc" },
    { value: "revenue.asc", label: "Revenue Asc" },
    { value: "vote_count.desc", label: "Vote Count Desc" },
    { value: "vote_count.asc", label: "Vote Count Asc" },
  ];

  const handleClearFilters = () => {
    setSelectedGenre("");
    setSelectedReleaseYear("");
    setWithCast("");
    setSelectedSortBy("popularity.desc");
  };

  return (
    <main className="movies-page">
      <div className="movies-page__header">
        <h2 className="movies-page__title">Discover Movies</h2>
        <p className="movies-page__subtitle"></p>
      </div>

      <div className="movies-page__filters">
        <div className="filter-group">
          <label className="filter-group__label">Genre</label>
          <GetGenre onSelect={setSelectedGenre} selectedGenre={selectedGenre} />
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Release Year</label>
          <select
            className="filter-group__select"
            value={selectedReleaseYear}
            onChange={(e) => setSelectedReleaseYear(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Sort By</label>
          <select
            className="filter-group__select"
            value={selectedSortBy}
            onChange={(e) => setSelectedSortBy(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-group__label">Cast</label>
          <GetCast onSelect={setWithCast} />
        </div>

        <button className="filter-clear-btn" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="movies-page__results">
        <GetMovies
          type="discover"
          {...queryParams}
          page={1}
          imageSize="w500"
        />
      </div>
    </main>
  );
}