import { plainTextFromHtml } from "@/utils/html";

/** Keyword groups for shopper-facing category chips (inferred from listing copy). */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Antiques: ["antique", "antiques", "heirloom"],
  Vintage: ["vintage", "retro", "mid-century", "mid century"],
  Furniture: ["furniture", "sofa", "dresser", "table", "chair", "cabinet"],
  Jewelry: ["jewelry", "jewellery", "gold", "silver", "necklace", "ring", "watch"],
  Kitchenware: ["kitchen", "pyrex", "china", "dishes", "cookware", "glassware"],
  Tools: ["tools", "tool", "workshop", "garage", "hardware"],
  Collectibles: ["collectible", "collectibles", "memorabilia", "figurine"],
  Art: ["art", "artwork", "painting", "print", "sculpture"],
  Books: ["books", "records", "vinyl", "lp"],
  Electronics: ["electronics", "stereo", "camera", "computer"],
};

const FEATURED_FINDS: {
  label: string;
  keywords: string[];
}[] = [
  { label: "Mid-century furniture", keywords: ["mid-century", "mid century", "mcm"] },
  { label: "Costume jewelry", keywords: ["costume jewelry", "jewelry", "jewellery"] },
  { label: "Vintage instruments", keywords: ["guitar", "piano", "instrument", "vinyl", "records"] },
  { label: "Rare books", keywords: ["books", "book collection", "library"] },
  { label: "Shop tools", keywords: ["tools", "workshop", "garage"] },
  { label: "Kitchen treasures", keywords: ["pyrex", "kitchen", "china", "glassware"] },
  { label: "Art & decor", keywords: ["art", "artwork", "painting", "decor"] },
  { label: "Antiques", keywords: ["antique", "antiques"] },
];

function normalizedHaystack(description: string | null | undefined): string {
  return plainTextFromHtml(description).toLowerCase();
}

export function inferSaleCategories(description: string | null | undefined): string[] {
  const haystack = normalizedHaystack(description);
  if (!haystack) return [];

  const matched: string[] = [];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) {
      matched.push(category);
    }
  }
  return matched.slice(0, 6);
}

export function inferFeaturedFinds(description: string | null | undefined): string[] {
  const haystack = normalizedHaystack(description);
  if (!haystack) return [];

  const matched: string[] = [];
  for (const item of FEATURED_FINDS) {
    if (item.keywords.some((kw) => haystack.includes(kw))) {
      matched.push(item.label);
    }
  }
  return matched.slice(0, 6);
}

/** Short emotional intro when description is long enough to summarize. */
export function saleAboutIntro(description: string | null | undefined): string | null {
  const plain = plainTextFromHtml(description);
  if (plain.length < 80) return null;

  const firstSentence = plain.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (!firstSentence || firstSentence.length < 40) return null;
  return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
}
