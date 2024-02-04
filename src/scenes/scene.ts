import { ScenesComposer } from "grammy-scenes"
import {BotContext} from "../bot.ts";
import {kandinskyScene} from "./kandinsky.ts";
import {gigaChatScene} from "./gigachat.ts";

export const scenes = new ScenesComposer<BotContext>()
scenes.scene(kandinskyScene)
scenes.scene(gigaChatScene)

