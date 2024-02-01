import { ScenesComposer } from "grammy-scenes"
import {BotContext} from "../bot.ts";
import {mainScene} from "./kandinsky.ts";


export const scenes = new ScenesComposer<BotContext>()
scenes.scene(mainScene)

