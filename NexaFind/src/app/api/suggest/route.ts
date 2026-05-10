import { NextRequest, NextResponse } from "next/server";
import { createSuggestUrl } from "@/lib/solr";

// returns autocomplete suggestions as user types
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("q") || "";

  // dont bother if they typed less than 2 chars
  if (input.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const solrUrl = createSuggestUrl(input);

  try {
    const resp = await fetch(solrUrl, { cache: "no-store" });
    if (resp.ok) {
      const payload = await resp.json();
      const suggestData = payload.suggest?.mySuggester?.[input];
      const matches: string[] = [];

      if (suggestData?.suggestions && suggestData.suggestions.length > 0) {
        for (const item of suggestData.suggestions) {
          matches.push(item.term);
        }
        return NextResponse.json({ suggestions: matches });
      }
    }

    // if the suggest handler didnt work, fall back to a basic name search
    const SOLR_HOST = process.env.SOLR_URL || "http://localhost:8983/solr";
    const CORE_NAME = process.env.SOLR_COLLECTION || "products";
    const fallbackUrl = `${SOLR_HOST}/${CORE_NAME}/select?defType=edismax&qf=name&q=${encodeURIComponent(input)}*&wt=json&rows=8&fl=name`;
    
    const fallbackResp = await fetch(fallbackUrl, { cache: "no-store" });
    if (fallbackResp.ok) {
      const payload = await fallbackResp.json();
      const productNames = (payload.response?.docs || []).map(
        (doc: { name: string | string[] }) => Array.isArray(doc.name) ? doc.name[0] : doc.name
      );
      // filter out duplicate names
      const unique = Array.from(new Set(productNames));
      return NextResponse.json({ suggestions: unique });
    }
    
    return NextResponse.json({ suggestions: [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
