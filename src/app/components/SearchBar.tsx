"use client";
import React from "react";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { ClipLoader } from "react-spinners";
import { motion } from "motion/react";
import { scaleOnHover } from "./animations/motion";

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
  onClose?: () => void;
};

export default function SearchBar({
  query,
  setQuery,
  handleSearch,
  suggestions,
  suggestionLoading,
  selectSuggestion,
  onClose,
}: Props) {
  const hasQuery = query && query.trim().length > 0;
  const [hideList, setHideList] = React.useState(false);

  const showList = (suggestionLoading || hasQuery) && !hideList;

  React.useEffect(() => {
    setHideList(false);
  }, [query, suggestionLoading, suggestions.length]);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (!containerRef.current) return;
      if (target && !containerRef.current.contains(target)) {
        if (showList) {
          setHideList(true);
          if (onClose) onClose();
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showList, onClose]);
  return (
    <div className="w-full relative lg:static" ref={containerRef}>
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
        {(hasQuery || suggestionLoading) && (
          <motion.button
            type="button"
            aria-label="clear-search"
            title={hasQuery ? "Clear search" : "Close search"}
            className="text-neutral-300 cursor-pointer"
            onClick={() => {
              if (hasQuery) setQuery("");
              else if (onClose) onClose();
            }}
            variants={scaleOnHover}
            initial="hidden"
            whileHover="hover"
            whileTap="tap"
          >
            <IoMdClose size={25} />
          </motion.button>
        )}
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
              <>
                <ClipLoader color="white" size={20} />
                <span>Loading cities</span>
              </>
            ) : (
              <span>City</span>
            )}
          </p>
          <div className="w-full text-right">
            {suggestions.length === 0 ? (
              suggestionLoading ? null : (
                <div className="text-sm text-neutral-400">
                  No city suggestions
                </div>
              )
            ) : (
              <ul className="space-y-2 mt-2 max-h-[164px] overflow-y-scroll">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={async () => {
                        // hide suggestions immediately for snappy UX
                        setHideList(true);
                        // clear the input in the UI immediately
                        setQuery("");
                        // call parent selection handler
                        await selectSuggestion(s);
                        // if parent provided onClose (mobile overlay), close it
                        if (onClose) onClose();
                      }}
                      className="w-full text-left text-base font-medium hover:bg-neutral-700 hover:border border-neutral-600 rounded-lg px-2 py-2.5 cursor-pointer"
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
