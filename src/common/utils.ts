import LRUCache from "lru-cache";
import stringHash from "string-hash";

const hashTitlesCache = new LRUCache<Set<string>, string>({ max: 20 });

export function hashTitles(titles: Set<string>): string {
  if (hashTitlesCache.has(titles)) {
    return hashTitlesCache.get(titles)!;
  }

  let initial = 0;
  for (const title of titles) {
    initial ^= stringHash(title);
  }

  const ret = initial.toString(16);
  hashTitlesCache.set(titles, ret);
  return ret;
}
