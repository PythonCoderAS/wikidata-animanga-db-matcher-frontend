import LRUCache from "lru-cache";
import { useEffect } from "react";
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

export function resetOnChange<CheckVal, ResetVal>(value_to_check_for: CheckVal, function_to_reset: (val: ResetVal) => unknown, value_to_reset_to: ResetVal){
  return useEffect(() => {
    function_to_reset(value_to_reset_to);
  }, [value_to_check_for])
}

export function resetAllOnChange<CheckVal, ResetVal>(value_to_check_for: CheckVal, ...resets: [((val: ResetVal) => unknown), ResetVal][]){
  return useEffect(() => {
    for (const [reset, value] of resets) {
      reset(value);
    }
  }, [value_to_check_for])
}
