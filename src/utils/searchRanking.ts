export type ResultKind = "song" | "artist" | "album" | "playlist";

export type Ranked = { item: any; kind: ResultKind; score: number };

const KIND_BONUS: Record<ResultKind, number> = {
  song: 0.3,
  artist: 0.2,
  album: 0.1,
  playlist: 0,
};

const toArray = (value: any) =>
  Array.isArray(value) ? value : value ? [value] : [];

const decode = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export const normalize = (value: any) =>
  decode(String(value ?? ""))
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9\u0900-\u097f\u0a00-\u0a7f]+/g, " ")
    .trim();

type Query = { text: string; tokens: string[] };

const makeQuery = (raw: string): Query => {
  const text = normalize(raw);
  return { text, tokens: text ? text.split(" ") : [] };
};

const dice = (a: string, b: string) => {
  if (a.length < 2 || b.length < 2) return 0;
  const map = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const g = a.slice(i, i + 2);
    map.set(g, (map.get(g) ?? 0) + 1);
  }
  let hits = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const g = b.slice(i, i + 2);
    const count = map.get(g) ?? 0;
    if (count > 0) {
      map.set(g, count - 1);
      hits++;
    }
  }
  return (2 * hits) / (a.length + b.length - 2);
};

const textScore = (value: any, q: Query) => {
  const n = normalize(value);
  if (!n || !q.text) return 0;
  if (n === q.text) return 100;

  const lengthPenalty = Math.min(10, (n.length - q.text.length) / 5);

  if (n.startsWith(q.text)) return 88 - lengthPenalty;
  if ((" " + n + " ").includes(" " + q.text + " ")) return 76 - lengthPenalty;
  if (n.includes(q.text)) return 62 - lengthPenalty;

  const nTokens = n.split(" ");
  let covered = 0;
  q.tokens.forEach((t) => {
    if (nTokens.includes(t)) covered += 1;
    else if (nTokens.some((x) => x.startsWith(t))) covered += 0.8;
    else if (n.includes(t)) covered += 0.5;
  });

  const tokenScore = (covered / q.tokens.length) * 58;
  const fuzzy = dice(n, q.text) * 45;

  return Math.max(tokenScore, fuzzy);
};

const artistNamesOf = (item: any): string[] => {
  const names = [
    ...toArray(item?.artists?.primary),
    ...toArray(item?.artists?.featured),
  ]
    .map((a: any) => a?.name)
    .filter(Boolean);

  if (names.length > 0) return names;

  return typeof item?.primaryArtists === "string"
    ? item.primaryArtists.split(",").map((s: string) => s.trim())
    : [];
};

const bestOf = (names: string[], q: Query) =>
  names.reduce((best, name) => Math.max(best, textScore(name, q)), 0);

const scoreSong = (song: any, q: Query) => {
  const names = artistNamesOf(song);
  const byName = textScore(song?.name, q);
  const byArtist = bestOf(names, q) * 0.6;
  const byAlbum = textScore(song?.album?.name, q) * 0.4;
  const combined = textScore(`${song?.name} ${names.join(" ")}`, q) * 0.9;
  return Math.max(byName, byArtist, byAlbum, combined);
};

const scoreAlbum = (album: any, q: Query) => {
  const byName = textScore(album?.name, q);
  const byArtist = bestOf(artistNamesOf(album), q) * 0.6;
  return Math.max(byName, byArtist);
};

const rank = (
  items: any[],
  kind: ResultKind,
  scorer: (item: any) => number,
  penalty = 0,
): Ranked[] =>
  items
    .map((item, index) => ({
      item,
      kind,
      score: scorer(item) - penalty - index * 0.01 + KIND_BONUS[kind],
    }))
    .sort((a, b) => b.score - a.score);

export const rankSearchResults = (data: any, rawQuery: string) => {
  const q = makeQuery(rawQuery);

  const songs = rank(toArray(data?.songs), "song", (s) => scoreSong(s, q));

  const mainArtists = rank(toArray(data?.artists), "artist", (a) =>
    textScore(a?.name, q),
  );
  const similarArtists = rank(
    toArray(data?.artists?.similarArtists),
    "artist",
    (a) => textScore(a?.name, q),
    20,
  );

  const seen = new Set<string>();
  const artists = [...mainArtists, ...similarArtists].filter((r) => {
    const id = r.item?.id;
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const albums = rank(toArray(data?.albums), "album", (a) =>
    scoreAlbum(a, q),
  );
  const playlists = rank(toArray(data?.playlists), "playlist", (p) =>
    textScore(p?.name, q),
  );

  const lists: Record<ResultKind, Ranked[]> = {
    song: songs,
    artist: artists,
    album: albums,
    playlist: playlists,
  };

  const kinds = (Object.keys(lists) as ResultKind[])
    .filter((kind) => lists[kind].length > 0)
    .sort((a, b) => lists[b][0].score - lists[a][0].score);

  const top = kinds.length > 0 ? lists[kinds[0]][0] : null;

  return { top, kinds, lists };
};