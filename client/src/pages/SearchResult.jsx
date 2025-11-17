import { useLocation } from "react-router-dom";
import GetMovies from "../components/GetMovies";

export default function SearchResult() {
  const location = useLocation();
  const search = new URLSearchParams(location.search).get("search") || "";

  return (
    <div>
      <h2>{search ? `Search results for "${search}"` : "Movies"}</h2>
      <GetMovies query={search} />
    </div>
  );
}
