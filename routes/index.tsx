import { Handlers, PageProps } from "$fresh/server.ts";

import {
  deletePlayer,
  loadPlayers,
  type Player,
  trackPlayer,
} from "@/utils/steam.ts";

import { redirect } from "@/utils/http.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const handler: Handlers<Deno.KvEntry<Player>[]> = {
  async GET(req, ctx) {
    const players = await loadPlayers();

    return ctx.render(players);
  },
  async DELETE(req, ctx) {
    const form = await req.formData();
    const newTrackedPlayer = z.string().length(17);
    const id = newTrackedPlayer.parse(form.get("steamid64"));

    console.log("hi");

    await deletePlayer(id);

    return redirect("/");
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const newTrackedPlayer = z.string().length(17);
    const id = newTrackedPlayer.parse(form.get("steamid64"));

    await trackPlayer(id);

    return redirect("/");
  },
};

function isBanned(player: Player): boolean {
  return player.bans.VACBanned ||
    player.bans.NumberOfGameBans != 0 ||
    player.bans.NumberOfVACBans != 0;
}

export default function Home(props: PageProps<Deno.KvEntry<Player>[]>) {
  return (
    <>
      <main className="container-fluid">
        <h1>Steam Account Tracker</h1>

        <form method="POST">
          <fieldset role="group">
            <input
              name="steamid64"
              required
              minLength={17}
              maxLength={17}
              placeholder="SteamID64 of player"
            />
            <button type="submit">Track</button>
          </fieldset>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {props.data.sort((
            a,
            b,
          ) => (Number(isBanned(b.value)) - Number(isBanned(a.value)))).map((
            player,
          ) => (
            <article>
              <div className="flex flex-row gap-2 items-center">
                <img src={player.value.summary.avatar} alt="" srcset="" />
                {isBanned(player.value) && (
                  <span class="text-red-500">BANNED</span>
                )}
                <span>
                  {player.value.summary.personaname}
                </span>
              </div>

              <div className="flex flex-row gap-2 flex-wrap">
                <a
                  href={`https://steamid.uk/profile/${player.value.summary.steamid}`}
                >
                  steamid.uk
                </a>
                <a
                  href={player.value.summary.profileurl}
                >
                  steam community
                </a>
              </div>

              {isBanned(player.value) && (
                <>
                  <div className="flex flex-row gap-4">
                    <span>
                      Game Bans: {player.value.bans.NumberOfGameBans}
                    </span>
                    <span>
                      Days Since Last Ban: {player.value.bans.DaysSinceLastBan}
                    </span>
                    <span>
                      VAC Banned: {player.value.bans.VACBanned ? "Yes" : "No"}
                      {player.value.bans.NumberOfVACBans != 0 &&
                        `(x${player.value.bans.NumberOfVACBans})`}
                    </span>
                  </div>
                </>
              )}

              <footer>
                <form method="POST" action="/delete">
                  <input
                    type="hidden"
                    name="steamid64"
                    value={player.value.summary.steamid}
                  />
                  <button type="submit">Delete</button>
                </form>
              </footer>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
