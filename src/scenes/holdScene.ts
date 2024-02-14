import {Scene} from "grammy-scenes";
import {BotContext} from "../bot.ts";
import {SCENE} from "../types/models.ts";

export const hold = new Scene<BotContext>(SCENE.HOLD)

hold.label('HOLD').step(async (ctx) => {
    await ctx.reply('Из-за большого количества запросов наш бот перегружен. мы разбираемся с этим', {
        reply_markup: {
            remove_keyboard: true
        }
    })
})