"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import FacetPanel from "@/components/FacetPanel";
import Pagination from "@/components/Pagination";
import SortDropdown from "@/components/SortDropdown";
import type { QueryResult, FacetEntry } from "@/types";

// main search page - handles all the state and routing
function SearchContent() {
  const params = useSearchParams();
  const nav = useRouter();

  // pull current state from url params
  const q = params.get("q") || "";
  const sortBy = params.get("sort") || "score desc";
  const pageNum = parseInt(params.get("page") || "1");
  const activeCats = params.getAll("category");
  const activeBrands = params.getAll("brand");
  const priceMin = params.get("minPrice") || "";
  const priceMax = params.get("maxPrice") || "";
  const stockOnly = params.get("inStock") === "true";

  const [apiData, setApiData] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // constructs a new url with whatever overrides you pass in
  const makeUrl = useCallback(
    (changes: Record<string, string | string[] | undefined>) => {
      const urlParams = new URLSearchParams();
      const merged = {
        q: changes.q !== undefined ? changes.q : q,
        sort: changes.sort !== undefined ? changes.sort : sortBy,
        page: changes.page !== undefined ? changes.page : String(pageNum),
        category:
          changes.category !== undefined
            ? changes.category
            : activeCats,
        brand:
          changes.brand !== undefined ? changes.brand : activeBrands,
        minPrice:
          changes.minPrice !== undefined ? changes.minPrice : priceMin,
        maxPrice:
          changes.maxPrice !== undefined ? changes.maxPrice : priceMax,
        inStock:
          changes.inStock !== undefined
            ? changes.inStock
            : stockOnly
              ? "true"
              : "",
      };

      if (merged.q) urlParams.set("q", merged.q as string);
      if (merged.sort && merged.sort !== "score desc")
        urlParams.set("sort", merged.sort as string);
      if (merged.page && merged.page !== "1")
        urlParams.set("page", merged.page as string);
      if (merged.minPrice) urlParams.set("minPrice", merged.minPrice as string);
      if (merged.maxPrice) urlParams.set("maxPrice", merged.maxPrice as string);
      if (merged.inStock === "true") urlParams.set("inStock", "true");

      const catList = Array.isArray(merged.category)
        ? merged.category
        : merged.category
          ? [merged.category as string]
          : [];
      catList.forEach((c) => urlParams.append("category", c));

      const brandList = Array.isArray(merged.brand)
        ? merged.brand
        : merged.brand
          ? [merged.brand as string]
          : [];
      brandList.forEach((b) => urlParams.append("brand", b));

      return `/?${urlParams.toString()}`;
    },
    [q, sortBy, pageNum, activeCats, activeBrands, priceMin, priceMax, stockOnly]
  );

  const queryString = params.toString();

  // fetches results from our search api
  const loadResults = useCallback(async () => {
    setIsLoading(true);
    setErrMsg("");
    try {
      const resp = await fetch(`/api/search?${queryString}`);
      const body = await resp.json();
      if (!resp.ok) {
        setErrMsg(body.error || "Search failed");
        setApiData(body);
      } else {
        setApiData(body);
      }
    } catch {
      setErrMsg("Failed to connect to search service");
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  // re-fetch whenever url params change
  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const onSearch = (term: string) => {
    nav.push(makeUrl({ q: term, page: "1" }));
  };

  const onSortChange = (newSort: string) => {
    nav.push(makeUrl({ sort: newSort, page: "1" }));
  };

  const onPageSwitch = (pg: number) => {
    nav.push(makeUrl({ page: String(pg) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onCatToggle = (cat: string) => {
    const updated = activeCats.includes(cat)
      ? activeCats.filter((c) => c !== cat)
      : [...activeCats, cat];
    nav.push(makeUrl({ category: updated, page: "1" }));
  };

  const onBrandToggle = (brand: string) => {
    const updated = activeBrands.includes(brand)
      ? activeBrands.filter((b) => b !== brand)
      : [...activeBrands, brand];
    nav.push(makeUrl({ brand: updated, page: "1" }));
  };

  const onStockToggle = () => {
    nav.push(makeUrl({ inStock: stockOnly ? "" : "true", page: "1" }));
  };

  const onPriceUpdate = (lo: string, hi: string) => {
    nav.push(makeUrl({ minPrice: lo, maxPrice: hi, page: "1" }));
  };

  const resetFilters = () => {
    nav.push(makeUrl({
      category: [],
      brand: [],
      minPrice: "",
      maxPrice: "",
      inStock: "",
      page: "1",
    }));
  };

  // extract what we need from the api response
  const catFacets: FacetEntry[] = apiData?.facets?.category || [];
  const brandFacets: FacetEntry[] = apiData?.facets?.brand || [];
  const hitCount = apiData?.totalResults || 0;
  const products = apiData?.results || [];
  const hlData = apiData?.highlighting || {};
  const lastPage = apiData?.totalPages || 0;

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">N</span>
            <h1>NexaFind</h1>
            <span className="logo-badge">Solr Powered</span>
          </div>
          <SearchBar initialQuery={q} onSearch={onSearch} />
        </div>
      </header>

      <main className="main-layout">
        <button
          className="mobile-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          ☰ Filters
          {(activeCats.length > 0 || activeBrands.length > 0 || stockOnly) && (
            <span className="filter-badge">
              {activeCats.length + activeBrands.length + (stockOnly ? 1 : 0)}
            </span>
          )}
        </button>

        <div className={`facet-sidebar ${showFilters ? "open" : ""}`}>
          <FacetPanel
            categoryFacets={catFacets}
            brandFacets={brandFacets}
            selectedCategories={activeCats}
            selectedBrands={activeBrands}
            inStock={stockOnly}
            minPrice={priceMin}
            maxPrice={priceMax}
            onToggleCategory={onCatToggle}
            onToggleBrand={onBrandToggle}
            onToggleInStock={onStockToggle}
            onPriceChange={onPriceUpdate}
            onClearAll={resetFilters}
          />
        </div>

        <div className="results-area">
          <div className="results-header">
            <p className="results-count">
              {isLoading ? (
                "Discovering products..."
              ) : errMsg ? (
                <span className="error-text">⚠ {errMsg}</span>
              ) : (
                <>
                  Showing <strong>{hitCount}</strong> product
                  {hitCount !== 1 ? "s" : ""}
                  {q && (
                    <>
                      {" "}for <strong>&ldquo;{q}&rdquo;</strong>
                    </>
                  )}
                </>
              )}
            </p>
            <SortDropdown currentSort={sortBy} onSortChange={onSortChange} />
          </div>

          {isLoading ? (
            <div className="results-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line medium" />
                </div>
              ))}
            </div>
          ) : products.length === 0 && !errMsg ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h2>Nothing found</h2>
              <p>Try different keywords or loosen your filters</p>
            </div>
          ) : (
            <div className="results-grid">
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  highlighting={hlData[item.id]}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={pageNum}
            totalPages={lastPage}
            onPageChange={onPageSwitch}
          />
        </div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="loading-screen">
          <span className="logo-icon spin">N</span>
          <p>Loading NexaFind...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
