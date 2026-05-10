"use client";

// product card component - displays a single product with its details

interface CardProps {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    brand: string;
    price: number;
    rating: number;
    in_stock: boolean;
    tags: string[];
  };
  highlighting?: {
    name?: string[];
    description?: string[];
  };
}

// emoji icons for each product category
const catEmojis: Record<string, string> = {
  Electronics: "⚡",
  Clothing: "👕",
  "Home & Kitchen": "🏠",
  Sports: "🏅",
  Books: "📚",
  Beauty: "✨",
};

// converts numeric rating to star characters
function getStarDisplay(score: number) {
  const filled = Math.floor(score);
  const hasHalf = score % 1 >= 0.5;
  const output = [];
  for (let i = 0; i < filled; i++) output.push("★");
  if (hasHalf) output.push("½");
  while (output.length < 5) output.push("☆");
  return output.join("");
}

export default function ProductCard({
  product,
  highlighting,
}: CardProps) {
  // use highlighted version if solr returned one, otherwise use raw text
  const titleHtml =
    highlighting?.name?.[0] || product.name;
  const descHtml =
    highlighting?.description?.[0] ||
    (product.description?.length > 150
      ? product.description.slice(0, 150) + "..."
      : product.description);
  const emoji = catEmojis[product.category] || "📦";

  return (
    <div className="product-card">
      <div className="product-card-header">
        <span className="category-badge">
          {emoji} {product.category}
        </span>
        <span
          className={`stock-badge ${product.in_stock ? "in-stock" : "out-of-stock"}`}
        >
          {product.in_stock ? "● Available" : "○ Sold Out"}
        </span>
      </div>
      
      <div className="product-details">
        <div className="product-main-info">
          <h3
            className="product-name"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
          <p className="product-brand">by {product.brand}</p>
        </div>
        
        <p
          className="product-description"
          dangerouslySetInnerHTML={{ __html: descHtml }}
        />
        
        <div className="product-footer">
          <span className="product-price">Rs. {product.price?.toLocaleString()}</span>
          <span className="product-rating" title={`${product.rating} out of 5`}>
            <span className="stars">{getStarDisplay(product.rating)}</span>
            <span className="rating-num">{product.rating}</span>
          </span>
          
          {product.tags && product.tags.length > 0 && (
            <div className="product-tags">
              {(Array.isArray(product.tags)
                ? product.tags.slice(0, 3)
                : String(product.tags).split(",").slice(0, 3)
              ).map((t, idx) => (
                <span key={idx} className="tag">
                  {String(t).trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
