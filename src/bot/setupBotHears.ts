import {BotContext} from "../bot.ts";
import {Api, Bot, RawApi} from "grammy";
import {unknownCommandText} from "../scenes/sceneUtils.ts";
import {SceneFlavoredContext} from "grammy-scenes";

/**
 * Регистрируем слушатель события Hears тут
 * @param bot инстанс бота
 */
export const setupBotHearsListeners = (bot: Bot<BotContext, Api<RawApi>>) => {
    bot.hears(/\//i, async (ctx) => {
        await unknownCommandText(ctx as SceneFlavoredContext<BotContext, undefined>)
    })
}

