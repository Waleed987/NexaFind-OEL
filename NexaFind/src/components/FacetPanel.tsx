"use client";

import { FacetEntry } from "@/types";

interface FilterPanelProps {
  categoryFacets: FacetEntry[];
  brandFacets: FacetEntry[];
  selectedCategories: string[];
  selectedBrands: string[];
  inStock: boolean;
  minPrice: string;
  maxPrice: string;
  onToggleCategory: (cat: string) => void;
  onToggleBrand: (brand: string) => void;
  onToggleInStock: () => void;
  onPriceChange: (min: string, max: string) => void;
  onClearAll: () => void;
}

// sidebar filter panel - handles category, brand, price and stock filters
export default function FacetPanel({
  categoryFacets,
  brandFacets,
  selectedCategories,
  selectedBrands,
  inStock,
  minPrice,
  maxPrice,
  onToggleCategory,
  onToggleBrand,
  onToggleInStock,
  onPriceChange,
  onClearAll,
}: FilterPanelProps) {
  const anyFilterActive =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    inStock ||
    minPrice ||
    maxPrice;

  return (
    <aside className="facet-panel">
      <div className="facet-header">
        <h2>Refine Results</h2>
        {anyFilterActive && (
          <button className="clear-filters-btn" onClick={onClearAll}>
            Reset All
          </button>
        )}
      </div>

      {/* filter by category */}
      <div className="facet-section">
        <h3 className="facet-title">Category</h3>
        <div className="facet-list">
          {categoryFacets.map((item) => (
            <label key={item.value} className="facet-item">
              <input
                type="checkbox"
                checked={selectedCategories.includes(item.value)}
                onChange={() => onToggleCategory(item.value)}
              />
              <span className="facet-label">{item.value}</span>
              <span className="facet-count">{item.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* filter by brand */}
      <div className="facet-section">
        <h3 className="facet-title">Brand</h3>
        <div className="facet-list">
          {brandFacets.map((item) => (
            <label key={item.value} className="facet-item">
              <input
                type="checkbox"
                checked={selectedBrands.includes(item.value)}
                onChange={() => onToggleBrand(item.value)}
              />
              <span className="facet-label">{item.value}</span>
              <span className="facet-count">{item.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* price range filter */}
      <div className="facet-section">
        <h3 className="facet-title">Price Range</h3>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min Rs."
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="price-input"
            min="0"
          />
          <span className="price-dash">—</span>
          <input
            type="number"
            placeholder="Max Rs."
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="price-input"
            min="0"
          />
        </div>
      </div>

      {/* stock availability toggle */}
      <div className="facet-section">
        <label className="facet-item stock-toggle">
          <input
            type="checkbox"
            checked={inStock}
            onChange={onToggleInStock}
          />
          <span className="facet-label">Available Only</span>
        </label>
      </div>
    </aside>
  );
}
