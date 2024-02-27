import Client from "@/structures/Client.js";
import { ClientEvents } from "discord.js";

interface IEvent<K extends keyof ClientEvents> {
  event: K;
  run: (client: Client, ...args: ClientEvents[K]) => any;
}
export default IEvent;
