import { useState } from "react";
import "./SearchForm.css";

function SearchForm({ onSearch, isLoading }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(from.trim().toUpperCase(), to.trim().toUpperCase(), date);
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        className="search__input"
        placeholder="From (e.g TLV)"
        value={from}
        maxLength={3}
        pattern="[A-Za-z]{3}"
        title="Use a 3-letter airport code"
        required
        onChange={(e) => setFrom(e.target.value)}
      />

      <input
        className="search__input"
        placeholder="To (e.g JFK)"
        value={to}
        maxLength={3}
        pattern="[A-Za-z]{3}"
        title="Use a 3-letter airport code"
        required
        onChange={(e) => setTo(e.target.value)}
      />

      <input
        className="search__input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button className="search__btn" type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

export default SearchForm;
