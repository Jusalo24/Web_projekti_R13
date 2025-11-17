import { useLocation } from "react-router-dom";
import GetMovies from "../components/GetMovies";
import "../styles/searchResult.css";

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
        <GetMovies query={search} />
      </div>
    </div>
  );
}