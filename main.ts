/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
import { loadPlayers, trackPlayer } from "@/utils/steam.ts";

Deno.cron("sample cron", "*/10 * * * *", async () => {
  const players = await loadPlayers();

  for (const player of players) {
    trackPlayer(player.value.summary.steamid);
  }
});

await start(manifest, config);
