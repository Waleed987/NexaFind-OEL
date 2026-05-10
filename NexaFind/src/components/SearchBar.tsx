"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SearchBarProps {
  initialQuery: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ initialQuery, onSearch }: SearchBarProps) {
  const [input, setInput] = useState(initialQuery);
  const [hints, setHints] = useState<string[]>([]);
  const [hintsVisible, setHintsVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputEl = useRef<HTMLInputElement>(null);
  const dropdownEl = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // grabs autocomplete results from our api
  const loadHints = useCallback(async (text: string) => {
    if (text.length < 2) {
      setHints([]);
      return;
    }
    try {
      const resp = await fetch(`/api/suggest?q=${encodeURIComponent(text)}`);
      const body = await resp.json();
      setHints(body.suggestions || []);
      setHintsVisible(true);
    } catch {
      setHints([]);
    }
  }, []);

  // sync with url params when they change externally
  useEffect(() => {
    setInput(initialQuery);
  }, [initialQuery]);

  const onInputChange = (val: string) => {
    setInput(val);
    setActiveIdx(-1);
    // debounce so we dont spam the api
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => loadHints(val), 300);
  };

  const submitSearch = (searchText?: string) => {
    const term = searchText ?? input;
    setHintsVisible(false);
    setHints([]);
    onSearch(term);
  };

  // keyboard nav for the suggestion dropdown
  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, hints.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && hints[activeIdx]) {
        setInput(hints[activeIdx]);
        submitSearch(hints[activeIdx]);
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setHintsVisible(false);
    }
  };

  // close dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        dropdownEl.current &&
        !dropdownEl.current.contains(e.target as Node) &&
        inputEl.current &&
        !inputEl.current.contains(e.target as Node)
      ) {
        setHintsVisible(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="search-bar-container">
      <div className="search-bar-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputEl}
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Discover products..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyPress}
          onFocus={() => hints.length > 0 && setHintsVisible(true)}
          autoComplete="off"
        />
        {input && (
          <button
            className="clear-btn"
            onClick={() => {
              setInput("");
              setHints([]);
              setHintsVisible(false);
              inputEl.current?.focus();
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button
          id="search-button"
          className="search-btn"
          onClick={() => submitSearch()}
        >
          Search
        </button>
      </div>
      {hintsVisible && hints.length > 0 && (
        <div ref={dropdownEl} className="suggestions-dropdown">
          {hints.map((hint, idx) => (
            <button
              key={idx}
              className={`suggestion-item ${idx === activeIdx ? "selected" : ""}`}
              onClick={() => {
                setInput(hint);
                submitSearch(hint);
              }}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span>{hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
