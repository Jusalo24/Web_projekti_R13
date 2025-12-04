import React from "react";
import { useEffect, useState, useRef } from "react";
import GetMoviesSeries from "../components/GetMoviesSeries";
import GetGenre from "../components/GetGenre";
import GetCast from "../components/GetCast";
import "../styles/discover.css";

export default function Discover() {
  // State variables for filters
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedReleaseYear, setSelectedReleaseYear] = useState("");
  const [withCast, setWithCast] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("popularity.desc");
  const [selectedMediaType, setSelectedMediaType] = useState("movie");
  const [queryParams, setQueryParams] = useState({});

  const imageSize = "w342"; // Size of poster images: w780, w500, w342, w185, w154, w92, original

  // Ref to track if it's the initial render
  const isInitialRender = useRef(true);

  // Function to update query parameters based on selected filters
  const handleFilterChange = () => {
    const params = {};
    if (selectedGenre !== "") params.with_genres = selectedGenre;
    if (selectedReleaseYear) params.year = selectedReleaseYear;
    if (withCast) params.with_cast = withCast;
    if (selectedSortBy) params.sort_by = selectedSortBy;
    if (selectedMediaType) params.media_type = selectedMediaType;
    setQueryParams(params); // Update queryParams state
  };

  // Reset genre when media type changes
  useEffect(() => {
    setSelectedGenre("");
    setWithCast(""); // Reset cast as well since it's disabled for TV
  }, [selectedMediaType]);

  // Update queryParams whenever any filter changes, but not on initial render
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    handleFilterChange();
  }, [
    selectedGenre,
    selectedReleaseYear,
    withCast,
    selectedSortBy,
    selectedMediaType
  ]);

  // Initial filter setup
  useEffect(() => {
    handleFilterChange();
  }, []);

  // Generate last 100 years for the release year dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Options for sorting
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

  // Media type options
  const mediaTypes = [
    { value: "movie", label: "Movie" },
    { value: "tv", label: "TV Show" },
  ];

  // Function to reset all filters to default values
  const handleClearFilters = () => {
    setSelectedGenre("");
    setSelectedReleaseYear("");
    setWithCast("");
    setSelectedSortBy("popularity.desc");
    setSelectedMediaType("movie");
  };

  return (
    <main className="discover-page">
      {/* Page Header */}
      <div className="discover-page__header">
        <h2 className="discover-page__title">Discover Movies & TV Shows</h2>
        <p className="discover-page__subtitle"></p>
      </div>

      {/* Filters Section */}
      <div className="discover-page__filters">
        {/* Media Type Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Media Type</label>
          <select
            className="filter-group__select"
            value={selectedMediaType}
            onChange={(e) => setSelectedMediaType(e.target.value)}
          >
            {mediaTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Genre Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Genre</label>
          <GetGenre
            onSelect={setSelectedGenre}
            selectedGenre={selectedGenre}
            mediaType={selectedMediaType}
          />
        </div>

        {/* Release Year Filter */}
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

        {/* Sort By Filter */}
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

        {/* Cast Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Cast</label>
          <GetCast
            onSelect={setWithCast}
            disabled={selectedMediaType === "tv"}
          />
        </div>

        {/* Clear Filters Button */}
        <button className="filter-clear-btn" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Movies & TV Shows Results */}
      <div className="discover-page__results">
        <GetMoviesSeries
          type="discover"
          {...queryParams}
          imageSize={imageSize}
        />
      </div>
    </main>
  );
}