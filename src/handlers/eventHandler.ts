import { ClientEvents } from "discord.js";
import fs from "fs/promises";
import Client from "@/structures/Client.js";
import Event from "@/structures/Event.js";
async function eventHandler(client: Client) {
  const dirs = await fs.readdir("./dist/events");

  dirs.forEach(async (dir) => {
    const files = await fs.readdir(`./dist/events/${dir}`);

    files.forEach(async (file: string) => {
      const eventFile: Event<keyof ClientEvents> = await import(
        `../events/${dir}/${file}`
      ).then((imported) => imported.default);
      const { event } = eventFile;
      client.logger.log({
        level: "info",
        message: `[EVENTS] Loaded a file: ${file}`,
      });

      try {
        client.on(event, (...args: ClientEvents[typeof event]) =>
          eventFile.run(client, ...args)
        );
      } catch (err) {
        console.error(err);
      }
    });
  });
}

export default eventHandler;
