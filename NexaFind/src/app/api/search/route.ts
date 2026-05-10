import { NextRequest, NextResponse } from "next/server";
import { createQueryUrl, extractFacets } from "@/lib/solr";

// handles search requests from the frontend
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "*:*";
  const category = searchParams.getAll("category");
  const brand = searchParams.getAll("brand");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") || "";
  const sort = searchParams.get("sort") || "score desc";
  const page = searchParams.get("page") || "1";
  const perPage = 12;

  const solrUrl = createQueryUrl({
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sort,
    page,
    rows: perPage,
  });

  try {
    const resp = await fetch(solrUrl, { cache: "no-store" });
    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: "Solr request failed", details: errText },
        { status: 502 }
      );
    }

    const payload = await resp.json();
    const docs = payload.response?.docs || [];
    const totalHits = payload.response?.numFound || 0;
    const hlData = payload.highlighting || {};
    const rawFacets = payload.facet_counts?.facet_fields || {};

    return NextResponse.json({
      results: docs,
      totalResults: totalHits,
      page: parseInt(page),
      totalPages: Math.ceil(totalHits / perPage),
      highlighting: hlData,
      facets: {
        category: extractFacets(rawFacets, "category"),
        brand: extractFacets(rawFacets, "brand"),
      },
    });
  } catch (err) {
    console.error("couldnt connect to solr:", err);
    return NextResponse.json(
      {
        error: "Cannot connect to Solr. Make sure Solr is running on port 8983.",
        results: [],
        totalResults: 0,
        page: 1,
        totalPages: 0,
        highlighting: {},
        facets: { category: [], brand: [] },
      },
      { status: 503 }
    );
  }
}
