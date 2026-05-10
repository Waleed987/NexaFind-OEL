"use client";

interface SortControlProps {
  currentSort: string;
  onSortChange: (val: string) => void;
}

// all the ways you can sort results
const orderOptions = [
  { label: "Relevance", value: "score desc" },
  { label: "Price: Low to High", value: "price asc" },
  { label: "Price: High to Low", value: "price desc" },
  { label: "Top Rated", value: "rating desc" },
  { label: "Most Recent", value: "date_added desc" },
  { label: "Name: A to Z", value: "name_sort asc" },
];

export default function SortDropdown({
  currentSort,
  onSortChange,
}: SortControlProps) {
  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select" className="sort-label">
        Order by:
      </label>
      <select
        id="sort-select"
        className="sort-select"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {orderOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
