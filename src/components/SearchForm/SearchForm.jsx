import { useState } from "react";
import "./SearchForm.css";

function SearchForm({ onSearch }) {
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
        onChange={(e) => setFrom(e.target.value)}
      />

      <input
        className="search__input"
        placeholder="To (e.g JFK)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <input
        className="search__input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button className="search__btn" type="submit">
        Search
      </button>
    </form>
  );
}

export default SearchForm;
