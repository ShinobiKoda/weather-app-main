"use client";
import React from "react";
import { IoIosSearch } from "react-icons/io";
import { ClipLoader } from "react-spinners";

type SuggestionItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
};

type Props = {
  query: string;
  setQuery: (v: string) => void;
  handleSearch: () => Promise<void>;
  suggestions: SuggestionItem[];
  suggestionLoading: boolean;
  selectSuggestion: (item: SuggestionItem) => Promise<void> | void;
};

export default function SearchBar({
  query,
  setQuery,
  handleSearch,
  suggestions,
  suggestionLoading,
  selectSuggestion,
}: Props) {
  const showList =
    suggestionLoading ||
    (query && query.trim().length > 0 && suggestions.length > 0);
  return (
    <div className="w-full relative lg:static">
      <div className="w-full flex items-center bg-neutral-800 rounded-xl gap-2 text-xl text-neutral-200 font-medium p-4 lg:p-0">
        <IoIosSearch size={25} />
        <input
          value={query ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          type="text"
          className="border-none outline-none placeholder:text-neutral-300 placeholder:text-lg w-full"
          placeholder="Search for a place..."
          aria-label="location-search"
        />
      </div>
      <div>
        <div
          className={`${
            !showList ? "hidden" : ""
          } bg-neutral-800 border border-neutral-700 rounded-xl w-full absolute p-4 left-0 top-18 z-30`}
          role="listbox"
          aria-label="location-suggestions"
        >
          <p className="font-medium text-base flex items-center gap-2">
            {suggestionLoading ? (
              <ClipLoader color="white" size={20} />
            ) : (
              <ClipLoader color="white" size={20} />
            )}
            <span className="text-right">City</span>
          </p>
          <div className="w-full text-right">
            {suggestions.length === 0 ? (
              <div className="text-sm text-neutral-400">No suggestions</div>
            ) : (
              <ul className="space-y-2 mt-2 max-h-[164px] overflow-y-scroll">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left text-base font-medium hover:bg-neutral-700 hover:border border-neutral-600 rounded-lg px-2 py-2.5"
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
