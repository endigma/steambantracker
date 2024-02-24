import { Handlers } from "$fresh/server.ts";

import { deletePlayer, type Player } from "@/utils/steam.ts";

import { redirect } from "@/utils/http.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const handler: Handlers<Deno.KvEntry<Player>[]> = {
  async POST(req, ctx) {
    const form = await req.formData();
    const newTrackedPlayer = z.string().length(17);
    const id = newTrackedPlayer.parse(form.get("steamid64"));

    await deletePlayer(id);

    return redirect("/");
  },
};
