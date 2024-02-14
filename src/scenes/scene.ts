import { ScenesComposer } from "grammy-scenes"
import {BotContext} from "../bot.ts";
import {kandinskyScene} from "./kandinsky.ts";
import {gigaChatScene} from "./gigachat.ts";
import {eventScene} from "./eventScene.ts";
import {getCardsScene} from "./getCardsScene.ts";
import {hold} from "./holdScene.ts";

export const scenes = new ScenesComposer<BotContext>()
scenes.scene(kandinskyScene)
scenes.scene(gigaChatScene)
scenes.scene(eventScene)
scenes.scene(getCardsScene)
scenes.scene(hold)

