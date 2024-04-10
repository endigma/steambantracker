export interface PlayerBans {
  SteamId: string;
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfVACBans: number;
  DaysSinceLastBan: number;
  NumberOfGameBans: number;
  EconomyBan: string;
}

export interface PlayerSummary {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  commentpermission: number;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  personastate: number;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
}

export type Player = {
  bans: PlayerBans;
  summary: PlayerSummary;
};

const kv = await Deno.openKv(Deno.env.get("DB_LOCATION"));

export async function loadPlayers(): Promise<Deno.KvEntry<Player>[]> {
  const iter = await kv.list<Player>({ prefix: ["player"] });
  const players = [];
  for await (const res of iter) players.push(res);
  return players;
}

export async function deletePlayer(id: string) {
  await kv.delete(["player", id]);
}

export async function trackPlayer(id: string): Promise<string> {
  const ok = await kv
    .set(["player", id], {
      bans: (await GetPlayerBans([id]))[0],
      summary: (await GetPlayerSummaries([id]))[0],
    });

  if (!ok) throw new Error("kv error");

  return id;
}

export async function GetPlayerSummaries(
  ids: string[],
): Promise<PlayerSummary[]> {
  const response = await fetch(
    steamApiRequest("ISteamUser/GetPlayerSummaries/v1", {
      key: Deno.env.get("STEAM_API_KEY")!,
      steamids: ids.join(","),
    }),
  );

  if (!response || !response.ok) {
    console.error(response);
    throw new Error("steam api error");
  }

  const data = await response.json();

  return data.response.players.player as PlayerSummary[];
}

export async function GetPlayerBans(ids: string[]): Promise<PlayerBans[]> {
  const response = await fetch(
    steamApiRequest("ISteamUser/GetPlayerBans/v1", {
      key: Deno.env.get("STEAM_API_KEY")!,
      steamids: ids.join(","),
    }),
  );

  if (!response.ok) {
    throw new Error("steam api error");
  }

  return (await response.json()).players as PlayerBans[];
}

function steamApiRequest(
  endpoint: string,
  params: Record<string, string>,
): Request {
  return new Request(
    `https://api.steampowered.com/${endpoint}?${new URLSearchParams(
      params,
    )}`,
  );
}
