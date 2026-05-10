// solr connection config - change these if your solr is on a diff port
const SOLR_HOST = process.env.SOLR_URL || "http://localhost:8983/solr";
const CORE_NAME = process.env.SOLR_COLLECTION || "products";

// builds the full url for querying solr with all our filters
export function createQueryUrl(opts: {
  q?: string;
  category?: string[];
  brand?: string[];
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: string;
  rows?: number;
}): string {
  const {
    q = "*:*",
    category = [],
    brand = [],
    minPrice,
    maxPrice,
    inStock,
    sort = "score desc",
    page = "1",
    rows = 12,
  } = opts;

  const offset = (parseInt(page) - 1) * rows;
  const endpoint = new URL(`${SOLR_HOST}/${CORE_NAME}/select`);

  // if user typed something, use edismax for better matching
  if (q && q !== "*:*") {
    endpoint.searchParams.set("defType", "edismax");
    endpoint.searchParams.set("qf", "name^3 description tags^2 brand category");
    // add wildcard for single words so it matches partial terms
    const queryText = q.includes(" ") ? q : `${q}*`;
    endpoint.searchParams.set("q", queryText);
  } else {
    endpoint.searchParams.set("q", "*:*");
  }

  endpoint.searchParams.set("wt", "json");
  endpoint.searchParams.set("start", String(offset));
  endpoint.searchParams.set("rows", String(rows));
  endpoint.searchParams.set("sort", sort);

  // turn on highlighting so matched words show up bold
  endpoint.searchParams.set("hl", "true");
  endpoint.searchParams.set("hl.fl", "name,description");
  endpoint.searchParams.set("hl.simple.pre", "<mark>");
  endpoint.searchParams.set("hl.simple.post", "</mark>");
  endpoint.searchParams.set("hl.fragsize", "200");

  // enable facets for the sidebar filters
  endpoint.searchParams.set("facet", "true");
  endpoint.searchParams.append("facet.field", "category");
  endpoint.searchParams.append("facet.field", "brand");
  endpoint.searchParams.set("facet.mincount", "0");
  endpoint.searchParams.set("facet.limit", "200"); // Ensure all categories are shown

  // apply any active filters
  if (category.length > 0) {
    const catFilter = category.map((c) => `"${c}"`).join(" OR ");
    endpoint.searchParams.append("fq", `category:(${catFilter})`);
  }
  if (brand.length > 0) {
    const brandFilter = brand.map((b) => `"${b}"`).join(" OR ");
    endpoint.searchParams.append("fq", `brand:(${brandFilter})`);
  }
  if (minPrice || maxPrice) {
    const lo = minPrice || "*";
    const hi = maxPrice || "*";
    endpoint.searchParams.append("fq", `price:[${lo} TO ${hi}]`);
  }
  if (inStock === "true") {
    endpoint.searchParams.append("fq", "in_stock:true");
  }

  return endpoint.toString();
}

// builds url for autocomplete suggestions
export function createSuggestUrl(input: string): string {
  const endpoint = new URL(`${SOLR_HOST}/${CORE_NAME}/suggest`);
  endpoint.searchParams.set("suggest", "true");
  endpoint.searchParams.set("suggest.dictionary", "mySuggester");
  endpoint.searchParams.set("suggest.q", input);
  endpoint.searchParams.set("suggest.count", "8");
  endpoint.searchParams.set("wt", "json");
  return endpoint.toString();
}

// takes the weird solr facet array format and turns it into nice objects
export function extractFacets(
  rawFacets: Record<string, (string | number)[]> | undefined,
  fieldName: string
): { value: string; count: number }[] {
  if (!rawFacets || !rawFacets[fieldName]) return [];
  const flat = rawFacets[fieldName];
  const parsed: { value: string; count: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) {
    parsed.push({ value: flat[i] as string, count: flat[i + 1] as number });
  }
  return parsed;
}
