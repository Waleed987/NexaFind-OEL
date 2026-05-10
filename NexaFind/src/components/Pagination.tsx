"use client";

interface PageNavProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pg: number) => void;
}

// pagination component - shows page numbers with prev/next buttons
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PageNavProps) {
  if (totalPages <= 1) return null;

  // figure out which page numbers to show
  const pageNums: (number | string)[] = [];
  const range = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - range && i <= currentPage + range)
    ) {
      pageNums.push(i);
    } else if (pageNums[pageNums.length - 1] !== "...") {
      pageNums.push("...");
    }
  }

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Back
      </button>
      <div className="page-numbers">
        {pageNums.map((pg, idx) =>
          typeof pg === "string" ? (
            <span key={idx} className="page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={idx}
              className={`page-btn ${pg === currentPage ? "active" : ""}`}
              onClick={() => onPageChange(pg)}
            >
              {pg}
            </button>
          )
        )}
      </div>
      <button
        className="page-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>
    </div>
  );
}
