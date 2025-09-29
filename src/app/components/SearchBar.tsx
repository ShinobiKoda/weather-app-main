"use client";
import React, { useState } from "react";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { ClipLoader } from "react-spinners";
import { motion } from "motion/react";
import { CiMicrophoneOn } from "react-icons/ci";

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
  onOpen?: () => void;
  autoFocus?: boolean;
  closeOnOutsideClick?: boolean;
  suppressSuggestions?: boolean;
};

declare global {
  class SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult:
      | ((e: {
          resultIndex: number;
          results: Array<{ isFinal: boolean; 0: { transcript: string } }>;
        }) => void)
      | null;
    onerror: ((e: unknown) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    constructor();
  }

  interface Window {
    webkitSpeechRecognition?: typeof SpeechRecognition;
    SpeechRecognition?: typeof SpeechRecognition;
  }
}

export default function SearchBar({
  query,
  setQuery,
  handleSearch,
  suggestions,
  suggestionLoading,
  selectSuggestion,
  onClose,
  onOpen,
  autoFocus,
  closeOnOutsideClick,
  suppressSuggestions = false,
}: Props) {
  const hasQuery = query && query.trim().length > 0;
  const [hideList, setHideList] = React.useState(false);
  const [active, setActive] = useState(false);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const showList =
    !suppressSuggestions && (suggestionLoading || hasQuery) && !hideList;

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
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {}
            setActive(false);
          }
          return;
        }

        if (closeOnOutsideClick && onClose) {
          setHideList(true);
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {}
            setActive(false);
          }
          onClose();
          return;
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showList, onClose, closeOnOutsideClick]);
  React.useEffect(() => {
    const localWin =
      typeof window !== "undefined" ? (window as unknown as Window) : undefined;
    if (typeof localWin === "undefined") return;
    const SR = localWin.SpeechRecognition || localWin.webkitSpeechRecognition;
    if (!SR) return;

    const recog: SpeechRecognition = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }

      if (final.trim().length > 0) {
        setQuery(final.trim());
      } else if (interim.trim().length > 0) {
        setQuery(interim.trim());
      }
    };

    recog.onerror = (e) => {
      const extract = (obj: unknown) => {
        try {
          if (typeof obj === "object" && obj !== null) {
            const o = obj as Record<string, unknown>;
            if (Object.prototype.hasOwnProperty.call(o, "error"))
              return o["error"];
            if (Object.prototype.hasOwnProperty.call(o, "message"))
              return o["message"];
          }
          return obj;
        } catch {
          return "<unreadable>";
        }
      };

      try {
        console.warn("Speech recognition error (onerror):", extract(e));
      } catch {
        console.warn("Speech recognition error (onerror): unknown");
      }

      setActive(false);
      try {
        if (recog && typeof recog.stop === "function") recog.stop();
      } catch {
        // ignore stop errors
      }
    };

    recog.onend = () => {
      setActive(false);
    };

    recognitionRef.current = recog;

    return () => {
      try {
        recog.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, [setQuery]);

  React.useEffect(() => {
    if (!recognitionRef.current) return;
    try {
      if (active) recognitionRef.current.start();
      else recognitionRef.current.stop();
    } catch {}
  }, [active]);

  React.useEffect(() => {
    if (!autoFocus) return;
    const t = window.setTimeout(() => {
      try {
        inputRef.current?.focus();
      } catch {}
    }, 50);
    return () => clearTimeout(t);
  }, [autoFocus]);
  return (
    <div className="w-full relative lg:static" ref={containerRef}>
      <div className="w-full flex items-center bg-neutral-800 rounded-xl gap-2 text-xl text-neutral-200 font-medium p-4 lg:p-0">
        <IoIosSearch size={25} />
        <input
          ref={inputRef}
          value={query ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (onOpen) onOpen();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          type="text"
          className="border-none outline-none placeholder:text-neutral-300 placeholder:text-lg w-full"
          placeholder="Search for a place..."
          aria-label="location-search"
        />
        <motion.button
          onClick={() => setActive(!active)}
          variants={scaleOnHover}
          initial="hover"
          whileHover="hover"
          whileTap="tap"
          className="relative w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          <motion.div
            animate={{
              color: active ? "#ffffff" : "#737373",
            }}
            transition={{ duration: 0.5 }}
          >
            <CiMicrophoneOn size={25} />
          </motion.div>

          <motion.svg
            viewBox="0 0 25 25"
            className="absolute w-6 h-6"
            initial={false}
            animate={
              active ? { scale: 1, opacity: 0 } : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.4 }}
          >
            <motion.line
              x1="3"
              y1="22"
              x2="22"
              y2="3"
              stroke="#737373"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
        </motion.button>
        {(hasQuery || suggestionLoading) && (
          <motion.button
            type="button"
            aria-label="clear-search"
            title={hasQuery ? "Clear search" : "Close search"}
            className="text-neutral-300 cursor-pointer"
            onClick={() => {
              if (hasQuery) setQuery("");
              else if (onClose) onClose();
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch {}
                setActive(false);
              }
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
          } bg-neutral-800 border border-neutral-700 rounded-xl w-full absolute p-4 left-0 bottom-full -translate-y-2 z-30 lg:top-18 lg:bottom-auto lg:translate-y-0`}
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
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // stop recognition if active
                        if (recognitionRef.current) {
                          try {
                            recognitionRef.current.stop();
                          } catch {}
                          setActive(false);
                        }

                        setHideList(true);

                        setQuery("");
                        await selectSuggestion(s);

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
