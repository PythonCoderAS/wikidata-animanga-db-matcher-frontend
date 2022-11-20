// eslint-disable-next-line no-shadow -- Bogus error with enums
export enum ItemType {
  anime,
  manga,
}

export const InstanceMapping: Map<ItemType, string[]> = new Map([
  // Obtained from https://www.wikidata.org/wiki/Property:P4086
  [
    ItemType.anime,
    [
      "Q63952888",
      "Q20650540",
      "Q220898",
      "Q1047299",
      "Q100269041",
      "Q11086742",
      "Q1107",
      "Q11424",
    ],
  ],
  // Obtained from https://www.wikidata.org/wiki/Property:P4087
  [
    ItemType.manga,
    [
      "Q21198342",
      "Q21202185",
      "Q1667921",
      "Q754669",
      "Q74262765",
      "Q747381",
      "Q8274",
      "Q562214",
      "Q114830535",
    ],
  ],
]);

export const instanceOfProperty = "P31";

export enum MangaProviders {
  myanimelist = "P4087",
  anilist = "P8731",
  mangadex = "P10589",
  mangaupdates = "P11149",
}

export const mangaProviderIDs: Map<MangaProviders, string> = new Map([
  [MangaProviders.myanimelist, "manga-myanimelist"],
  [MangaProviders.anilist, "manga-anilist"],
  [MangaProviders.mangadex, "manga-mangadex"],
  [MangaProviders.mangaupdates, "manga-mangaupdates"],
]);
