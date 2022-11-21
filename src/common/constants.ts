// eslint-disable-next-line no-shadow -- Bogus error with enums
export enum ItemType {
  anime = "Anime",
  manga = "Manga",
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

export interface Provider {
  property: number;
  title: string;
  id: string;
  // A URL with a placeholder "$1" for the ID.
  format: string;
}

export const ProviderData: Map<ItemType, Provider[]> = new Map();
ProviderData.set(ItemType.anime, []);

ProviderData.set(ItemType.manga, [
  {
    property: 4087,
    title: "MyAnimeList",
    id: "manga-myanimelist",
    format: "https://myanimelist.net/manga/$1",
  },
  {
    property: 8731,
    title: "AniList",
    id: "manga-anilist",
    format: "https://anilist.co/manga/$1",
  },
  {
    property: 10589,
    title: "MangaDex",
    id: "manga-mangadex",
    format: "https://mangadex.org/title/$1",
  },
  {
    property: 11149,
    title: "MangaUpdates",
    id: "manga-mangaupdates",
    format: "https://www.mangaupdates.com/series/$1",
  },
]);
