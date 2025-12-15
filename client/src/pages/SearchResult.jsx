import React from "react";
import { useLocation } from "react-router-dom";
import GetMoviesSeries from "../components/GetMoviesSeries";
import "../styles/search-result.css";

export default function SearchResult() {
  const location = useLocation();
  const search = new URLSearchParams(location.search).get("search") || "";

  return (
    <div className="search-result">
      <div className="search-result__header">
        <h2 className="search-result__title">
          {search ? `Search results for "${search}"` : "Movies"}
        </h2>
      </div>
      <div className="search-result__movies">
        <GetMoviesSeries query={search} horizontal={false}/>
      </div>
    </div>
  );
}