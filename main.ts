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

function sleep(ms: number | undefined) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.cron("refresh players", "*/10 * * * *", async () => {
  const players = await loadPlayers();

  for (const player of players) {
    trackPlayer(player.value.summary.steamid);
    await sleep(250);
  }
});

await start(manifest, config);
