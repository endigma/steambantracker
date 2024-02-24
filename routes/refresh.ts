import { Handlers } from "$fresh/server.ts";
import { loadPlayers } from "@/utils/steam.ts";
import { trackPlayer } from "@/utils/steam.ts";
import { redirect } from "@/utils/http.ts";

export const handler: Handlers = {
  async POST(_req, _ctx) {
    const players = await loadPlayers();

    for (const player of players) {
      trackPlayer(player.value.summary.steamid);
    }

    return redirect("/");
  },
};
