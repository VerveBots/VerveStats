import { ClientEvents } from "discord.js";
import Client from "@/structures/Client.js";
import IEvent from "@/interfaces/IEvent.js";

export default class Event<K extends keyof ClientEvents> implements IEvent<K> {
  public event: K;
  public run: (client: Client, ...args: ClientEvents[K]) => any;

  constructor(options: IEvent<K>) {
    this.event = options.event;
    this.run = options.run;
    return this;
  }
}
