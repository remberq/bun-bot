import {Api, Bot, GrammyError, HttpError, RawApi} from "grammy";
import {BotContext} from "../bot.ts";

/**
 * Устанавливаем перехват ошибок
 * @param bot инстанс бота
 */
export const setupBotCatchListener = (bot: Bot<BotContext, Api<RawApi>>) => {
    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`Error while handling update ${ctx.update.update_id}:`);
        const e = err.error;
        if (e instanceof GrammyError) {
            console.error("Error in request:", e.description);
        } else if (e instanceof HttpError) {
            console.error("Could not contact Telegram:", e);
        } else {
            // @ts-ignore
            console.error("Unknown error:", e?.message);
        }
    });
}