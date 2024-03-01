/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Event from "@/structures/Event.js";
import { ActivityType } from "discord.js";

export default new Event({
  event: "shardResume",
  run: async (client) => {
    function setStatus() {
      client.user?.setPresence({
        activities: [
          {
            type: ActivityType.Watching,
            name: `${client.guilds.cache.size} servers`,
            state: `${client.guilds.cache.size} servers`,
          },
        ],
      });
    }
    setStatus();
  },
});
